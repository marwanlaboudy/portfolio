#!/usr/bin/env python3
"""
Process user video frames:
1. Detect face landmarks, eye gaze blendshapes, and head pose.
2. Stabilize face center and crop to square 320x320 WebP.
3. Compute normalized (x, y) coordinates for cursor tracking.
4. Export manifest.json for the Next.js FaceLooker component.
"""

import glob
import json
import math
import os
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from tqdm import tqdm

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

BASE_DIR = Path(__file__).resolve().parent
RAW_FRAMES_DIR = BASE_DIR / "raw_frames"
OUTPUT_DIR = BASE_DIR / "public" / "gaze_frames"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = BASE_DIR / "face_landmarker.task"
if not MODEL_PATH.exists():
    print(f"Error: {MODEL_PATH} not found.")
    sys.exit(1)

# Initialize MediaPipe Face Landmarker
base_options = python.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=True,
    output_facial_transformation_matrixes=True,
    num_faces=1
)
detector = vision.FaceLandmarker.create_from_options(options)

frame_files = sorted(glob.glob(str(RAW_FRAMES_DIR / "frame_*.jpg")))
print(f"Found {len(frame_files)} frames to process.")

records = []
all_centers = []

print("Phase 1: Analyzing face landmarks and gaze directions...")
for fpath in tqdm(frame_files, desc="Analyzing"):
    img_bgr = cv2.imread(fpath)
    if img_bgr is None:
        continue
    h, w, _ = img_bgr.shape
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
    
    detection = detector.detect(mp_img)
    if not detection.face_landmarks or not detection.face_blendshapes:
        continue
    
    lm = detection.face_landmarks[0]
    bs = {b.category_name: b.score for b in detection.face_blendshapes[0]}
    
    # Eye Gaze Blendshapes
    look_right = (bs.get('eyeLookOutRight', 0.0) + bs.get('eyeLookInLeft', 0.0)) / 2.0
    look_left = (bs.get('eyeLookOutLeft', 0.0) + bs.get('eyeLookInRight', 0.0)) / 2.0
    gaze_x = look_right - look_left
    
    look_up = (bs.get('eyeLookUpLeft', 0.0) + bs.get('eyeLookUpRight', 0.0)) / 2.0
    look_down = (bs.get('eyeLookDownLeft', 0.0) + bs.get('eyeLookDownRight', 0.0)) / 2.0
    gaze_y = look_up - look_down
    
    # Head Pose Euler Angles
    mat = detection.facial_transformation_matrixes[0]
    yaw = math.atan2(mat[1][0], mat[0][0])
    pitch = math.atan2(-mat[2][0], math.sqrt(mat[2][1]**2 + mat[2][2]**2))
    
    # Combined Gaze Vector (eye look + head angle)
    raw_x = gaze_x * 0.75 + yaw * 0.45
    raw_y = gaze_y * 0.75 + pitch * 0.45
    
    # Face bounding box center
    xs = [pt.x * w for pt in lm]
    ys = [pt.y * h for pt in lm]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    cx = (min_x + max_x) / 2.0
    cy = (min_y + max_y) / 2.0
    face_w = max_x - min_x
    face_h = max_y - min_y
    
    all_centers.append((cx, cy, max(face_w, face_h)))
    
    records.append({
        'path': fpath,
        'raw_x': raw_x,
        'raw_y': raw_y,
        'cx': cx,
        'cy': cy,
        'w': w,
        'h': h,
    })

print(f"Successfully tracked {len(records)} valid face frames.")

# Calculate global stabilized crop parameters
avg_cx = float(np.median([c[0] for c in all_centers]))
avg_cy = float(np.median([c[1] for c in all_centers]))
avg_size = float(np.median([c[2] for c in all_centers]))

# Make crop box generous around the head (1.8x face size)
crop_dim = int(avg_size * 1.9)
# Ensure square crop fits within image boundaries
crop_dim = min(crop_dim, int(records[0]['w']))
half_dim = crop_dim // 2

# Global crop box
left = max(0, min(records[0]['w'] - crop_dim, int(avg_cx - half_dim)))
top = max(0, min(records[0]['h'] - crop_dim, int(avg_cy - half_dim * 1.05)))

# Normalize gaze coordinates to range [-1.0 .. 1.0]
all_rx = np.array([r['raw_x'] for r in records])
all_ry = np.array([r['raw_y'] for r in records])

# Use 2nd and 98th percentiles to avoid outlier clamping
min_x, max_x = np.percentile(all_rx, 2), np.percentile(all_rx, 98)
min_y, max_y = np.percentile(all_ry, 2), np.percentile(all_ry, 98)

print(f"Gaze X range: [{min_x:.3f} .. {max_x:.3f}]")
print(f"Gaze Y range: [{min_y:.3f} .. {max_y:.3f}]")

print("Phase 2: Cropping, resizing to 320x320, and saving WebP frames...")
manifest_frames = []

for idx, r in enumerate(tqdm(records, desc="Saving WebP")):
    # Normalized x and y in [-1 .. 1]
    norm_x = float(np.clip(2.0 * (r['raw_x'] - min_x) / (max_x - min_x) - 1.0, -1.0, 1.0))
    # Invert y so positive is up, negative is down (matching screen coordinates)
    norm_y = float(np.clip(2.0 * (r['raw_y'] - min_y) / (max_y - min_y) - 1.0, -1.0, 1.0))
    
    fname = f"frame_{idx:04d}.webp"
    out_file = OUTPUT_DIR / fname
    
    # Load and crop
    img_bgr = cv2.imread(r['path'])
    cropped = img_bgr[top:top+crop_dim, left:left+crop_dim]
    
    # Resize to 320x320
    resized = cv2.resize(cropped, (320, 320), interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    
    # Save as high quality WebP
    pil_img = Image.fromarray(rgb)
    pil_img.save(out_file, format="WEBP", quality=85, method=6)
    
    manifest_frames.append({
        'id': idx,
        'file': f"/gaze_frames/{fname}",
        'x': round(norm_x, 4),
        'y': round(-norm_y, 4), # Screen Y: positive down
    })

# Find the frame closest to center (x=0, y=0)
distances = [f['x']**2 + f['y']**2 for f in manifest_frames]
center_idx = int(np.argmin(distances))
center_frame = manifest_frames[center_idx]['file']
print(f"Center frame identified: {center_frame} (id={center_idx})")

manifest_data = {
    'total': len(manifest_frames),
    'centerFrame': center_frame,
    'frames': manifest_frames,
}

manifest_path = OUTPUT_DIR / "manifest.json"
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest_data, f, indent=2)

print(f"Done! Manifest saved to {manifest_path}")
print(f"Total {len(manifest_frames)} real frames processed and ready for FaceLooker!")
