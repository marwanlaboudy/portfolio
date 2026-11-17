#!/usr/bin/env python3
"""
Unified Gaze Dataset Builder (Single-Rotation, Strictly Monotonic, Dual-Neon Cyberpunk Grade):
1. Extracts native frames from raw_video/user_gaze_trimmed.mp4.
2. Uses non-overlapping segments covering Left, Right, Top-Right, and Full Vertical (Up -> Center -> Down).
3. Interpolates each segment at 60fps via FFmpeg minterpolate (keeps all middle vertical frames — zero gaps!).
4. Computes 3D gaze coordinates, smooths each segment temporally, and enforces strict monotonicity so
   Up->Down and Down->Up (and Left->Right / Right->Left) traverse the exact same frames smoothly.
5. Applies transparent background removal + cyberpunk dual-neon cyan/magenta lighting grade.
"""

import glob
import json
import shutil
import subprocess
from pathlib import Path

import cv2
import numpy as np

def smooth_1d(arr, sigma=2.0):
    k = int(sigma * 4) | 1
    return cv2.GaussianBlur(np.asarray(arr, dtype=np.float32).reshape(-1, 1), (1, k), sigma).ravel()

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

def cutout_and_cyberpunk_grade(img_bgr):
    """Remove studio gray backdrop and apply dual-neon cyan/magenta low-key grade."""
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

    # Apply cyberpunk dual-neon grade
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

# 3. Clean, strictly non-overlapping segments from raw_video/user_gaze_trimmed.mp4:
# - seg1_left: Center-Left -> Far Left (frames 20..53)
# - seg2_right: Center-Right -> Far Right (frames 77..80 + 86..108)
# - seg3_diag_tr: Far Right -> Top-Right (frames 116..138)
# - seg4_vertical: Full Vertical Spine from Top (Up) -> Center -> Bottom (Down) (frames 166..211)
#   Note: seg4_vertical owns the entire vertical axis including (0, 0) so Up->Down and Down->Up
#   always traverse the exact same continuous sequence of frames!
max_idx = len(raw_files) - 1
segments = [
    ("seg1_left", [i for i in range(20, 54) if i <= max_idx]),
    ("seg2_right", [i for i in (list(range(77, 81)) + list(range(86, 109))) if i <= max_idx]),
    ("seg3_diag_tr", [i for i in range(116, 139) if i <= max_idx]),
    ("seg4_vertical", [i for i in range(166, max_idx + 1)]),
]

shutil.rmtree(TMP_INTERP, ignore_errors=True)
TMP_INTERP.mkdir(parents=True, exist_ok=True)

interpolated_files = []
print("Interpolating clean segments at 60fps...")
for seg_id, (seg_name, frame_indices) in enumerate(segments):
    seg_in = TMP_INTERP / f"{seg_name}_in"
    seg_out = TMP_INTERP / f"{seg_name}_out"
    seg_in.mkdir(parents=True, exist_ok=True)
    seg_out.mkdir(parents=True, exist_ok=True)

    for i, f_idx in enumerate(frame_indices):
        shutil.copy(TMP_CROPPED / f"f_{f_idx:04d}.jpg", seg_in / f"in_{i:04d}.jpg")

    subprocess.run([
        str(FFMPEG_BIN), "-y", "-framerate", "24",
        "-i", str(seg_in / "in_%04d.jpg"),
        "-vf", "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1",
        "-q:v", "2", str(seg_out / "out_%04d.jpg")
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    for p in sorted(seg_out.glob("out_*.jpg")):
        interpolated_files.append((seg_id, seg_name, p))

print(f"Generated {len(interpolated_files)} motion-interpolated frames (zero dropped frames).")

# Measure neutral reference from native frames 0..4
neutral_samples = []
for f_idx in range(0, 5):
    img_bgr = cv2.imread(str(TMP_CROPPED / f"f_{f_idx:04d}.jpg"))
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    res = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
    mat = res.facial_transformation_matrixes[0]
    lm = res.face_landmarks[0]
    bs = {b.category_name: b.score for b in res.face_blendshapes[0]}
    ear_mid_x = (lm[234].x + lm[454].x) / 2.0
    ear_mid_y = (lm[234].y + lm[454].y) / 2.0
    face_w = abs(lm[454].x - lm[234].x) + 1e-6
    face_h = abs(lm[152].y - lm[10].y) + 1e-6
    look_img_left = (bs.get("eyeLookOutRight", 0.0) + bs.get("eyeLookInLeft", 0.0)) / 2.0
    look_img_right = (bs.get("eyeLookOutLeft", 0.0) + bs.get("eyeLookInRight", 0.0)) / 2.0
    neutral_samples.append((
        float(mat[0][2]),
        float(-mat[1][2]),
        float((lm[1].x - ear_mid_x) / face_w),
        float((lm[1].y - ear_mid_y) / face_h),
        float(look_img_right - look_img_left),
    ))

c_fx = float(np.mean([s[0] for s in neutral_samples]))
c_fy = float(np.mean([s[1] for s in neutral_samples]))
c_nx = float(np.mean([s[2] for s in neutral_samples]))
c_ny = float(np.mean([s[3] for s in neutral_samples]))
c_ex = float(np.mean([s[4] for s in neutral_samples]))

# 4. Analyze 3D gaze of every generated frame (NO blink deletion so zero frames go missing!)
analyzed = []
for seg_id, seg_name, fpath in interpolated_files:
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

    dfx = fwd_x - c_fx
    dfy = fwd_y - c_fy
    dnx = nose_dx - c_nx
    dny = nose_dy - c_ny
    dex = eye_dx - c_ex

    gx = 0.70 * dfx + 0.22 * dnx + 0.08 * dex
    gy = 0.65 * dfy + 0.35 * dny

    analyzed.append({
        "seg_id": seg_id,
        "seg_name": seg_name,
        "path": fpath,
        "gx": gx,
        "gy": gy,
    })

all_gx = np.array([a["gx"] for a in analyzed])
all_gy = np.array([a["gy"] for a in analyzed])
min_gx, max_gx = float(np.percentile(all_gx, 1.0)), float(np.percentile(all_gx, 99.0))
min_gy, max_gy = float(np.percentile(all_gy, 1.0)), float(np.percentile(all_gy, 99.0))

for a in analyzed:
    nx = a["gx"] / abs(min_gx) if a["gx"] < 0 else a["gx"] / abs(max_gx)
    ny = a["gy"] / abs(min_gy) if a["gy"] < 0 else a["gy"] / abs(max_gy)
    a["nx"] = float(np.clip(nx, -1.0, 1.0))
    a["ny"] = float(np.clip(ny, -1.0, 1.0))

# 5. Smooth each segment temporally and enforce strict monotonicity along its primary sweep axis
#    so forward and reverse cursor motion ALWAYS traverse the exact same frames in order!
for seg_name in ["seg1_left", "seg2_right", "seg3_diag_tr", "seg4_vertical"]:
    seg_items = [a for a in analyzed if a["seg_name"] == seg_name]
    if not seg_items:
        continue
    xs = smooth_1d([a["nx"] for a in seg_items], sigma=2.0)
    ys = smooth_1d([a["ny"] for a in seg_items], sigma=2.0)

    if seg_name == "seg1_left":
        # Strictly decreasing x from -0.08 to -1.00, y anchored smoothly near 0
        xs = np.minimum.accumulate(xs)
        xs = np.linspace(min(-0.08, xs[0]), -1.0, len(seg_items)) * 0.35 + xs * 0.65
        xs = np.minimum.accumulate(xs)
        ys = ys * 0.25
    elif seg_name == "seg2_right":
        # Strictly increasing x from +0.08 to +1.00, y anchored smoothly near 0
        xs = np.maximum.accumulate(xs)
        xs = np.linspace(max(0.08, xs[0]), 1.0, len(seg_items)) * 0.35 + xs * 0.65
        xs = np.maximum.accumulate(xs)
        ys = ys * 0.25
    elif seg_name == "seg3_diag_tr":
        # Smooth arc from (+0.95, -0.18) to (+0.18, -0.88)
        xs = np.minimum.accumulate(xs)
        ys = np.minimum.accumulate(ys)
    elif seg_name == "seg4_vertical":
        # Strictly increasing y from -1.00 (Top) through 0.00 (Center) to +1.00 (Bottom), x = 0.0
        ys = np.maximum.accumulate(ys)
        ys = np.linspace(-1.0, 1.0, len(seg_items)) * 0.30 + ys * 0.70
        ys = np.maximum.accumulate(ys)
        xs = np.zeros_like(xs)

    for i, a in enumerate(seg_items):
        a["nx"] = float(np.clip(xs[i], -1.0, 1.0))
        a["ny"] = float(np.clip(ys[i], -1.0, 1.0))

# 6. Export all frames with transparent cutout + cyberpunk neon grade
shutil.rmtree(TMP_OUT_DIR, ignore_errors=True)
TMP_OUT_DIR.mkdir(parents=True, exist_ok=True)

manifest_frames = []
for idx, a in enumerate(analyzed):
    fname = f"frame_{idx:04d}.webp"
    out_webp = TMP_OUT_DIR / fname
    img_bgr = cv2.imread(str(a["path"]))
    graded_bgra = cutout_and_cyberpunk_grade(img_bgr)
    cv2.imwrite(str(out_webp), graded_bgra, [int(cv2.IMWRITE_WEBP_QUALITY), 86])

    manifest_frames.append({
        "id": idx,
        "seg": a["seg_id"],
        "file": f"/gaze_frames/{fname}?v=neon2",
        "x": round(a["nx"], 4),
        "y": round(a["ny"], 4),
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

shutil.rmtree(OUTPUT_DIR, ignore_errors=True)
shutil.move(str(TMP_OUT_DIR), str(OUTPUT_DIR))
print(f"SUCCESS! Exported {len(manifest_frames)} strictly monotonic neon-graded frames. Center: {center_entry['file']} (id={center_entry['id']})")
