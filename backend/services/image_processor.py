import cv2
import numpy as np
from PIL import Image
import io
import base64
from typing import Tuple, List, Optional

def apply_clahe(image: Image.Image, clip_limit: float = 2.5, tile_grid_size: Tuple[int, int] = (8, 8)) -> Image.Image:
    """
    Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) to an image
    to normalize lighting variations common in traditional bazaar shelf environments (Salem Bazaar).
    Converts image to LAB color space, applies CLAHE to the L (Lightness) channel, and converts back to RGB.
    """
    # Convert PIL Image to OpenCV BGR format
    rgb_np = np.array(image.convert("RGB"))
    bgr_np = cv2.cvtColor(rgb_np, cv2.COLOR_RGB2BGR)

    # Convert to LAB color space
    lab = cv2.cvtColor(bgr_np, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    # Create CLAHE object and apply to L channel
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    cl_channel = clahe.apply(l_channel)

    # Merge channels back and convert to RGB
    limg = cv2.merge((cl_channel, a_channel, b_channel))
    enhanced_bgr = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)

    return Image.fromarray(enhanced_rgb)

def crop_and_rectify_bbox(image: Image.Image, bbox: List[float], padding_pct: float = 0.05) -> Image.Image:
    """
    Crops and rectifies a detected bounding box [x1, y1, x2, y2] from an image with optional padding.
    """
    width, height = image.size
    x1, y1, x2, y2 = bbox

    # Add optional padding around detected bounding box
    w_box = x2 - x1
    h_box = y2 - y1

    pad_x = w_box * padding_pct
    pad_y = h_box * padding_pct

    crop_x1 = max(0, int(x1 - pad_x))
    crop_y1 = max(0, int(y1 - pad_y))
    crop_x2 = min(width, int(x2 + pad_x))
    crop_y2 = min(height, int(y2 + pad_y))

    # Perform crop
    cropped_img = image.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    return cropped_img

def pil_to_bytes(img: Image.Image, format: str = "JPEG") -> bytes:
    """Converts PIL Image to bytes."""
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

def pil_to_base64(img: Image.Image, format: str = "JPEG") -> str:
    """Converts PIL Image to base64 data URI string."""
    img_bytes = pil_to_bytes(img, format=format)
    b64_str = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/{format.lower()};base64,{b64_str}"
