# texHAAB: Engineering Handover

*Updated: Oct 20, 2026 · Original by @Anoob*

---

## What texHAAB is

texHAAB is an AI knitting-recipe recommender for a knit-fabric factory in Bangladesh. A merchandiser enters what the buyer ordered (single or double knit and GSM at minimum), and the app returns the knitting setup: machine dia (top 2), gauge, yarn count, lycra denier and stitch length.

Today senior knitting staff decide these from experience. The models learn that experience from about 75,000 past order lines (Jan 2022 to Dec 2023).

Scope for v1 is knitting only. Finishing settings (stenter temperature, padder pressure) are out of scope: no past finishing settings were ever recorded, so they cannot be learned.

**Repo**: `github.com/Muhatarima/texhaab` (private). The owner is learning Python and builds every piece herself, one small step at a time; explain each step in plain words and give full files rather than fragments.

---

## Where things stand

| Phase | Scope | Status |
|---|---|---|
| **0** | Requirements, accuracy spec, stack | Done |
| **1** | Data pipeline: parsers, validation, rejects, tests, CI | Done |
| **2** | ML models, saved to files, accuracy report | Done (v0) |
| **3** | FastAPI backend (`/recipe`, `/options`, CORS, lazy-loading, Dockerfile) | **Done** |
| **4** | Next.js frontend (TypeScript + Tailwind CSS, App router) | **Done** |
| **5** | Free deployment | Not started |

### Current accuracy on 8,849 unique test requests (Jul to Dec 2023), from `reports/accuracy.md`:

| Output | Measure | Baseline | Model | Target |
|---|---|---|---|---|
| Gauge | exact | 88.8% | 96.3% | 97% |
| Machine dia | actual in top 2 | n/a | 85.5% | 90% |
| Yarn count | exact | 36.5% | 80.7% | 85% |
| Yarn count | within ±2 | 49.3% | 90.7% | 95% |
| Lycra denier | exact | 33.4% | 88.4% | 90% |
| Stitch length | within ±1 | 62.5% | 83.3% | 93% |

**Ship rule (agreed with the owner)**: a model version is released only if it meets every target on the fixed test set. All six currently fail, so nothing is released to factory production yet.

---

## Data

All factory data lives only on the owner's machine under `data/`, which is in `.gitignore`. **Never commit it, never paste buyer names or order numbers anywhere public.**

| File | What it holds | Used for |
|---|---|---|
| `data/raw/Knit_parameters.xlsx` | Knitting order history, sheets 2022 (50,930 rows) and 2023 (53,222 rows) | Everything |
| `Finishing_Machine_parameter.docx` | Factory SOP: finishing machine list and setting ranges | Not used in v1 |
| `data/processed/knit_clean.parquet` | All 76,382 rows that have a recipe, parsed | Pipeline output |
| `data/processed/knit_valid.parquet` | 75,221 rows passing validation | Training data |
| `data/processed/rejects.csv` | 1,161 rejected rows with a reason each | Audit, show the factory |
| `data/processed/train.parquet`, `test.parquet` | Time split (cutoff: 2023-07-01) | Models |

Trained model files (`ml/models/`) are built from this data and are git-ignored.

---

## Agreed requirements and decisions

These were settled with the owner; do not reopen them without asking her.

- **Output is the knitting recipe only.** No confidence badges and no list of past orders in the UI. Accuracy is proven in training and reported in `reports/accuracy.md`.
- **Inputs**: `knit` (Single/Double) and `gsm` are required. Optional: `fabric_type`, `composition`, `lycra`, `open/tube`, `finished width`, `buyer`, `shade`, `yarn type`. In practice the buyer's order almost always names fabric type and composition, so the UI should ask for them.
- **Accuracy is a per-output spec, not one number.**
- **Test protocol**: train on orders before 2023-07-01, test on orders from that date on; each unique request counts once; the test set never changes; no tuning against it.
- **Machine dia is shown as top 2** (e.g. "34 or 30"), because the floor uses whichever machine is free.
- **Stack**: Python backend (FastAPI), Next.js + TypeScript frontend (not React alone), GitHub, free hosting.
- **Pending owner decision**: whether yarn count and stitch length may also be shown as top 2 options.

---

## Remaining work

### Phase 3: API (Completed)
- [x] Confirm `GET /options` works
- [x] Add CORS middleware so the Next.js app can call the API (configured with `ALLOWED_ORIGINS` support for local dev and Vercel)
- [x] Lazy-load models in `api/predict.py`, then add API tests (valid request, 422 cases) that pass in CI
- [x] Dockerfile for the backend (supports Hugging Face Spaces on port 7860 and Render with dynamic `$PORT`)

### Phase 4: Next.js frontend (Completed)
- [x] Form: Single/Double and GSM required; fabric type, composition, buyer, yarn type as dropdowns from `/options`; lycra, open/tube, width, shade
- [x] Result view: machine dia (two), gauge, yarn count, lycra denier, stitch length. No confidence badges, no past orders
- [x] Production build verified (`next build` succeeds with zero errors)

### Phase 5: Deployment & Open Architecture Questions
- [ ] **Model files deployment strategy**: `ml/models/` is git-ignored, so the Docker build on cloud hosts will not have models by default. Decide between:
  1. **Private Hugging Face Model Hub**: Upload models to a private HF model repo and download them via token at container startup.
  2. **Direct to Private Space**: Push models directly to the private Space repository via Git LFS.
- [ ] **Factory data privacy approval**: `categories.json` contains real buyer names (e.g. George, H&M). Settle whether buyer names may sit on a private cloud container. If not approved, drop `Buyer`/`OrderNo` before deployment and retrain.
- [ ] **Production CORS**: Add the live Vercel frontend URL (e.g. `https://texhaab.vercel.app`) to the backend `ALLOWED_ORIGINS` environment variable.
- [ ] **Hosting**: Backend on Hugging Face Spaces or Render; frontend on Vercel.
- [ ] **Retraining before release**: Retrain on all data (train + test) once the target spec is met.

### Model improvements (in parallel)
- [ ] Parse exact fibre percentages (elastane %, polyester %) from Fabrication as numeric features
- [ ] Ask the factory QC/lab whether WPI/CPI records exist; if so, join by order and add as inputs
- [ ] If the owner agrees, serve yarn count and stitch length as top 2 and add those measures to `evaluate.py`
- [ ] Close the gauge gap (96.3% vs 97%)
