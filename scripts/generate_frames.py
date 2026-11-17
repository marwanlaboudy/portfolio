#!/usr/bin/env python3
"""
Generate 121-Frame Gaze & Head Tracking Grid for FaceLooker
Supports:
1. Replicate API (via 'kylan02/face-looker' or 'fofr/expression-editor')
2. Local LivePortrait on Mac M4 (Metal/MPS)

Usage:
  # Option A: With Replicate API Token
  export REPLICATE_API_TOKEN="your_token_here"
  python3 scripts/generate_frames.py --method replicate

  # Option B: Local LivePortrait
  python3 scripts/generate_frames.py --method local
"""

import os
import sys
import argparse
import urllib.request
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
IMAGE_PATH = BASE_DIR / "public" / "avatar_512.jpg"
OUTPUT_DIR = BASE_DIR / "public" / "avatar_frames"

def run_replicate():
    api_token = os.environ.get("REPLICATE_API_TOKEN")
    if not api_token:
        print("[!] Error: REPLICATE_API_TOKEN environment variable is not set.")
        print("[*] To use Replicate: export REPLICATE_API_TOKEN='your_replicate_token'")
        print("[*] Or visit: https://replicate.com/kylan02/face-looker directly to upload avatar_512.jpg")
        sys.exit(1)

    try:
        import replicate
    except ImportError:
        print("[*] Installing replicate package...")
        os.system("pip install replicate")
        import replicate

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[*] Submitting {IMAGE_PATH.name} to Replicate (kylan02/face-looker)...")

    with open(IMAGE_PATH, "rb") as img_file:
        output = replicate.run(
            "kylan02/face-looker",
            input={
                "image": img_file,
                "grid_size": 11,
            }
        )
    print("[+] Model output received:", output)
    print(f"[+] Download and extract frames into: {OUTPUT_DIR}")

def main():
    parser = argparse.ArgumentParser(description="Generate 121 frames for portfolio FaceLooker")
    parser.add_argument("--method", choices=["replicate", "local"], default="replicate", help="Generation method")
    args = parser.parse_args()

    if args.method == "replicate":
        run_replicate()
    else:
        print("[*] For Local LivePortrait on MacBook Air M4 (MPS):")
        print("1. brew install ffmpeg python@3.10 git")
        print("2. git clone https://github.com/KwaiVGI/LivePortrait && cd LivePortrait")
        print("3. python3 -m venv venv && source venv/bin/activate")
        print("4. pip install torch torchvision torchaudio && pip install -r requirements_macOS.txt")
        print("5. huggingface-cli download KwaiVGI/LivePortrait --local-dir pretrained_weights")
        print("6. PYTORCH_ENABLE_MPS_FALLBACK=1 python app.py")

if __name__ == "__main__":
    main()
