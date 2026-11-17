#!/usr/bin/env python3
"""
Rebuild Right-to-Bottom-Right gaze sequence using authentic frames from IMG_1297.MP4 (raw_video/right_to_bottom_right.mp4):
- Starts at the exact far-right pose (x ~ 1.0, y ~ 0.0), matching the end of Segment 1.
- Sweeps continuously through the bottom-right quadrant (x ~ 0.5..0.8, y ~ 0.4..0.6) down to bottom-center (x ~ 0.0, y ~ 1.0).
- Applies stabilized cropping (crop_dim=1041, left=26, top=522 -> 640x640).
- Applies transparent background cutout and dual-neon cyberpunk grading.
- Sets monotonic coordinates and updates manifest.json with ?v=neon6.
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
VIDEO_PATH = BASE_DIR / "raw_video" / "right_to_bottom_right.mp4"
FFMPEG_BIN = BASE_DIR / "bin" / "ffmpeg"
MODEL_PATH = BASE_DIR / ".venv" / "face_landmarker.task"
SEG_PATH = BASE_DIR / ".venv" / "selfie_segmenter.tflite"
OUTPUT_DIR = BASE_DIR / "public" / "gaze_frames"

TMP_RAW = Path("/tmp/rtb_clean_raw")
TMP_WEBP = Path("/tmp/rtb_clean_webp")

shutil.rmtree(TMP_RAW, ignore_errors=True)
shutil.rmtree(TMP_WEBP, ignore_errors=True)
TMP_RAW.mkdir(parents=True, exist_ok=True)
TMP_WEBP.mkdir(parents=True, exist_ok=True)

# 1. Extract raw frames
subprocess.run([
    str(FFMPEG_BIN), "-y", "-i", str(VIDEO_PATH),
    "-q:v", "2", str(TMP_RAW / "f_%04d.jpg")
], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

import glob
raw_files = sorted(glob.glob(str(TMP_RAW / "f_*.jpg")))
print(f"Extracted {len(raw_files)} raw frames from {VIDEO_PATH.name}")

# Crop parameters matched to stabilized square box
crop_dim, left, top = 1041, 26, 522

# 2. Select 81 frames spanning from starting pose (far-right, frame 0) to bottom (frame 95)
num_target_frames = 81
start_id = 310
end_id = 390
selected_indices = np.linspace(0, 95, num_target_frames).round().astype(int)

# Detect face orientation for smooth normalized coordinate mapping
detector = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path=str(MODEL_PATH)),
    output_facial_transformation_matrixes=True,
    num_faces=1
))

def smooth_1d(arr, sigma=2.5):
    k = int(sigma * 4) | 1
    return cv2.GaussianBlur(np.asarray(arr, dtype=np.float32).reshape(-1, 1), (1, k), sigma).ravel()

fwd_xs, fwd_ys = [], []
for idx in selected_indices:
    img = cv2.imread(raw_files[idx])
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    res = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
    if res.facial_transformation_matrixes:
        mat = res.facial_transformation_matrixes[0]
        fwd_xs.append(float(mat[0][2]))
        fwd_ys.append(float(-mat[1][2]))
    else:
        # Fallback to previous value
        fwd_xs.append(fwd_xs[-1] if fwd_xs else 0.5)
        fwd_ys.append(fwd_ys[-1] if fwd_ys else 0.5)

min_fx, max_fx = min(fwd_xs), max(fwd_xs)
min_fy, max_fy = min(fwd_ys), max(fwd_ys)

norm_xs = np.clip((np.array(fwd_xs) - min_fx) / (max_fx - min_fx + 1e-6), 0.0, 1.0)
norm_ys = np.clip((np.array(fwd_ys) - min_fy) / (max_fy - min_fy + 1e-6), 0.0, 1.0)

s_xs = smooth_1d(norm_xs, sigma=2.5)
s_ys = smooth_1d(norm_ys, sigma=2.5)

# Strictly monotonic decreasing for x (from 1.000 to 0.000)
s_xs = np.linspace(1.0, 0.0, len(s_xs)) * 0.35 + s_xs * 0.65
s_xs = np.minimum.accumulate(s_xs)
s_xs = np.clip(s_xs, 0.0, 1.0)

# Strictly monotonic increasing for y (from 0.000 to 1.000)
s_ys = np.linspace(0.0, 1.0, len(s_ys)) * 0.35 + s_ys * 0.65
s_ys = np.maximum.accumulate(s_ys)
s_ys = np.clip(s_ys, 0.0, 1.0)

# Anchor endpoints exactly
s_xs[0] = 1.0000
s_ys[0] = 0.0000
s_xs[-1] = 0.0000
s_ys[-1] = 1.0000

# 3. Transparent cutout + cyberpunk grade
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

print("Processing and grading Segment 4 (Right -> Bottom-Right -> Bottom) frames...")
for i, src_idx in enumerate(selected_indices):
    frame_id = start_id + i
    raw_img = cv2.imread(raw_files[src_idx])
    cropped = raw_img[top:top+crop_dim, left:left+crop_dim]
    resized = cv2.resize(cropped, (640, 640), interpolation=cv2.INTER_AREA)
    graded = cutout_and_cyberpunk_grade(resized)
    fname = f"frame_{frame_id:04d}.webp"
    cv2.imwrite(str(TMP_WEBP / fname), graded, [int(cv2.IMWRITE_WEBP_QUALITY), 86])

print(f"Generated {num_target_frames} webp frames in {TMP_WEBP}")

# 4. Copy to public/gaze_frames/ and update manifest.json with ?v=neon6
manifest_path = OUTPUT_DIR / "manifest.json"
with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

for i in range(num_target_frames):
    frame_id = start_id + i
    fname = f"frame_{frame_id:04d}.webp"
    shutil.copy(TMP_WEBP / fname, OUTPUT_DIR / fname)

    # Update manifest frame
    matched = False
    for f in manifest["frames"]:
        if f["id"] == frame_id:
            f["file"] = f"/gaze_frames/{fname}?v=neon6"
            f["x"] = round(float(s_xs[i]), 4)
            f["y"] = round(float(s_ys[i]), 4)
            f["seg"] = 4
            matched = True
            break
    if not matched:
        manifest["frames"].append({
            "id": frame_id,
            "seg": 4,
            "file": f"/gaze_frames/{fname}?v=neon6",
            "x": round(float(s_xs[i]), 4),
            "y": round(float(s_ys[i]), 4)
        })

# Bump cache buster for all other frames and blink frames to ?v=neon6
for f in manifest["frames"]:
    base_file = f["file"].split("?")[0]
    f["file"] = f"{base_file}?v=neon6"

if "blinkFrames" in manifest:
    manifest["blinkFrames"] = [
        f"{b.split('?')[0]}?v=neon6" for b in manifest["blinkFrames"]
    ]

if "centerFrame" in manifest:
    manifest["centerFrame"] = f"{manifest['centerFrame'].split('?')[0]}?v=neon6"

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print(f"SUCCESS! Replaced Segment 4 frames ({start_id}..{end_id}) with authentic frames from {VIDEO_PATH.name}.")
print("Starting frame matches far-right (x=1.0, y=0.0). Ending frame matches bottom (x=0.0, y=1.0).")
print("Updated manifest.json with ?v=neon6 cache buster.")
