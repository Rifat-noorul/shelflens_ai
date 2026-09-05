-- ==============================================================================
-- ShelfLens AI: Hyper-Local AI Inventory Discovery System
-- Database Initialization & pgvector Schema Setup (Salem Bazaar Case Study)
-- ==============================================================================

-- 1. Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'General Shelf Item',
    image_url TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.0,
    is_available BOOLEAN NOT NULL DEFAULT true,
    embedding vector(512) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for HNSW fast vector search using Cosine Distance
CREATE INDEX IF NOT EXISTS inventory_items_embedding_hnsw_idx 
ON public.inventory_items 
USING hnsw (embedding vector_cosine_ops);

-- 3. RPC Stored Procedure: match_inventory
-- Performs vector similarity search using Cosine Distance (<=>)
-- Returns items sorted by visual similarity score (1 - cosine distance)
CREATE OR REPLACE FUNCTION match_inventory(
    query_embedding vector(512),
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    category TEXT,
    image_url TEXT,
    confidence FLOAT,
    is_available BOOLEAN,
    similarity FLOAT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        inventory_items.id,
        inventory_items.category,
        inventory_items.image_url,
        inventory_items.confidence,
        inventory_items.is_available,
        (1 - (inventory_items.embedding <=> query_embedding))::float AS similarity,
        inventory_items.created_at
    FROM inventory_items
    WHERE (1 - (inventory_items.embedding <=> query_embedding)) >= match_threshold
    ORDER BY inventory_items.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- 4. Storage Bucket Configuration Instructions for 'shelf-media'
-- Note: Execute in Supabase SQL Editor or Storage Dashboard if needed:
/*
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shelf-media', 'shelf-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to shelf-media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'shelf-media');

CREATE POLICY "Allow public uploads to shelf-media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'shelf-media');
*/
