#!/usr/bin/env python3
"""
High-precision Gaze Dataset Builder:
1. Extracts native frames and crops a stabilized, well-proportioned square around the head.
2. Selects clean, blink-free, non-overlapping directional segments.
3. Uses FFmpeg motion-compensated interpolation (minterpolate mci/aobmc/vsbmc) to generate ~600 ultra-smooth frames.
4. Runs MediaPipe 3D FaceLandmarker on every interpolated frame to measure exact 3D head forward vector + nose + eye gaze.
5. Piecewise-normalizes (x, y) anchored strictly at the neutral center frame (0.0, 0.0).
6. Exports WebP frames + manifest.json + verification grid.
"""

import glob
import json
import math
import os
import shutil
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw
from tqdm import tqdm

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

BASE_DIR = Path(__file__).resolve().parent
VIDEO_PATH = BASE_DIR / "raw_video" / "user_gaze.mp4"
FFMPEG_BIN = BASE_DIR / "bin" / "ffmpeg"
MODEL_PATH = BASE_DIR / ".venv" / "face_landmarker.task"
OUTPUT_DIR = BASE_DIR / "public" / "gaze_frames"

TMP_RAW = Path("/tmp/raw_24fps")
TMP_CROPPED = Path("/tmp/cropped_24fps")
TMP_INTERP = Path("/tmp/interp_segments")

# 1. Ensure raw 24fps frames exist
if not TMP_RAW.exists() or len(list(TMP_RAW.glob("frame_*.jpg"))) < 350:
    TMP_RAW.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        str(FFMPEG_BIN), "-y", "-i", str(VIDEO_PATH),
        "-q:v", "2", str(TMP_RAW / "frame_%04d.jpg")
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

raw_files = sorted(glob.glob(str(TMP_RAW / "frame_*.jpg")))
print(f"Loaded {len(raw_files)} raw 24fps frames.")

# Initialize MediaPipe FaceLandmarker
base_options = python.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=True,
    output_facial_transformation_matrixes=True,
    num_faces=1
)
detector = vision.FaceLandmarker.create_from_options(options)

# 2. Compute stabilized global square crop box from sample frames
sample_centers = []
for fpath in raw_files[::5]:
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

# Generous square crop (1.95x face mesh size) shifted slightly up so hair & chin both have clean margin
crop_dim = min(int(avg_size * 1.95), W)
left = max(0, min(W - crop_dim, int(avg_cx - crop_dim / 2)))
top = max(0, min(H - crop_dim, int(avg_cy - crop_dim * 0.54)))
print(f"Stabilized crop: dim={crop_dim}, left={left}, top={top}")

# 3. Crop and resize all 358 native frames to 320x320
shutil.rmtree(TMP_CROPPED, ignore_errors=True)
TMP_CROPPED.mkdir(parents=True, exist_ok=True)

for idx, fpath in enumerate(tqdm(raw_files, desc="Cropping 24fps frames")):
    img = cv2.imread(fpath)
    cropped = img[top:top+crop_dim, left:left+crop_dim]
    resized = cv2.resize(cropped, (320, 320), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(TMP_CROPPED / f"f_{idx:04d}.jpg"), resized, [int(cv2.IMWRITE_JPEG_QUALITY), 96])

# 4. Define clean, blink-free segments (0-indexed frame ranges)
# Note: Segment 2 bridges the 5-frame blink (#81..#85) seamlessly via minterpolate!
segments = [
    ("seg0_center", list(range(0, 6)) + list(range(332, 344))),
    ("seg1_left", list(range(19, 55))),
    ("seg2_right", list(range(75, 81)) + list(range(86, 111))),
    ("seg3_diag_tr", list(range(117, 145))),
    ("seg4_vertical", list(range(166, 212))),
    ("seg5_circle_sw", list(range(212, 247))),
    ("seg6_circle_nw", list(range(253, 279))),
    ("seg7_circle_ne_se", list(range(289, 314))),
    ("seg8_circle_se", list(range(214, 243))),
]

shutil.rmtree(TMP_INTERP, ignore_errors=True)
TMP_INTERP.mkdir(parents=True, exist_ok=True)

interpolated_files = []

print("Running FFmpeg motion-compensated frame interpolation (minterpolate) on clean segments...")
for seg_id, (seg_name, frame_indices) in enumerate(segments):
    seg_in = TMP_INTERP / f"{seg_name}_in"
    seg_out = TMP_INTERP / f"{seg_name}_out"
    seg_in.mkdir(parents=True, exist_ok=True)
    seg_out.mkdir(parents=True, exist_ok=True)

    for i, f_idx in enumerate(frame_indices):
        src_img = TMP_CROPPED / f"f_{f_idx:04d}.jpg"
        dst_img = seg_in / f"in_{i:04d}.jpg"
        if seg_name == "seg8_circle_se":
            # Horizontally mirror the clean SW sweep to provide full SE (Bottom-Right) coverage
            pil_m = Image.open(src_img).transpose(Image.FLIP_LEFT_RIGHT)
            pil_m.save(dst_img, quality=96)
        else:
            shutil.copy(src_img, dst_img)

    if seg_name == "seg0_center":
        # No need to motion-interpolate static center anchor frames
        for i, f_idx in enumerate([335, 336, 338, 2, 3]):
            out_p = seg_out / f"out_{i:04d}.jpg"
            shutil.copy(TMP_CROPPED / f"f_{f_idx:04d}.jpg", out_p)
            interpolated_files.append((seg_id, out_p))
    else:
        # Interpolate 24fps -> 60fps using motion-compensated interpolation (mci + aobmc + vsbmc)
        subprocess.run([
            str(FFMPEG_BIN), "-y", "-framerate", "24",
            "-i", str(seg_in / "in_%04d.jpg"),
            "-vf", "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1",
            "-q:v", "2", str(seg_out / "out_%04d.jpg")
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        seg_generated = sorted(seg_out.glob("out_*.jpg"))
        for p in seg_generated:
            interpolated_files.append((seg_id, p))

print(f"Generated {len(interpolated_files)} motion-interpolated frames across {len(segments)} segments.")

# 5. Analyze every generated frame with MediaPipe FaceLandmarker
analyzed = []
for seg_id, fpath in tqdm(interpolated_files, desc="Analyzing 3D gaze"):
    img_bgr = cv2.imread(str(fpath))
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    res = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
    if not res.face_landmarks or not res.face_blendshapes:
        continue

    mat = res.facial_transformation_matrixes[0]
    lm = res.face_landmarks[0]
    bs = {b.category_name: b.score for b in res.face_blendshapes[0]}

    # 3D Head Forward vector in camera space:
    # mat[0][2]: negative = Left, positive = Right
    # -mat[1][2]: negative = Up, positive = Down
    fwd_x = float(mat[0][2])
    fwd_y = float(-mat[1][2])

    # Nose tip relative to ear/cheek midpoint (234 & 454)
    ear_mid_x = (lm[234].x + lm[454].x) / 2.0
    ear_mid_y = (lm[234].y + lm[454].y) / 2.0
    face_w = abs(lm[454].x - lm[234].x) + 1e-6
    face_h = abs(lm[152].y - lm[10].y) + 1e-6
    nose_dx = float((lm[1].x - ear_mid_x) / face_w)
    nose_dy = float((lm[1].y - ear_mid_y) / face_h)

    # Eye horizontal look (anatomical right = screen left, anatomical left = screen right)
    look_img_left = (bs.get("eyeLookOutRight", 0.0) + bs.get("eyeLookInLeft", 0.0)) / 2.0
    look_img_right = (bs.get("eyeLookOutLeft", 0.0) + bs.get("eyeLookInRight", 0.0)) / 2.0
    eye_dx = float(look_img_right - look_img_left)

    look_u = (bs.get("eyeLookUpLeft", 0.0) + bs.get("eyeLookUpRight", 0.0)) / 2.0
    look_d = (bs.get("eyeLookDownLeft", 0.0) + bs.get("eyeLookDownRight", 0.0)) / 2.0
    eye_dy = float(look_d - look_u)

    blink = float((bs.get("eyeBlinkLeft", 0.0) + bs.get("eyeBlinkRight", 0.0)) / 2.0)

    # Filter out any residual blink frame when head is not tilted down
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
        "blink": blink,
    })

print(f"Retained {len(analyzed)} clean, open-eye frames after blink check.")

# 6. Anchor (0, 0) strictly to the neutral center segment (seg_id == 0)
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

    # Only include downward eye gaze when head is not tilted up (avoids foreshortened eyelid artifact)
    eye_y_w = 0.18 if dfy > -0.05 else 0.0

    a["gx"] = 0.70 * dfx + 0.22 * dnx + 0.08 * dex
    a["gy"] = 0.65 * dfy + 0.35 * dny + eye_y_w * dey

# Piecewise normalization around 0.0 so Center (0, 0) is strictly (0.0, 0.0)
all_gx = np.array([a["gx"] for a in analyzed])
all_gy = np.array([a["gy"] for a in analyzed])

min_gx = float(np.percentile(all_gx, 1.5))
max_gx = float(np.percentile(all_gx, 98.5))
min_gy = float(np.percentile(all_gy, 1.5))
max_gy = float(np.percentile(all_gy, 98.5))

shutil.rmtree(OUTPUT_DIR, ignore_errors=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

manifest_frames = []
for idx, a in enumerate(tqdm(analyzed, desc="Exporting WebP frames")):
    nx = a["gx"] / abs(min_gx) if a["gx"] < 0 else a["gx"] / abs(max_gx)
    ny = a["gy"] / abs(min_gy) if a["gy"] < 0 else a["gy"] / abs(max_gy)
    nx = float(np.clip(nx, -1.0, 1.0))
    ny = float(np.clip(ny, -1.0, 1.0))

    fname = f"frame_{idx:04d}.webp"
    out_webp = OUTPUT_DIR / fname
    img_pil = Image.open(a["path"]).convert("RGB")
    img_pil.save(out_webp, format="WEBP", quality=85, method=6)

    manifest_frames.append({
        "id": idx,
        "seg": a["seg_id"],
        "file": f"/gaze_frames/{fname}",
        "x": round(nx, 4),
        "y": round(ny, 4),
    })

# Force frame 0 (from seg0_center) to be the exact centerFrame
center_frame_entry = min(manifest_frames, key=lambda f: f["x"] ** 2 + f["y"] ** 2)
center_frame_entry["x"] = 0.0
center_frame_entry["y"] = 0.0

manifest_data = {
    "total": len(manifest_frames),
    "centerFrame": center_frame_entry["file"],
    "centerFrameId": center_frame_entry["id"],
    "frames": manifest_frames,
}

with open(OUTPUT_DIR / "manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest_data, f, indent=2)

print(f"Exported {len(manifest_frames)} frames. Center frame: {center_frame_entry['file']} (id={center_frame_entry['id']})")

# 7. Create a 3x3 Visual Verification Grid for target directions:
# (-0.8, -0.8) Top-Left    | (0.0, -0.9) Top-Center    | (+0.8, -0.8) Top-Right
# (-0.9,  0.0) Mid-Left    | (0.0,  0.0) Dead-Center   | (+0.9,  0.0) Mid-Right
# (-0.7, +0.7) Bottom-Left | (0.0, +0.9) Bottom-Center | (+0.7, +0.4) Bottom-Right
targets = [
    (-0.75, -0.75, "TOP-LEFT"), (0.0, -0.95, "TOP (UP)"), (0.75, -0.75, "TOP-RIGHT"),
    (-0.95, 0.0, "LEFT"), (0.0, 0.0, "CENTER"), (0.95, 0.0, "RIGHT"),
    (-0.65, 0.65, "BOTTOM-LEFT"), (0.0, 0.95, "BOTTOM (DOWN)"), (0.65, 0.65, "BOTTOM-RIGHT"),
]

grid_img = Image.new("RGB", (3 * 240, 3 * 240))
draw = ImageDraw.Draw(grid_img)

for ti, (tx, ty, label) in enumerate(targets):
    best = min(manifest_frames, key=lambda f: (f["x"] - tx) ** 2 + (f["y"] - ty) ** 2)
    f_img = Image.open(BASE_DIR / "public" / best["file"].lstrip("/")).resize((240, 240))
    r, c = ti // 3, ti % 3
    grid_img.paste(f_img, (c * 240, r * 240))
    draw.rectangle([c * 240, r * 240, c * 240 + 235, r * 240 + 26], fill=(0, 0, 0))
    draw.text((c * 240 + 6, r * 240 + 6), f"{label}: #{best['id']} ({best['x']:+.2f},{best['y']:+.2f})", fill=(255, 230, 100))

grid_img.save("/tmp/verify_directions.jpg", quality=92)
print("Saved 3x3 directional verification grid to /tmp/verify_directions.jpg")
