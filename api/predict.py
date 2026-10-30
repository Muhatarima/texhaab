import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from ml.features import prepare, FEATURES
from pipeline.parsers import (
    parse_fiber_percentages,
    parse_fabric_type,
    parse_composition,
    has_lycra,
    parse_fabric_dia,
)

MODEL_DIR = Path("ml/models")

CATEGORIES = None
MODELS = None


def get_categories():
    """Load categories.json once and cache it in memory."""
    global CATEGORIES
    if CATEGORIES is None:
        cat_file = MODEL_DIR / "categories.json"
        if cat_file.exists():
            with open(cat_file, "r") as f:
                CATEGORIES = json.load(f)
        else:
            CATEGORIES = {}
    return CATEGORIES


def get_models():
    """Load trained models once and cache them in memory (lazy load)."""
    global MODELS
    if MODELS is None:
        MODELS = {
            name: joblib.load(MODEL_DIR / f"{name}.joblib")
            for name in ["gauge", "mc_dia", "yarn_count", "lycra_denier", "stitch_length"]
        }
    return MODELS


def get_options():
    """Return dropdown options for the frontend from categories.json."""
    cats = get_categories()
    return {
        "fabric_type": cats.get("fabric_type", []),
        "composition": cats.get("composition", []),
        "buyer": cats.get("Buyer", cats.get("buyer", [])),
        "yarn_type": cats.get("yarn_type", []),
        "shade": cats.get("shade", []),
        "form": cats.get("form", []),
    }


def get_recipe(req):
    """Turn one request (a dictionary) into a knitting recipe."""
    models = get_models()
    categories = get_categories()

    # 1. Parse raw Fabrication text if provided (e.g. from Excel paste)
    fabrication = req.get("fabrication")
    fabric_type = req.get("fabric_type")
    knit = req.get("knit")
    composition = req.get("composition")
    lycra = bool(req.get("lycra", False))

    if fabrication:
        p_type, p_knit = parse_fabric_type(fabrication)
        if not fabric_type and p_type:
            fabric_type = p_type
        if not knit and p_knit:
            knit = p_knit
        if not composition:
            composition = parse_composition(fabrication)
        if not lycra:
            lycra = has_lycra(fabrication)

    # 2. Parse raw Fab Dia text if provided (e.g. '70/ inch Open')
    form = req.get("form")
    fab_width = req.get("fab_width")
    fab_dia_text = req.get("fab_dia")
    if fab_dia_text:
        p_form, p_width = parse_fabric_dia(fab_dia_text)
        if not form and p_form:
            form = p_form
        if not fab_width and p_width:
            fab_width = p_width

    # 3. Determine fiber percentages
    cotton_pct = req.get("cotton_pct")
    poly_pct = req.get("poly_pct")
    elastane_pct = req.get("elastane_pct")
    viscose_pct = req.get("viscose_pct")

    # If fiber percentages are omitted, extract them from fabrication or composition
    if cotton_pct is None and poly_pct is None and elastane_pct is None and viscose_pct is None:
        text = fabrication or f"{fabric_type or ''} {composition or ''}"
        if lycra and "LYCRA" not in text.upper() and "ELASTANE" not in text.upper():
            text += " LYCRA"
        c, p, e, v = parse_fiber_percentages(text)
        cotton_pct, poly_pct, elastane_pct, viscose_pct = c, p, e, v

    # Fallback default knit if still not determined
    if not knit:
        knit = "Double" if (fabric_type and "Rib" in fabric_type) else "Single"

    # 4. One-row table with the same columns the models were trained on
    row = pd.DataFrame([{
        "fabric_type": fabric_type,
        "knit": knit,
        "composition": composition,
        "lycra": lycra,
        "gsm": req["gsm"],
        "form": form,
        "fab_width": fab_width,
        "Buyer": (req.get("buyer") or "").strip().upper() or None,
        "shade": req.get("shade", "Medium"),
        "yarn_type": req.get("yarn_type"),
        "cotton_pct": cotton_pct,
        "poly_pct": poly_pct,
        "elastane_pct": elastane_pct,
        "viscose_pct": viscose_pct,
    }])
    X = prepare(row, categories=categories)

    # 5. Gauge and Yarn Count
    gauge = int(models["gauge"].predict(X)[0])
    yarn_count = int(models["yarn_count"].predict(X)[0])

    # 6. Machine dia: chained with predicted gauge (top 2 suggestions, best first)
    row_dia = row.copy()
    row_dia["gauge"] = gauge
    DIA_FEATURES = FEATURES + ["gauge"]
    X_dia = prepare(row_dia, categories=categories, features=DIA_FEATURES)
    proba = models["mc_dia"].predict_proba(X_dia)[0]
    best_two = models["mc_dia"].classes_[np.argsort(proba)[::-1][:2]]
    machine_dia = [int(d) for d in best_two]

    # 7. Stitch length: chained with predicted gauge and yarn count
    row_sl = row.copy()
    row_sl["gauge"], row_sl["yarn_count"] = gauge, yarn_count
    X_sl = prepare(row_sl, categories=categories, features=FEATURES + ["gauge", "yarn_count"])
    stitch_length = round(float(models["stitch_length"].predict(X_sl)[0]) * 2) / 2

    # 8. Lycra denier, only for lycra fabrics
    lycra_denier = None
    if row["lycra"][0]:
        X_ly = prepare(row, categories=categories,
                       features=[f for f in FEATURES if f != "lycra"])
        lycra_denier = int(models["lycra_denier"].predict(X_ly)[0])

    # 9. Format industrial outputs cleanly without synthetic bluffing
    machine_setup = [f"{d}X{gauge}" for d in machine_dia]
    machine_setup_display = f"{machine_dia[0]}\" × {gauge}G (Alt: {machine_dia[1]}\" × {gauge}G)"

    # Combing / carding only applies to natural cotton
    spinning = req.get("yarn_type")
    has_cotton = (cotton_pct and cotton_pct > 0) or (composition and "Cotton" in composition)

    yarn_tokens = [f"{yarn_count}s/1 Ne"]
    if spinning and has_cotton:
        yarn_tokens.append(spinning)
    if composition:
        yarn_tokens.append(composition)

    yarn_spec = " ".join(yarn_tokens)
    if lycra_denier:
        yarn_spec += f" + {lycra_denier}D Lycra"

    return {
        "machine_dia": machine_dia,
        "gauge": gauge,
        "yarn_count": yarn_count,
        "lycra_denier": lycra_denier,
        "stitch_length": stitch_length,
        "machine_setup": machine_setup,
        "machine_setup_display": machine_setup_display,
        "yarn_spec": yarn_spec,
    }