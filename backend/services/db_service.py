import os
import uuid
import numpy as np
from typing import List, Dict, Any, Optional
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", os.getenv("SUPABASE_SERVICE_KEY", os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")))

class DatabaseService:
    def __init__(self):
        self.client = None
        self._local_storage: Dict[str, Dict[str, Any]] = {}
        self.init_supabase()

    def init_supabase(self):
        """Initializes Supabase Python client if credentials are configured."""
        if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "https://your-project.supabase.co":
            try:
                from supabase import create_client, Client
                self.client: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
                logger.info("Connected to Supabase project successfully.")
            except Exception as e:
                logger.warning(f"Could not connect to Supabase: {e}. Active in resilient local fallback mode.")
                self.client = None
        else:
            logger.info("No active SUPABASE_URL set. Running in dynamic local memory & vector matching mode.")
            self.client = None

    def upload_crop_image(self, image_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> str:
        """
        Uploads crop image to Supabase Storage 'shelf-media' bucket.
        Returns public URL string.
        """
        if self.client:
            try:
                bucket_name = "shelf-media"
                # Ensure filename is unique
                path_on_supa = f"crops/{uuid.uuid4().hex[:8]}_{filename}"
                self.client.storage.from_(bucket_name).upload(
                    path=path_on_supa,
                    file=image_bytes,
                    file_options={"content-type": content_type, "upsert": "true"}
                )
                public_url = self.client.storage.from_(bucket_name).get_public_url(path_on_supa)
                return public_url
            except Exception as e:
                logger.error(f"Error uploading to Supabase Storage: {e}")

        # Fallback for local preview: data URI or mock URL
        import base64
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        return f"data:{content_type};base64,{b64_img}"

    def insert_inventory_item(self, category: str, image_url: str, confidence: float, is_available: bool, embedding: List[float]) -> Dict[str, Any]:
        """
        Inserts item record into inventory_items table with 512-dim vector embedding.
        """
        item_id = str(uuid.uuid4())
        record = {
            "id": item_id,
            "category": category,
            "image_url": image_url,
            "confidence": float(confidence),
            "is_available": is_available,
            "embedding": embedding,
            "created_at": "2026-09-05T09:44:00+05:30"
        }

        if self.client:
            try:
                res = self.client.table("inventory_items").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Error inserting item into Supabase pgvector: {e}")

        # Local storage fallback
        self._local_storage[item_id] = record
        return record

    def match_inventory(self, query_embedding: List[float], match_threshold: float = 0.1, match_count: int = 10) -> List[Dict[str, Any]]:
        """
        Calls Supabase match_inventory RPC procedure or performs in-memory Cosine Similarity fallback.
        """
        if self.client:
            try:
                res = self.client.rpc("match_inventory", {
                    "query_embedding": query_embedding,
                    "match_threshold": match_threshold,
                    "match_count": match_count
                }).execute()
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.error(f"Error invoking match_inventory RPC: {e}")

        # Local In-Memory Cosine Similarity Fallback (<=> equivalent)
        results = []
        q_vec = np.array(query_embedding)
        q_norm = np.linalg.norm(q_vec)

        for item_id, record in self._local_storage.items():
            emb = np.array(record["embedding"])
            emb_norm = np.linalg.norm(emb)
            if q_norm > 0 and emb_norm > 0:
                cosine_sim = float(np.dot(q_vec, emb) / (q_norm * emb_norm))
            else:
                cosine_sim = 0.0

            if cosine_sim >= match_threshold:
                match_obj = dict(record)
                match_obj["similarity"] = round(cosine_sim, 4)
                results.append(match_obj)

        # Sort descending by similarity score
        results.sort(key=lambda x: x.get("similarity", 0), reverse=True)
        return results[:match_count]

    def get_all_items(self) -> List[Dict[str, Any]]:
        """Retrieves all indexed inventory items."""
        if self.client:
            try:
                res = self.client.table("inventory_items").select("*").order("created_at", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.error(f"Error fetching items from Supabase: {e}")

        return list(self._local_storage.values())

    def update_item_status(self, item_id: str, is_available: bool) -> Optional[Dict[str, Any]]:
        """Updates is_available status for a merchant inventory item."""
        if self.client:
            try:
                res = self.client.table("inventory_items").update({"is_available": is_available}).eq("id", item_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Error updating item status in Supabase: {e}")

        if item_id in self._local_storage:
            self._local_storage[item_id]["is_available"] = is_available
            return self._local_storage[item_id]

        return None

db_service = DatabaseService()
