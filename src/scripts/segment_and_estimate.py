import sys
import os
import argparse
import torch
import numpy as np
from PIL import Image
import cv2
import json

# Add current directory to path for u2net import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from u2net import U2NET

# Constants
DEFAULT_PLATE_DIAMETER_CM = 25.0
DEFAULT_IMAGE_WIDTH_CM = 30.0
DEFAULT_DENSITY_GRAMS_PER_CM2 = 0.3  # Rough average food density in grams per cm²


def load_u2net(model_path):
    """Load U2NET model from disk."""
    net = U2NET(3, 1)
    net.load_state_dict(torch.load(model_path, map_location='cpu'))
    net.eval()
    return net


def segment_image(net, image_path):
    """
    Segment the image using U2NET.
    
    Returns:
        binary_mask: np.ndarray (0 or 1)
        image_np: original image as np.ndarray
    """
    image = Image.open(image_path).convert('RGB')
    image_np = np.array(image)

    # Resize input for the model - fixed size expected by U2NET
    im_resized = image.resize((320, 320))
    im_tensor = torch.from_numpy(np.array(im_resized)).float().permute(2, 0, 1).unsqueeze(0) / 255.0

    with torch.no_grad():
        d1, *_ = net(im_tensor)
        mask = d1.squeeze().cpu().numpy()
        # Normalize mask to [0,1]
        mask = (mask - mask.min()) / (mask.max() - mask.min())
        # Resize mask back to original image size
        mask = cv2.resize(mask, (image_np.shape[1], image_np.shape[0]))
        # Threshold mask to binary
        binary_mask = (mask > 0.5).astype(np.uint8)

    return binary_mask, image_np


def estimate_area(mask):
    """Calculate pixel area from the mask."""
    return int(np.sum(mask))


def detect_plate_scale(image_np):
    """
    Estimate pixel-to-cm scale using plate detection by Hough Circle.

    Returns:
        px_per_cm: float
        plate_diameter_px: int
    """
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (7, 7), 0)

    # Detect circles using HoughCircles - tuned parameters may need adjustment for your images
    circles = cv2.HoughCircles(
        blurred, cv2.HOUGH_GRADIENT, dp=1.2, minDist=100,
        param1=50, param2=30, minRadius=100, maxRadius=1000
    )

    if circles is not None:
        circles = np.round(circles[0, :]).astype("int")
        # Select largest detected circle (assumed plate)
        largest_circle = max(circles, key=lambda c: c[2])
        diameter_px = largest_circle[2] * 2
        px_per_cm = diameter_px / DEFAULT_PLATE_DIAMETER_CM
        return px_per_cm, diameter_px

    # Fallback: use image width to estimate scale
    image_width_px = image_np.shape[1]
    px_per_cm = image_width_px / DEFAULT_IMAGE_WIDTH_CM
    return px_per_cm, image_width_px


def estimate_grams(area_px, px_per_cm, density):
    """
    Convert pixel area to cm² and estimate grams.

    Returns:
        area_cm2: float
        estimated_grams: float
    """
    area_cm2 = area_px / (px_per_cm ** 2)
    estimated_grams = area_cm2 * density
    return area_cm2, estimated_grams


def main():
    parser = argparse.ArgumentParser(description="Segment food and estimate its weight in grams.")
    parser.add_argument("image_path", type=str, help="Path to the input image")
    parser.add_argument("model_path", type=str, help="Path to the U2Net model (.pth)")
    parser.add_argument("--density", type=float, default=DEFAULT_DENSITY_GRAMS_PER_CM2,
                        help="Density in grams per cm² (override default)")

    args = parser.parse_args()

    try:
        if not os.path.exists(args.image_path):
            raise FileNotFoundError(f"Image file not found: {args.image_path}")
        if not os.path.exists(args.model_path):
            raise FileNotFoundError(f"Model file not found: {args.model_path}")

        # Load model and process image
        net = load_u2net(args.model_path)
        mask, image_np = segment_image(net, args.image_path)

        # Check if segmentation mask is empty (no food detected)
        area_px = estimate_area(mask)
        if area_px == 0:
            raise ValueError("Segmentation failed: no food detected.")

        px_per_cm, plate_diameter_px = detect_plate_scale(image_np)
        area_cm2, estimated_grams = estimate_grams(area_px, px_per_cm, args.density)

        result = {
            "segmented_area_pixels": int(area_px),
            "plate_diameter_px": int(plate_diameter_px),
            "area_cm2": round(area_cm2, 2),
            "estimated_grams": round(estimated_grams, 2),
            "used_density": args.density
        }

        print(json.dumps(result))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
