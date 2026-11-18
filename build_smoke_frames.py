#!/usr/bin/env python3
"""
Smoke-dissolve frame builder.
1. Extracts frames from raw_video/user_smoke.mp4.
2. Aligns the crop so the face matches the existing gaze center frame (same scale + position).
3. Removes the black background:
   - person  -> selfie segmentation + same cyberpunk grade as gaze frames (early frames)
   - smoke   -> luminance key with exact un-premultiplied colour (additive over black)
4. Writes transparent 640x640 webp frames to public/smoke_frames + manifest.
"""
import glob
import json
import shutil
import subprocess
from pathlib import Path

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

BASE = Path(__file__).resolve().parent
VIDEO = BASE / "raw_video" / "user_smoke.mp4"
FFMPEG = BASE / "bin" / "ffmpeg"
MODEL = BASE / ".venv" / "face_landmarker.task"
SEG = BASE / ".venv" / "selfie_segmenter.tflite"
OUT = BASE / "public" / "smoke_frames"
TMP = Path("/tmp/smoke_raw")
SIZE = 640

shutil.rmtree(TMP, ignore_errors=True)
TMP.mkdir(parents=True)
subprocess.run([str(FFMPEG), "-y", "-i", str(VIDEO), "-an", "-q:v", "2", str(TMP / "f_%04d.jpg")],
               check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
files = sorted(glob.glob(str(TMP / "f_*.jpg")))
N = len(files)
print("frames:", N)

detector = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path=str(MODEL)), num_faces=1))
segmenter = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=python.BaseOptions(model_asset_path=str(SEG)),
    output_confidence_masks=True, output_category_mask=False))


def face_box(bgr):
    h, w, _ = bgr.shape
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    res = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
    lm = res.face_landmarks[0]
    xs = [p.x * w for p in lm]
    ys = [p.y * h for p in lm]
    return (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, max(max(xs) - min(xs), max(ys) - min(ys))


# --- alignment against existing gaze centre frame ---------------------------
ref = cv2.imread(str(BASE / "public" / "gaze_frames" / "blink_0000.webp"), cv2.IMREAD_UNCHANGED)
ref_bgr = (ref[:, :, :3].astype(np.float32) * (ref[:, :, 3:4].astype(np.float32) / 255.0)).astype(np.uint8)
ref_bgr = cv2.resize(ref_bgr, (SIZE, SIZE))
rcx, rcy, rsz = face_box(ref_bgr)
print("ref face (cx,cy,size) in 640 frame:", rcx, rcy, rsz)

first = cv2.imread(files[0])
H, W, _ = first.shape
vcx, vcy, vsz = face_box(first)
scale = SIZE / (vsz * (SIZE / rsz))  # source px per output px  -> crop_dim = vsz*SIZE/rsz
crop_dim = vsz * SIZE / rsz
left = vcx - rcx * crop_dim / SIZE
top = vcy - rcy * crop_dim / SIZE
print("crop_dim", crop_dim, "left", left, "top", top)


def crop(bgr):
    # affine crop with border replicate -> handles crop windows leaving the frame
    s = SIZE / crop_dim
    M = np.array([[s, 0, -left * s], [0, s, -top * s]], dtype=np.float32)
    return cv2.warpAffine(bgr, M, (SIZE, SIZE), flags=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0))


def seg_mask(bgr):
    h, w, _ = bgr.shape
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    res = segmenter.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
    m = res.confidence_masks[0].numpy_view().reshape(h, w).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 1.0)
    return np.clip((m - 0.42) / 0.38, 0.0, 1.0)


yy, xx = np.meshgrid(np.linspace(0, 1, SIZE, dtype=np.float32),
                     np.linspace(0, 1, SIZE, dtype=np.float32), indexing="ij")


def grade(bgr, alpha):
    """Same dual-neon low-key grade used for the gaze frames (straight colour out)."""
    b, g, r = [bgr[:, :, i].astype(np.float32) for i in range(3)]
    rn, gn, bn = r / 255, g / 255, b / 255
    l_cur = 0.299 * rn + 0.587 * gn + 0.114 * bn
    rn = l_cur + (rn - l_cur) * 0.72
    gn = l_cur + (gn - l_cur) * 0.68
    bn = l_cur + (bn - l_cur) * 0.85
    rn = np.power(np.clip(rn, 0, 1), 1.42) * 0.76
    gn = np.power(np.clip(gn, 0, 1), 1.48) * 0.70
    bn = np.power(np.clip(bn, 0, 1), 1.32) * 0.84
    shadow_w = np.clip(1.0 - l_cur * 1.4, 0, 1)
    rn += shadow_w * 0.06
    gn += shadow_w * 0.01
    bn += shadow_w * 0.11
    shirt = np.clip((yy - 0.72) / 0.16, 0, 1)
    rn *= 1 - 0.78 * shirt
    gn *= 1 - 0.84 * shirt
    bn *= 1 - 0.72 * shirt

    a_in = cv2.GaussianBlur(alpha, (0, 0), 6.0)
    a_wide = cv2.GaussianBlur(alpha, (0, 0), 22.0)
    rim_tight = np.clip(alpha - cv2.erode(alpha, np.ones((7, 7), np.uint8)), 0, 1)
    rim_tight = cv2.GaussianBlur(rim_tight, (0, 0), 3.0) * alpha
    rim_soft = np.clip(1 - a_in, 0, 1) * alpha
    ambient = np.clip(1 - a_wide * 0.65, 0, 1) * alpha

    left_side = np.clip((0.56 - xx) / 0.38, 0, 1)
    cyan = np.clip((rim_tight * 1.15 + rim_soft * 0.65 + ambient * 0.28) * left_side
                   + np.clip((l_cur - 0.45) / 0.40, 0, 1) * left_side * 0.38, 0, 1.2)
    right_side = np.clip((xx - 0.44) / 0.38, 0, 1)
    pink = np.clip((rim_tight * 1.20 + rim_soft * 0.70 + ambient * 0.32) * right_side
                   + np.clip((l_cur - 0.45) / 0.40, 0, 1) * right_side * 0.42, 0, 1.2)

    rn = 1 - (1 - rn) * (1 - cyan * 0.38)
    gn = 1 - (1 - gn) * (1 - cyan * 0.88)
    bn = 1 - (1 - bn) * (1 - cyan * 1.00)
    rn = 1 - (1 - rn) * (1 - pink * 1.00)
    gn = 1 - (1 - gn) * (1 - pink * 0.16)
    bn = 1 - (1 - bn) * (1 - pink * 0.72)
    return np.dstack([np.clip(bn, 0, 1), np.clip(gn, 0, 1), np.clip(rn, 0, 1)])  # BGR 0..1


def smoothstep(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


bottom_fade = np.clip((0.96 - yy) / 0.12, 0.0, 1.0)

# Soft feather where the source video frame ends (smoke is wider than the 9:16 clip),
# so the smoke fades out naturally instead of being cut by a hard vertical edge.
_s = SIZE / crop_dim
_M = np.array([[_s, 0, -left * _s], [0, _s, -top * _s]], dtype=np.float32)
_valid = cv2.warpAffine(np.ones((H, W), np.float32), _M, (SIZE, SIZE), flags=cv2.INTER_LINEAR,
                        borderMode=cv2.BORDER_CONSTANT, borderValue=0)
_valid = cv2.erode(_valid, np.ones((31, 31), np.uint8))
_valid = cv2.GaussianBlur(_valid, (0, 0), 38.0)
_valid = np.clip((_valid - 0.12) / 0.70, 0, 1)
_valid = _valid * _valid * (3 - 2 * _valid)
edge_feather = _valid

shutil.rmtree(OUT, ignore_errors=True)
OUT.mkdir(parents=True)

for i, fpath in enumerate(files):
    t = i / (N - 1)
    raw = crop(cv2.imread(fpath))
    raw_f = raw.astype(np.float32) / 255.0

    a_p = seg_mask(raw)
    # fade the shirt out like the gaze frames
    a_p = a_p * bottom_fade
    # lift exposure so the face matches the brightness of the existing gaze frames
    lit = np.clip(raw.astype(np.float32) * 1.6, 0, 255).astype(np.uint8)
    g_bgr = grade(lit, a_p)

    # smoke luminance key: additive over black. Subtract the video's lifted black level
    # (~0.10 from limited-range YUV) so the backdrop becomes exactly transparent.
    BLACK = 0.10
    raw_k = np.clip((raw_f - BLACK) / (1.0 - BLACK), 0, 1)
    raw_k = cv2.GaussianBlur(raw_k, (0, 0), 0.6)
    maxc = raw_k.max(axis=2)
    a_s = np.clip(maxc / 0.30, 0, 1) * bottom_fade * edge_feather
    # keep the smoke's own bright edges from being cut: person alpha is untouched

    w = float(smoothstep(t, 0.14, 0.32))  # 0 = pure graded person, 1 = raw smoke composite

    # Smoke phase person layer: the segmenter treats smoke as "person", which would paint the
    # video's backdrop as a rectangle. Remove the lifted black level, feather where the clip ends,
    # and make near-black person pixels transparent (they match the dark site background anyway).
    lit_f = lit.astype(np.float32) / 255.0
    lit_k = np.clip((lit_f - BLACK * 1.6) / (1.0 - BLACK * 1.6), 0, 1)
    a_pe = a_p * (1.0 - w * (1.0 - edge_feather))
    a_pv = a_pe * np.clip(lit_k.max(axis=2) / 0.22, 0, 1)
    person_prem = lit_k * a_pe[:, :, None]

    smoke_prem = raw_k * (bottom_fade * edge_feather)[:, :, None]
    smoke_layer = np.clip(smoke_prem + person_prem * (1 - a_s[:, :, None]), 0, 1)
    prem = (1 - w) * (g_bgr * a_p[:, :, None]) + w * smoke_layer
    alpha = (1 - w) * a_p + w * np.clip(a_pv * (1 - a_s) + a_s, 0, 1)
    alpha = np.clip(alpha, 0, 1)
    straight = np.clip(prem / np.maximum(alpha[:, :, None], 1e-3), 0, 1)

    out = np.dstack([(straight * 255).astype(np.uint8), (alpha * 255).astype(np.uint8)])
    cv2.imwrite(str(OUT / f"smoke_{i:04d}.webp"), out, [int(cv2.IMWRITE_WEBP_QUALITY), 82])

(OUT / "manifest.json").write_text(json.dumps({
    "total": N,
    "pattern": "/smoke_frames/smoke_{i}.webp",
    "digits": 4,
}))
print("done ->", OUT)
