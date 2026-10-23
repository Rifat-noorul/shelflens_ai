# ShelfLens AI: Hyper-Local Visual Search for Salem Bazaar Racks

ShelfLens AI bridges the gap between chaotic physical retail racks and digital visual search. Designed specifically for dense, un-barcoded traditional bazaar setups (such as cosmetics, textiles, and jewelry stores in Salem Bazaar), ShelfLens allows merchants to photograph a shelf rack and lets shoppers locate exact item positions, availability, and rack coordinates using reverse visual search.

---

## 1. Design Thinking & Empathy Stage

### The User Context
Salem Bazaar stores are characterized by high inventory density, vertical glass cases, reflective lighting, and un-barcoded merchandise. Store clerks spend extensive time manually answering "Do you have this shade/pattern?", and shoppers frequently leave if an item cannot be quickly spotted on crowded shelves.

### Field Interviews & Empathy Observations
* **Interviewee 1: R. Sundaram (Retail Shop Owner, Salem Bazaar)**
  > *"We display over 1,500 jewelry and cosmetic items across glass counters. During festival peaks, clerks cannot remember every slot. We cannot barcode individual earrings or bindis—it takes too much time."*
  * **Frustration:** High inventory turnover with zero digital indexing; barcode tagging is physically and economically impractical.
* **Interviewee 2: Priya K. (Shopper / Customer)**
  > *"I come with a photo saved from social media or wedding samples. Showing the photo to three different helpers who search through glass displays takes 15 minutes."*
  * **Frustration:** Text descriptions cannot accurately capture visual color nuances, earring shapes, or saree borders.
* **Interviewee 3: A. Murugan (Counter Assistant)**
  > *"When glass lights reflect or shelves get crowded, customers think we are out of stock even when the box is right in the lower tray."*
  * **Frustration:** Harsh overhead lighting and crowded rack depths cause items to be overlooked.

### Journey Map Summary
1. **Browse/Arrival:** Shopper enters with a specific reference visual in hand.
2. **Current Pain Point:** Manual clerk intervention $\rightarrow$ searching through shelves $\rightarrow$ high friction/drop-off.
3. **ShelfLens Intervention:** Shopper snaps/uploads reference photo $\rightarrow$ vector similarity search against active shelf index $\rightarrow$ instant quadrant location (`Rack A-3, Shelf 2`) displayed with stock status.

---

## 2. Problem Statement (Define Stage)

> Traditional, high-density retail merchants in Salem Bazaar lose sales and staff productivity because non-barcoded, visually nuanced inventory is locked in physical shelf clutter without quick, real-time spatial lookup for shoppers.

---

## 3. Ideation & AI Divergence Partner

During ideation, an LLM partner was utilized for divergent exploration and architectural tradeoffs:

| Exploration Vector | AI Suggested Alternatives | Evaluated Outcome | Human Decision & Rationale |
| :--- | :--- | :--- | :--- |
| **Object Localization** | Traditional edge-detection vs. Contour analysis vs. YOLOv8n | Edge detection failed on clustered jewelry boxes | Selected **YOLOv8n** for fast bounding-box multi-item extraction under varying scales. |
| **Visual Search Strategy** | Color Histograms vs. SIFT feature matching vs. CLIP embeddings | SIFT was fragile against lighting and orientation shifts | Selected **OpenAI CLIP (ViT-B/32)** embeddings to enable cross-modal semantic visual similarity. |
| **Vector Storage** | Local FAISS file vs. Pinecone Cloud vs. Supabase pgvector | Standalone vector DBs created separate sync latency | Selected **Supabase pgvector (PostgreSQL)** for unified storage, vector cosine distance, and relational tables. |
| **Glare & Lighting** | Standard RGB vs. CLAHE vs. Bilateral Filtering | Bilateral filtering softened critical retail edges | Selected **OpenCV CLAHE** preprocessor to balance glass glare without blurring small packaging labels. |

---

## 4. AI Interaction Audit

ShelfLens AI balances automated model inference with human merchant control:

* **Where AI Decides:**
  * Automated bounding box detection across complex shelves using YOLO.
  * Contrast balance and illumination equalization via OpenCV CLAHE.
  * 512-dimensional multimodal feature extraction via CLIP.
  * Cosine similarity ranking via PostgreSQL HNSW indexing.
* **Where Human Judgment Governs:**
  * **Stock Verification:** The merchant retains manual overrides on stock availability (`In Stock` / `Hold Item` / `Out of Stock`).
  * **Location Tagging:** Merchant assigns rack quadrants (e.g., `Rack S-5, Grain Market`) to match physical store geometry.
  * **Threshold Validation:** Similarity cutoff thresholds are calibrated to prevent false matches in high-variance categories.

---

## 5. Prototype & Tester Validation Report

Three real users tested the running prototype (FastAPI backend + Supabase + React/Tailwind frontend):

| Tester | Task Tested | Feedback & Direct Quote | What Was Changed in Prototype |
| :--- | :--- | :--- | :--- |
| **Tester 1: Shop Assistant** | Uploaded wide counter image to scan shelf items | *"The glass reflection at the top washed out the cosmetics on the middle shelf."* | Integrated OpenCV CLAHE preprocessor before passing crops to CLIP; drastically reduced missed crops. |
| **Tester 2: Retail Shopper** | Searched with a photo of a hair accessory | *"The search matched the item, but the yellow buttons looked like warnings and strained my eyes in the shop."* | Overhauled UI from yellow accents to an ergonomic crimson brand theme (`brand-600`) with high-contrast Dark/Light mode. |
| **Tester 3: College Peer** | Checked mobile layout and stock hold | *"I didn't know if the merchant portal was private or open to anyone searching."* | Added role-differentiated navigation, merchant route protection, and Supabase Auth integration modal. |

---

## 6. Architecture & Tech Stack

```text
[ Physical Store Shelf Image ] 
            │
            ▼
┌───────────────────────────────┐
│     FastAPI AI Pipeline       │
│  - OpenCV CLAHE Preprocessing │
│  - YOLOv8 Object Detection    │
│  - CLIP ViT-B/32 Embeddings   │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       Supabase Cloud          │
│  - PostgreSQL + pgvector      │
│  - Cosine Distance Search     │
│  - shelf-media Asset Storage  │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│     React + Tailwind UI       │
│  - Customer Visual Discovery  │
│  - Merchant Rack Management   │
│  - Dark / Light Theme Support │
└───────────────────────────────┘
