#!/usr/bin/env python3
"""
Rebuild Gaze Dataset exclusively from the user's trimmed video (raw_video/user_gaze_trimmed.mp4):
- Uses ONLY the first rotation (no mixing with the second rotation).
- Removes the studio gray background cleanly (including between hair curls) into 640x640 RGBA WebP.
- Uses FFmpeg minterpolate (60fps) on each non-overlapping directional sweep.
- Piecewise-normalizes (x, y) around the neutral center frame (0.0, 0.0).
"""

import glob
import json
import shutil
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

BASE_DIR = Path(__file__).resolve().parent
VIDEO_PATH = BASE_DIR / "raw_video" / "user_gaze_trimmed.mp4"
FFMPEG_BIN = BASE_DIR / "bin" / "ffmpeg"
MODEL_PATH = BASE_DIR / ".venv" / "face_landmarker.task"
SEG_PATH = BASE_DIR / ".venv" / "selfie_segmenter.tflite"
OUTPUT_DIR = BASE_DIR / "public" / "gaze_frames"
TMP_OUT_DIR = Path("/tmp/gaze_frames_staging")

TMP_RAW = Path("/tmp/raw_trimmed_24fps")
TMP_CROPPED = Path("/tmp/cropped_trimmed_24fps")
TMP_INTERP = Path("/tmp/interp_trimmed_segments")

# 1. Extract all native frames from raw_video/user_gaze_trimmed.mp4
shutil.rmtree(TMP_RAW, ignore_errors=True)
TMP_RAW.mkdir(parents=True, exist_ok=True)
subprocess.run([
    str(FFMPEG_BIN), "-y", "-i", str(VIDEO_PATH),
    "-q:v", "2", str(TMP_RAW / "frame_%04d.jpg")
], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

raw_files = sorted(glob.glob(str(TMP_RAW / "frame_*.jpg")))
print(f"Extracted {len(raw_files)} native frames from {VIDEO_PATH.name}.")

# Initialize MediaPipe FaceLandmarker & SelfieSegmenter
detector = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path=str(MODEL_PATH)),
    output_face_blendshapes=True,
    output_facial_transformation_matrixes=True,
    num_faces=1
))

segmenter = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=python.BaseOptions(model_asset_path=str(SEG_PATH)),
    output_confidence_masks=True,
    output_category_mask=False
))

def clean_cutout_bgra(img_bgr):
    """Remove studio gray backdrop with de-haloing around curly hair and soft bottom fade."""
    h, w, _ = img_bgr.shape
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)
    res = segmenter.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb.astype(np.uint8)))
    m = res.confidence_masks[0].numpy_view().reshape(h, w).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 1.0)
    m = np.clip((m - 0.42) / 0.38, 0.0, 1.0)

    core = cv2.erode((m > 0.95).astype(np.uint8), np.ones((25, 25), np.uint8), iterations=1)
    edge_zone = (core == 0).astype(np.float32)
    yy = np.arange(h, dtype=np.float32)[:, None] / h
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
    out_bgr = (img_bgr.astype(np.float32) * (1.0 - edge_semi) + defringed_bgr * edge_semi).astype(np.uint8)

    return np.dstack([out_bgr, (m * 255).astype(np.uint8)])

# 2. Compute stabilized square crop box
sample_centers = []
for fpath in raw_files[::4]:
    img = cv2.imread(fpath)
    h, w, _ = img.shape
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    res = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
    if res.face_landmarks:
        lm = res.face_landmarks[0]
        xs = [pt.x * w for pt in lm]
        ys = [pt.y * h for pt in lm]
        cx = (min(xs) + max(xs)) / 2.0
        cy = (min(ys) + max(ys)) / 2.0
        size = max(max(xs) - min(xs), max(ys) - min(ys))
        sample_centers.append((cx, cy, size, w, h))

avg_cx = float(np.median([c[0] for c in sample_centers]))
avg_cy = float(np.median([c[1] for c in sample_centers]))
avg_size = float(np.median([c[2] for c in sample_centers]))
W, H = sample_centers[0][3], sample_centers[0][4]

crop_dim = min(int(avg_size * 1.95), W)
left = max(0, min(W - crop_dim, int(avg_cx - crop_dim / 2)))
top = max(0, min(H - crop_dim, int(avg_cy - crop_dim * 0.54)))

shutil.rmtree(TMP_CROPPED, ignore_errors=True)
TMP_CROPPED.mkdir(parents=True, exist_ok=True)

for idx, fpath in enumerate(raw_files):
    img = cv2.imread(fpath)
    cropped = img[top:top+crop_dim, left:left+crop_dim]
    resized = cv2.resize(cropped, (640, 640), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(TMP_CROPPED / f"f_{idx:04d}.jpg"), resized, [int(cv2.IMWRITE_JPEG_QUALITY), 96])

# 3. Non-overlapping segments from ONLY raw_video/user_gaze_trimmed.mp4 (0..211):
# - seg0_center: neutral center anchor frames (0..5)
# - seg1_left: Center -> Far Left (19..53) (excludes return pass 54..74 so zero duplicate overlap)
# - seg2_right: Center -> Far Right (75..80 + 86..108, bridging the 5-frame blink)
# - seg3_diag_tr: Far Right -> Top-Right (109..138, stops before Top so it doesn't overlap seg4_vertical's Top)
# - seg4_vertical: Top (Up) -> Center -> Bottom (Down) (166..211)
max_idx = len(raw_files) - 1
segments = [
    ("seg0_center", [i for i in range(0, 6) if i <= max_idx]),
    ("seg1_left", [i for i in range(19, 54) if i <= max_idx]),
    ("seg2_right", [i for i in (list(range(75, 81)) + list(range(86, 109))) if i <= max_idx]),
    ("seg3_diag_tr", [i for i in range(109, 139) if i <= max_idx]),
    ("seg4_vertical", [i for i in range(166, max_idx + 1)]),
]

shutil.rmtree(TMP_INTERP, ignore_errors=True)
TMP_INTERP.mkdir(parents=True, exist_ok=True)

interpolated_files = []
print("Interpolating clean segments from trimmed video at 60fps...")
for seg_id, (seg_name, frame_indices) in enumerate(segments):
    seg_in = TMP_INTERP / f"{seg_name}_in"
    seg_out = TMP_INTERP / f"{seg_name}_out"
    seg_in.mkdir(parents=True, exist_ok=True)
    seg_out.mkdir(parents=True, exist_ok=True)

    for i, f_idx in enumerate(frame_indices):
        shutil.copy(TMP_CROPPED / f"f_{f_idx:04d}.jpg", seg_in / f"in_{i:04d}.jpg")

    if seg_name == "seg0_center":
        for i, f_idx in enumerate(frame_indices[:3]):
            out_p = seg_out / f"out_{i:04d}.jpg"
            shutil.copy(TMP_CROPPED / f"f_{f_idx:04d}.jpg", out_p)
            interpolated_files.append((seg_id, out_p))
    else:
        subprocess.run([
            str(FFMPEG_BIN), "-y", "-framerate", "24",
            "-i", str(seg_in / "in_%04d.jpg"),
            "-vf", "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1",
            "-q:v", "2", str(seg_out / "out_%04d.jpg")
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        for p in sorted(seg_out.glob("out_*.jpg")):
            interpolated_files.append((seg_id, p))

print(f"Generated {len(interpolated_files)} motion-interpolated frames from trimmed video.")

# 4. Analyze 3D gaze of every generated frame
analyzed = []
for seg_id, fpath in interpolated_files:
    img_bgr = cv2.imread(str(fpath))
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    res = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
    if not res.face_landmarks or not res.face_blendshapes:
        continue

    mat = res.facial_transformation_matrixes[0]
    lm = res.face_landmarks[0]
    bs = {b.category_name: b.score for b in res.face_blendshapes[0]}

    fwd_x = float(mat[0][2])
    fwd_y = float(-mat[1][2])

    ear_mid_x = (lm[234].x + lm[454].x) / 2.0
    ear_mid_y = (lm[234].y + lm[454].y) / 2.0
    face_w = abs(lm[454].x - lm[234].x) + 1e-6
    face_h = abs(lm[152].y - lm[10].y) + 1e-6
    nose_dx = float((lm[1].x - ear_mid_x) / face_w)
    nose_dy = float((lm[1].y - ear_mid_y) / face_h)

    look_img_left = (bs.get("eyeLookOutRight", 0.0) + bs.get("eyeLookInLeft", 0.0)) / 2.0
    look_img_right = (bs.get("eyeLookOutLeft", 0.0) + bs.get("eyeLookInRight", 0.0)) / 2.0
    eye_dx = float(look_img_right - look_img_left)

    look_u = (bs.get("eyeLookUpLeft", 0.0) + bs.get("eyeLookUpRight", 0.0)) / 2.0
    look_d = (bs.get("eyeLookDownLeft", 0.0) + bs.get("eyeLookDownRight", 0.0)) / 2.0
    eye_dy = float(look_d - look_u)

    blink = float((bs.get("eyeBlinkLeft", 0.0) + bs.get("eyeBlinkRight", 0.0)) / 2.0)
    if blink > 0.42 and fwd_y < 0.15:
        continue

    analyzed.append({
        "seg_id": seg_id,
        "path": fpath,
        "fwd_x": fwd_x,
        "fwd_y": fwd_y,
        "nose_dx": nose_dx,
        "nose_dy": nose_dy,
        "eye_dx": eye_dx,
        "eye_dy": eye_dy,
    })

center_refs = [a for a in analyzed if a["seg_id"] == 0]
c_fx = float(np.mean([a["fwd_x"] for a in center_refs]))
c_fy = float(np.mean([a["fwd_y"] for a in center_refs]))
c_nx = float(np.mean([a["nose_dx"] for a in center_refs]))
c_ny = float(np.mean([a["nose_dy"] for a in center_refs]))
c_ex = float(np.mean([a["eye_dx"] for a in center_refs]))
c_ey = float(np.mean([a["eye_dy"] for a in center_refs]))

for a in analyzed:
    dfx = a["fwd_x"] - c_fx
    dfy = a["fwd_y"] - c_fy
    dnx = a["nose_dx"] - c_nx
    dny = a["nose_dy"] - c_ny
    dex = a["eye_dx"] - c_ex
    dey = a["eye_dy"] - c_ey
    eye_y_w = 0.18 if dfy > -0.05 else 0.0
    a["gx"] = 0.70 * dfx + 0.22 * dnx + 0.08 * dex
    a["gy"] = 0.65 * dfy + 0.35 * dny + eye_y_w * dey

all_gx = np.array([a["gx"] for a in analyzed])
all_gy = np.array([a["gy"] for a in analyzed])
min_gx, max_gx = float(np.percentile(all_gx, 1.5)), float(np.percentile(all_gx, 98.5))
min_gy, max_gy = float(np.percentile(all_gy, 1.5)), float(np.percentile(all_gy, 98.5))

# 5. Export to staging dir first so public/gaze_frames is never empty during build
shutil.rmtree(TMP_OUT_DIR, ignore_errors=True)
TMP_OUT_DIR.mkdir(parents=True, exist_ok=True)

manifest_frames = []
for idx, a in enumerate(analyzed):
    nx = float(np.clip(a["gx"] / abs(min_gx) if a["gx"] < 0 else a["gx"] / abs(max_gx), -1.0, 1.0))
    ny = float(np.clip(a["gy"] / abs(min_gy) if a["gy"] < 0 else a["gy"] / abs(max_gy), -1.0, 1.0))
    fname = f"frame_{idx:04d}.webp"
    out_webp = TMP_OUT_DIR / fname
    img_bgr = cv2.imread(str(a["path"]))
    bgra = clean_cutout_bgra(img_bgr)
    cv2.imwrite(str(out_webp), bgra, [int(cv2.IMWRITE_WEBP_QUALITY), 86])

    manifest_frames.append({
        "id": idx,
        "seg": a["seg_id"],
        "file": f"/gaze_frames/{fname}",
        "x": round(nx, 4),
        "y": round(ny, 4),
    })

center_entry = min(manifest_frames, key=lambda f: f["x"] ** 2 + f["y"] ** 2)
center_entry["x"] = 0.0
center_entry["y"] = 0.0

with open(TMP_OUT_DIR / "manifest.json", "w", encoding="utf-8") as f:
    json.dump({
        "total": len(manifest_frames),
        "centerFrame": center_entry["file"],
        "centerFrameId": center_entry["id"],
        "frames": manifest_frames,
    }, f, indent=2)

# Atomically swap staging dir into public/gaze_frames
shutil.rmtree(OUTPUT_DIR, ignore_errors=True)
shutil.move(str(TMP_OUT_DIR), str(OUTPUT_DIR))
print(f"SUCCESS! Exported {len(manifest_frames)} single-rotation transparent frames. Center: {center_entry['file']}")
