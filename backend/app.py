import os
import io
import time
from typing import List, Dict, Any, Optional
from PIL import Image

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.image_processor import apply_clahe, crop_and_rectify_bbox, pil_to_bytes, pil_to_base64
from services.ai_engine import ai_engine
from services.db_service import db_service

app = FastAPI(
    title="ShelfLens AI API",
    description="Hyper-Local AI Inventory Discovery System for Salem Bazaar Retail Racks",
    version="1.0.0"
)

# Configure CORS Middleware for local web dev and mobile devices
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StatusUpdatePayload(BaseModel):
    is_available: bool

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "ShelfLens AI - Salem Bazaar Retail Discovery Engine",
        "models": {
            "detection": "Ultralytics YOLOv8n",
            "embedding": "OpenAI CLIP (ViT-B/32, 512-dim vector)",
            "lighting_enhancement": "OpenCV CLAHE (Contrast Limited Adaptive Histogram Equalization)"
        },
        "database": "Supabase pgvector (match_inventory RPC)"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": time.time()}

# ------------------------------------------------------------------------------
# ENDPOINT 1: POST /api/scan-shelf
# ------------------------------------------------------------------------------
@app.post("/api/scan-shelf")
async def scan_shelf(
    file: UploadFile = File(...),
    apply_lighting_correction: bool = Form(True),
    conf_threshold: float = Form(0.25)
):
    """
    Merchant Endpoint: Scans full shelf rack photo.
    1. Normalizes shelf lighting using OpenCV CLAHE.
    2. Detects product bounding boxes with YOLOv8.
    3. Crops rectified item bounding boxes.
    4. Uploads crops to Supabase Storage ('shelf-media').
    5. Generates 512-dim CLIP embeddings.
    6. Inserts metadata and vectors into Supabase pgvector.
    """
    start_time = time.time()
    try:
        image_bytes = await file.read()
        raw_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    # 1. Preprocessing: Apply OpenCV CLAHE lighting normalization
    processed_image = raw_image
    clahe_applied = False
    if apply_lighting_correction:
        try:
            processed_image = apply_clahe(raw_image, clip_limit=2.5)
            clahe_applied = True
        except Exception as e:
            print(f"CLAHE normalization warning: {e}")

    # 2. Object Detection: Detect bounding boxes with YOLOv8
    detections = ai_engine.detect_shelf_items(processed_image, conf_threshold=conf_threshold)

    indexed_items = []
    
    # 3. For each detection, crop, upload to storage, compute vector embedding & store in DB
    for idx, det in enumerate(detections):
        bbox = det["bbox"]
        confidence = det["confidence"]
        category = det["category"]

        # Crop rectified bounding box
        cropped_pil = crop_and_rectify_bbox(processed_image, bbox)
        crop_bytes = pil_to_bytes(cropped_pil, format="JPEG")
        
        # Upload crop image to Supabase Storage ('shelf-media' bucket)
        filename = f"item_{int(time.time())}_{idx}.jpg"
        image_url = db_service.upload_crop_image(crop_bytes, filename, content_type="image/jpeg")

        # Generate L2-Normalized 512-dim CLIP vector embedding
        clip_embedding = ai_engine.generate_clip_embedding(cropped_pil)

        # Insert metadata and vector embedding into Supabase DB
        item_record = db_service.insert_inventory_item(
            category=category,
            image_url=image_url,
            confidence=confidence,
            is_available=True,
            embedding=clip_embedding
        )

        indexed_items.append({
            "id": item_record["id"],
            "category": category,
            "confidence": confidence,
            "image_url": image_url,
            "bbox": bbox,
            "embedding_dims": len(clip_embedding)
        })

    elapsed_sec = round(time.time() - start_time, 2)

    return {
        "success": True,
        "message": f"Successfully processed shelf scan and indexed {len(indexed_items)} items.",
        "metrics": {
            "total_items_indexed": len(indexed_items),
            "clahe_lighting_normalized": clahe_applied,
            "processing_time_seconds": elapsed_sec
        },
        "items": indexed_items
    }

# ------------------------------------------------------------------------------
# ENDPOINT 2: POST /api/visual-search
# ------------------------------------------------------------------------------
@app.post("/api/visual-search")
async def visual_search(
    file: UploadFile = File(...),
    match_threshold: float = Form(0.15),
    match_count: int = Form(10)
):
    """
    Customer Endpoint: Visual Similarity Search.
    1. Accepts user query photo (e.g. cosmetic shade, jewellery piece).
    2. Computes CLIP ViT-B/32 512-dim vector embedding.
    3. Executes Supabase match_inventory RPC function (vector similarity search).
    4. Returns ranked product matches with image URLs and confidence scores.
    """
    try:
        image_bytes = await file.read()
        query_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid query photo: {str(e)}")

    # Apply CLAHE to query photo to handle ambient lighting differences
    enhanced_query = apply_clahe(query_image, clip_limit=2.0)

    # Compute 512-dim CLIP vector embedding for the query image
    query_embedding = ai_engine.generate_clip_embedding(enhanced_query)

    # Execute vector similarity query via Supabase match_inventory RPC procedure
    matches = db_service.match_inventory(
        query_embedding=query_embedding,
        match_threshold=match_threshold,
        match_count=match_count
    )

    return {
        "success": True,
        "total_matches": len(matches),
        "matches": matches
    }

# ------------------------------------------------------------------------------
# ENDPOINT 3: GET /api/items & PATCH /api/items/{id}/status
# ------------------------------------------------------------------------------
@app.get("/api/items")
def get_inventory_items():
    """Returns all current items indexed in the inventory system."""
    items = db_service.get_all_items()
    return {
        "success": True,
        "count": len(items),
        "items": items
    }

@app.patch("/api/items/{item_id}/status")
def update_item_availability(item_id: str, payload: StatusUpdatePayload):
    """Merchant Endpoint: Quick toggle stock availability (In Stock / Sold Out)."""
    updated_item = db_service.update_item_status(item_id, payload.is_available)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {
        "success": True,
        "message": f"Item {item_id} stock availability updated to {payload.is_available}",
        "item": updated_item
    }
