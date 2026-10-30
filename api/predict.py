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
FACTORY_REF = None


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


def get_factory_reference():
    """Load real historical factory orders from Excel parquet."""
    global FACTORY_REF
    if FACTORY_REF is None:
        ref_file = MODEL_DIR / "factory_reference.parquet"
        if ref_file.exists():
            FACTORY_REF = pd.read_parquet(ref_file)
        else:
            FACTORY_REF = pd.DataFrame()
    return FACTORY_REF


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
    """Turn one request (a dictionary) into a knitting recipe with factory data validation."""
    models = get_models()
    categories = get_categories()

    # 1. Parse raw Fabrication text if provided
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

    # 2. Parse raw Fab Dia text if provided
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

    if cotton_pct is None and poly_pct is None and elastane_pct is None and viscose_pct is None:
        text = fabrication or f"{fabric_type or ''} {composition or ''}"
        if lycra and "LYCRA" not in text.upper() and "ELASTANE" not in text.upper():
            text += " LYCRA"
        c, p, e, v = parse_fiber_percentages(text)
        cotton_pct, poly_pct, elastane_pct, viscose_pct = c, p, e, v

    # Fallback default knit if still not determined
    if not knit:
        knit = "Double" if (fabric_type and "Rib" in fabric_type) else "Single"

    # 4. One-row table with the exact columns models were trained on
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

    # 5. ML Model Predictions
    gauge = int(models["gauge"].predict(X)[0])
    yarn_count = int(models["yarn_count"].predict(X)[0])

    # Machine Dia (Chained with gauge)
    row_dia = row.copy()
    row_dia["gauge"] = gauge
    DIA_FEATURES = FEATURES + ["gauge"]
    X_dia = prepare(row_dia, categories=categories, features=DIA_FEATURES)
    proba = models["mc_dia"].predict_proba(X_dia)[0]
    best_two = models["mc_dia"].classes_[np.argsort(proba)[::-1][:2]]
    machine_dia = [int(d) for d in best_two]

    # Stitch Length (Chained with gauge & yarn_count)
    row_sl = row.copy()
    row_sl["gauge"], row_sl["yarn_count"] = gauge, yarn_count
    X_sl = prepare(row_sl, categories=categories, features=FEATURES + ["gauge", "yarn_count"])
    stitch_length = round(float(models["stitch_length"].predict(X_sl)[0]) * 2) / 2

    # Lycra Denier
    lycra_denier = None
    if row["lycra"][0]:
        X_ly = prepare(row, categories=categories,
                       features=[f for f in FEATURES if f != "lycra"])
        lycra_denier = int(models["lycra_denier"].predict(X_ly)[0])

    # 6. Industrial notation
    machine_setup = [f"{d}X{gauge}" for d in machine_dia]
    machine_setup_display = f"{machine_dia[0]}\" × {gauge}G (or {machine_dia[1]}\" × {gauge}G)"

    # 7. Real Historical Orders directly from Excel dataset (Knit parameters.xlsx)
    ref = get_factory_reference()
    historical_orders = []
    expected_proc_loss = None

    if not ref.empty:
        sub = ref
        if composition and (sub["composition"] == composition).any():
            sub = sub[sub["composition"] == composition]

        if fabric_type and (sub["fabric_type"] == fabric_type).any():
            sub = sub[sub["fabric_type"] == fabric_type]

        if lycra is not None and (sub["lycra"] == lycra).any():
            lycra_match = sub[sub["lycra"] == lycra]
            if not lycra_match.empty:
                sub = lycra_match

        gsm_val = float(req["gsm"])
        gsm_match = sub[abs(sub["gsm"] - gsm_val) <= 25]
        if not gsm_match.empty:
            sub = gsm_match
        else:
            gsm_match = sub[abs(sub["gsm"] - gsm_val) <= 50]
            if not gsm_match.empty:
                sub = gsm_match

        buyer_val = (req.get("buyer") or "").strip().upper()
        if buyer_val and (sub["Buyer"] == buyer_val).any():
            buyer_match = sub[sub["Buyer"] == buyer_val]
            if not buyer_match.empty:
                sub = buyer_match

        valid_losses = sub["ProcLoss"].dropna()
        valid_losses = valid_losses[valid_losses > 0]
        if not valid_losses.empty:
            expected_proc_loss = round(float(valid_losses.median()), 1)

        records = sub.drop_duplicates(subset=["OrderNo"]).head(3)
        for _, r in records.iterrows():
            historical_orders.append({
                "order_no": str(r["OrderNo"]),
                "buyer": str(r["Buyer"]),
                "fabrication": str(r["Fabrication"]),
                "gsm": float(r["GSM"]) if pd.notna(r["GSM"]) else gsm_val,
                "fab_dia": str(r["Fab Dia"]) if pd.notna(r["Fab Dia"]) else "",
                "mc_dia": str(r["Mc Dia"]),
                "yarn_count": str(r["Yarn Count"]),
                "st_length": str(r["St Length"]),
                "proc_loss": float(r["ProcLoss"]) if pd.notna(r["ProcLoss"]) and r["ProcLoss"] > 0 else None,
            })

    return {
        "machine_dia": machine_dia,
        "gauge": gauge,
        "yarn_count": yarn_count,
        "lycra_denier": lycra_denier,
        "stitch_length": stitch_length,
        "machine_setup": machine_setup,
        "machine_setup_display": machine_setup_display,
        "expected_proc_loss": expected_proc_loss,
        "historical_orders": historical_orders,
    }