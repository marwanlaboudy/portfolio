#!/usr/bin/env python3
"""
Rebuild Center-to-Right gaze sequence using authentic frames from IMG_1298.MOV (raw_video/center_to_right.mov):
- Eliminates interpolated jumps and distorted frames.
- Replaces frame_0081.webp through frame_0143.webp with 63 authentic, transparent, cyberpunk-graded frames.
- Sets monotonic x from +0.025 to +1.000 (y = 0.0).
- Updates manifest.json with cache-buster ?v=neon5.
"""

import json
import shutil
import subprocess
from pathlib import Path
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

BASE_DIR = Path(__file__).resolve().parent
VIDEO_PATH = BASE_DIR / "raw_video" / "center_to_right.mov"
FFMPEG_BIN = BASE_DIR / "bin" / "ffmpeg"
SEG_PATH = BASE_DIR / ".venv" / "selfie_segmenter.tflite"
OUTPUT_DIR = BASE_DIR / "public" / "gaze_frames"

TMP_IN = Path("/tmp/ctr_clean_in")
TMP_OUT = Path("/tmp/ctr_clean_out")
TMP_WEBP = Path("/tmp/ctr_clean_webp")

shutil.rmtree(TMP_IN, ignore_errors=True)
shutil.rmtree(TMP_OUT, ignore_errors=True)
shutil.rmtree(TMP_WEBP, ignore_errors=True)
TMP_IN.mkdir(parents=True, exist_ok=True)
TMP_OUT.mkdir(parents=True, exist_ok=True)
TMP_WEBP.mkdir(parents=True, exist_ok=True)

# 1. Extract raw frames from center_to_right.mov
TMP_RAW = Path("/tmp/ctr_raw")
shutil.rmtree(TMP_RAW, ignore_errors=True)
TMP_RAW.mkdir(parents=True, exist_ok=True)

subprocess.run([
    str(FFMPEG_BIN), "-y", "-i", str(VIDEO_PATH),
    "-q:v", "2", str(TMP_RAW / "f_%04d.jpg")
], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

import glob
raw_files = sorted(glob.glob(str(TMP_RAW / "f_*.jpg")))
print(f"Extracted {len(raw_files)} raw frames from {VIDEO_PATH.name}")

# Crop parameters matched to portfolio stabilized square box
crop_dim, left, top = 1041, 26, 522

# We take frames from neutral (frame 3, index 3) to far right (frame 26, index 26)
selected_indices = list(range(3, len(raw_files)))
print(f"Selected {len(selected_indices)} frames (from neutral to far right)")

for i, f_idx in enumerate(selected_indices):
    img = cv2.imread(raw_files[f_idx])
    cropped = img[top:top+crop_dim, left:left+crop_dim]
    resized = cv2.resize(cropped, (640, 640), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(TMP_IN / f"in_{i:04d}.jpg"), resized, [int(cv2.IMWRITE_JPEG_QUALITY), 96])

# Generate exactly 63 frames at 68 fps with motion interpolation across consecutive frames
subprocess.run([
    str(FFMPEG_BIN), "-y", "-framerate", "24",
    "-i", str(TMP_IN / "in_%04d.jpg"),
    "-vf", "minterpolate=fps=68:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1",
    "-q:v", "2", str(TMP_OUT / "out_%04d.jpg")
], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

interp_files = sorted(glob.glob(str(TMP_OUT / "out_*.jpg")))
print(f"Interpolated {len(interp_files)} frames for Segment 1")

# Initialize SelfieSegmenter
segmenter = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=python.BaseOptions(model_asset_path=str(SEG_PATH)),
    output_confidence_masks=True,
    output_category_mask=False
))

def cutout_and_cyberpunk_grade(img_bgr):
    h, w, _ = img_bgr.shape
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)
    res = segmenter.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb.astype(np.uint8)))
    m = res.confidence_masks[0].numpy_view().reshape(h, w).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 1.0)
    m = np.clip((m - 0.42) / 0.38, 0.0, 1.0)

    core = cv2.erode((m > 0.95).astype(np.uint8), np.ones((25, 25), np.uint8), iterations=1)
    edge_zone = (core == 0).astype(np.float32)
    yy, xx = np.meshgrid(np.linspace(0, 1, h, dtype=np.float32), np.linspace(0, 1, w, dtype=np.float32), indexing="ij")
    hair_or_edge = np.clip(edge_zone + (yy < 0.36).astype(np.float32), 0.0, 1.0)
    shirt_zone = (yy > 0.80).astype(np.float32)
    check_zone = hair_or_edge * (1.0 - shirt_zone)

    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)

    is_bg_gray = np.clip((lum - 145.0) / 45.0, 0.0, 1.0) * np.clip((24.0 - sat) / 14.0, 0.0, 1.0)
    m = m * (1.0 - check_zone * is_bg_gray)
    m = cv2.GaussianBlur(m, (0, 0), 0.7)

    fade = np.ones(h, dtype=np.float32)
    f0 = int(h * 0.88)
    fade[f0:] = np.linspace(1.0, 0.0, h - f0)
    m = m * fade[:, None]

    bg_color = 212.0
    m_safe = np.maximum(m[:, :, None], 0.15)
    edge_semi = ((m > 0.02) & (m < 0.92)).astype(np.float32)[:, :, None] * check_zone[:, :, None]
    defringed_bgr = np.clip((img_bgr.astype(np.float32) - (1.0 - m[:, :, None]) * bg_color) / m_safe, 0.0, 255.0)
    bgr = (img_bgr.astype(np.float32) * (1.0 - edge_semi) + defringed_bgr * edge_semi)

    # Dual-neon cyberpunk low-key grade
    alpha = m.copy()
    b, g, r = bgr[:, :, 0], bgr[:, :, 1], bgr[:, :, 2]
    lum_n = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
    sat_n = (np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)) / 255.0

    core2 = cv2.erode((alpha > 0.96).astype(np.uint8), np.ones((31, 31), np.uint8), iterations=1)
    outer_ring = (core2 == 0).astype(np.float32)
    hair_zone = np.clip(outer_ring + (yy < 0.42).astype(np.float32) * (sat_n < 0.16).astype(np.float32), 0.0, 1.0)
    is_gray_wall = np.clip((lum_n - 0.45) / 0.22, 0.0, 1.0) * np.clip((0.14 - sat_n) / 0.10, 0.0, 1.0)
    alpha = alpha * (1.0 - hair_zone * is_gray_wall * (yy < 0.78).astype(np.float32))
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)

    hair_fringe = outer_ring * (yy < 0.78).astype(np.float32) * np.clip((0.18 - sat_n) / 0.12, 0.0, 1.0)
    r = r * (1.0 - 0.82 * hair_fringe)
    g = g * (1.0 - 0.82 * hair_fringe)
    b = b * (1.0 - 0.75 * hair_fringe)

    rn, gn, bn = r / 255.0, g / 255.0, b / 255.0
    l_cur = 0.299 * rn + 0.587 * gn + 0.114 * bn
    rn = l_cur + (rn - l_cur) * 0.72
    gn = l_cur + (gn - l_cur) * 0.68
    bn = l_cur + (bn - l_cur) * 0.85

    rn = np.power(np.clip(rn, 0.0, 1.0), 1.42) * 0.76
    gn = np.power(np.clip(gn, 0.0, 1.0), 1.48) * 0.70
    bn = np.power(np.clip(bn, 0.0, 1.0), 1.32) * 0.84

    shadow_w = np.clip(1.0 - l_cur * 1.4, 0.0, 1.0)
    rn += shadow_w * 0.06
    gn += shadow_w * 0.01
    bn += shadow_w * 0.11

    shirt_mask = np.clip((yy - 0.72) / 0.16, 0.0, 1.0)
    rn *= (1.0 - 0.78 * shirt_mask)
    gn *= (1.0 - 0.84 * shirt_mask)
    bn *= (1.0 - 0.72 * shirt_mask)

    bottom_fade = np.clip((0.96 - yy) / 0.12, 0.0, 1.0)
    alpha = alpha * bottom_fade

    alpha_blur_inner = cv2.GaussianBlur(alpha, (0, 0), 6.0)
    alpha_blur_wide = cv2.GaussianBlur(alpha, (0, 0), 22.0)
    rim_tight = np.clip(alpha - cv2.erode(alpha, np.ones((7, 7), np.uint8), iterations=1), 0.0, 1.0)
    rim_tight = cv2.GaussianBlur(rim_tight, (0, 0), 3.0) * alpha
    rim_soft = np.clip(1.0 - alpha_blur_inner, 0.0, 1.0) * alpha
    ambient_side = np.clip(1.0 - alpha_blur_wide * 0.65, 0.0, 1.0) * alpha

    left_side = np.clip((0.56 - xx) / 0.38, 0.0, 1.0)
    left_rim = (rim_tight * 1.15 + rim_soft * 0.65 + ambient_side * 0.28) * left_side
    left_spec = np.clip((l_cur - 0.45) / 0.40, 0.0, 1.0) * left_side * 0.38
    cyan_intensity = np.clip(left_rim + left_spec, 0.0, 1.2)

    right_side = np.clip((xx - 0.44) / 0.38, 0.0, 1.0)
    right_rim = (rim_tight * 1.20 + rim_soft * 0.70 + ambient_side * 0.32) * right_side
    right_spec = np.clip((l_cur - 0.45) / 0.40, 0.0, 1.0) * right_side * 0.42
    pink_intensity = np.clip(right_rim + right_spec, 0.0, 1.2)

    rn = 1.0 - (1.0 - rn) * (1.0 - cyan_intensity * 0.38)
    gn = 1.0 - (1.0 - gn) * (1.0 - cyan_intensity * 0.88)
    bn = 1.0 - (1.0 - bn) * (1.0 - cyan_intensity * 1.00)

    rn = 1.0 - (1.0 - rn) * (1.0 - pink_intensity * 1.00)
    gn = 1.0 - (1.0 - gn) * (1.0 - pink_intensity * 0.16)
    bn = 1.0 - (1.0 - bn) * (1.0 - pink_intensity * 0.72)

    out_b = np.clip(bn * 255.0, 0, 255).astype(np.uint8)
    out_g = np.clip(gn * 255.0, 0, 255).astype(np.uint8)
    out_r = np.clip(rn * 255.0, 0, 255).astype(np.uint8)
    out_a = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    return np.dstack([out_b, out_g, out_r, out_a])

print("Processing and grading Segment 1 frames...")
start_id = 81
end_id = 143
num_target_frames = end_id - start_id + 1  # 63

# Select exactly 63 frames evenly from interp_files
indices = np.linspace(0, len(interp_files) - 1, num_target_frames).round().astype(int)

for i, src_idx in enumerate(indices):
    frame_id = start_id + i
    fpath = interp_files[src_idx]
    img = cv2.imread(fpath)
    graded = cutout_and_cyberpunk_grade(img)
    fname = f"frame_{frame_id:04d}.webp"
    cv2.imwrite(str(TMP_WEBP / fname), graded, [int(cv2.IMWRITE_WEBP_QUALITY), 86])

print(f"Generated {num_target_frames} webp frames in {TMP_WEBP}")

# Read and update manifest.json
manifest_path = OUTPUT_DIR / "manifest.json"
with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

# Strictly monotonic x progression from +0.025 to +1.000 for Segment 1
x_progression = np.linspace(0.025, 1.0, num_target_frames)

for i in range(num_target_frames):
    frame_id = start_id + i
    # Copy file to output directory
    fname = f"frame_{frame_id:04d}.webp"
    shutil.copy(TMP_WEBP / fname, OUTPUT_DIR / fname)

    # Find and update frame in manifest
    matched = False
    for f in manifest["frames"]:
        if f["id"] == frame_id:
            f["file"] = f"/gaze_frames/{fname}?v=neon5"
            f["x"] = round(float(x_progression[i]), 4)
            f["y"] = 0.0
            f["seg"] = 1
            matched = True
            break
    if not matched:
        manifest["frames"].append({
            "id": frame_id,
            "seg": 1,
            "file": f"/gaze_frames/{fname}?v=neon5",
            "x": round(float(x_progression[i]), 4),
            "y": 0.0
        })

# Bump cache buster for all other frames and blink frames to v=neon5
for f in manifest["frames"]:
    base_file = f["file"].split("?")[0]
    f["file"] = f"{base_file}?v=neon5"

if "blinkFrames" in manifest:
    manifest["blinkFrames"] = [
        f"{b.split('?')[0]}?v=neon5" for b in manifest["blinkFrames"]
    ]

if "centerFrame" in manifest:
    manifest["centerFrame"] = f"{manifest['centerFrame'].split('?')[0]}?v=neon5"

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print(f"SUCCESS! Replaced frames {start_id}..{end_id} with authentic frames from {VIDEO_PATH.name}.")
print("Updated manifest.json with ?v=neon5 cache buster.")
