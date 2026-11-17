#!/usr/bin/env python3
"""
Generate 121 Gaze Frames Locally Using LivePortrait (100% Free, Zero API Cost)
Works on:
- macOS Apple Silicon (M1/M2/M3/M4 via Metal/MPS)
- Windows / Linux (NVIDIA CUDA GPU)

Outputs:
  public/avatar_frames/gaze_px{X}_py{Y}_256.webp (121 frames)
"""

import os
import sys
import argparse
from pathlib import Path

# Add LivePortrait to path
BASE_DIR = Path(__file__).resolve().parent.parent
LIVE_PORTRAIT_DIR = BASE_DIR / "LivePortrait"
if LIVE_PORTRAIT_DIR.exists():
    sys.path.insert(0, str(LIVE_PORTRAIT_DIR))

import numpy as np
from PIL import Image
from tqdm import tqdm

def sanitize_val(v: float) -> str:
    return f"{v}".replace("-", "m").replace(".", "p")

def filename_for(px: float, py: float, size: int = 256) -> str:
    return f"gaze_px{sanitize_val(px)}_py{sanitize_val(py)}_{size}.webp"

def frange(start: float, stop: float, step: float):
    x = start
    cmp = (lambda a, b: a <= b) if step > 0 else (lambda a, b: a >= b)
    while cmp(x, stop + 1e-9):
        yield round(x, 2)
        x += step

def main():
    parser = argparse.ArgumentParser(description="Generate 121 gaze frames locally via LivePortrait")
    parser.add_argument("--image", default=str(BASE_DIR / "public" / "avatar_512.jpg"), help="Path to input photo (512x512)")
    parser.add_argument("--out", default=str(BASE_DIR / "public" / "avatar_frames"), help="Output directory")
    parser.add_argument("--min", type=float, default=-15.0, help="Min pupil range")
    parser.add_argument("--max", type=float, default=15.0, help="Max pupil range")
    parser.add_argument("--step", type=float, default=3.0, help="Step size (default 3 = 11x11 = 121 frames)")
    parser.add_argument("--size", type=int, default=256, help="Target image size")
    args = parser.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    image_path = Path(args.image)

    if not image_path.exists():
        print(f"ERROR: Source image not found at {image_path}")
        sys.exit(1)

    print("=" * 60)
    print("🎨 LivePortrait Local Batch Gaze Generator (Free / No API)")
    print("=" * 60)
    print(f"📸 Image: {image_path}")
    print(f"📁 Output: {out_dir}")
    print(f"📐 Range: [{args.min} .. {args.max}], Step: {args.step}")

    try:
        import torch
        from src.gradio_pipeline import GradioPipeline
        from src.config.argument_config import ArgumentConfig
        from src.config.inference_config import InferenceConfig
        from src.config.crop_config import CropConfig
    except ImportError as e:
        print(f"\n[!] LivePortrait dependencies not found: {e}")
        print("\nSetup Instructions:")
        print("1. cd LivePortrait")
        print("2. pip install -r requirements_macOS.txt (or requirements.txt on Windows CUDA)")
        print("3. huggingface-cli download KwaiVGI/LivePortrait --local-dir pretrained_weights")
        print("4. python ../scripts/generate_local_liveportrait.py")
        sys.exit(1)

    # Device selection
    if torch.cuda.is_available():
        device = "cuda"
    elif torch.backends.mps.is_available():
        device = "mps"
        os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
    else:
        device = "cpu"
    print(f"⚡ Compute device: {device.upper()}")

    # Initialize LivePortrait Gradio Pipeline
    inference_cfg = InferenceConfig(device_id=0 if device == "cuda" else None)
    crop_cfg = CropConfig()
    pipeline = GradioPipeline(inference_cfg=inference_cfg, crop_cfg=crop_cfg)

    # Prepare values
    px_vals = list(frange(args.min, args.max, args.step))
    py_vals = list(frange(args.min, args.max, args.step))
    total_frames = len(px_vals) * len(py_vals)

    print(f"🚀 Generating {total_frames} directional gaze frames...")

    csv_rows = ["filename,pupil_x,pupil_y\n"]

    for py in tqdm(py_vals, desc="Vertical Angle (Pitch)"):
        for px in px_vals:
            fname = filename_for(px, py, args.size)
            target_path = out_dir / fname

            if target_path.exists():
                csv_rows.append(f"{fname},{px},{py}\n")
                continue

            # LivePortrait parameters
            # Map px/py [-15..15] to eyeball direction and slight head turn
            eyeball_x = float(px * 1.5)
            eyeball_y = float(py * 1.5)
            head_yaw = float((px / 15.0) * 10.0)
            head_pitch = float(-(py / 15.0) * 10.0)

            # Run inference
            out_img = pipeline.execute_image_retargeting(
                input_eye_ratio=None,
                input_lip_ratio=None,
                input_head_pitch_variation=head_pitch,
                input_head_yaw_variation=head_yaw,
                input_head_roll_variation=0.0,
                mov_x=0.0,
                mov_y=0.0,
                mov_z=1.0,
                lip_variation_zero=0.0,
                lip_variation_one=0.0,
                lip_variation_two=0.0,
                lip_variation_three=0.0,
                smile=0.0,
                wink=0.0,
                eyebrow=0.0,
                eyeball_direction_x=eyeball_x,
                eyeball_direction_y=eyeball_y,
                input_image=str(image_path),
                retargeting_source_scale=2.5,
                flag_stitching_retargeting_input=True,
                flag_do_crop_input_retargeting_image=True,
            )

            # out_img can be a tuple (crop_out, full_out) or single np.ndarray
            if isinstance(out_img, tuple):
                res_np = out_img[1] if out_img[1] is not None else out_img[0]
            else:
                res_np = out_img

            # Convert to PIL, resize to square size, and save as WebP
            pil_img = Image.fromarray(res_np)
            pil_img = pil_img.resize((args.size, args.size), Image.Resampling.LANCZOS)
            pil_img.save(target_path, format="WEBP", quality=95, method=6)

            csv_rows.append(f"{fname},{px},{py}\n")

    # Save index.csv
    with open(out_dir / "index.csv", "w", encoding="utf-8") as f:
        f.writelines(csv_rows)

    print(f"\n🎉 Done! All {total_frames} frames saved to {out_dir}")

if __name__ == "__main__":
    main()
