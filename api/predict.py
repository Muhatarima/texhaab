import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from ml.features import prepare, FEATURES

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

    # 1. One-row table with the same columns the models were trained on
    row = pd.DataFrame([{
        "fabric_type": req.get("fabric_type"),
        "knit": req["knit"],
        "composition": req.get("composition"),
        "lycra": req.get("lycra", False),
        "gsm": req["gsm"],
        "form": req.get("form"),
        "fab_width": req.get("fab_width"),
        "Buyer": (req.get("buyer") or "").strip().upper() or None,
        "shade": req.get("shade", "Medium"),
        "yarn_type": req.get("yarn_type"),
    }])
    X = prepare(row, categories=categories)

    # 2. Gauge and yarn count
    gauge = int(models["gauge"].predict(X)[0])
    yarn_count = int(models["yarn_count"].predict(X)[0])

    # 3. Machine dia: top 2 suggestions, best first
    proba = models["mc_dia"].predict_proba(X)[0]
    best_two = models["mc_dia"].classes_[np.argsort(proba)[::-1][:2]]
    machine_dia = [int(d) for d in best_two]

    # 4. Stitch length, using the predicted gauge and yarn count (the chain)
    row["gauge"], row["yarn_count"] = gauge, yarn_count
    X_sl = prepare(row, categories=categories, features=FEATURES + ["gauge", "yarn_count"])
    stitch_length = round(float(models["stitch_length"].predict(X_sl)[0]) * 2) / 2

    # 5. Lycra denier, only for lycra fabrics
    lycra_denier = None
    if row["lycra"][0]:
        X_ly = prepare(row, categories=categories,
                       features=[f for f in FEATURES if f != "lycra"])
        lycra_denier = int(models["lycra_denier"].predict(X_ly)[0])

    return {
        "machine_dia": machine_dia,
        "gauge": gauge,
        "yarn_count": yarn_count,
        "lycra_denier": lycra_denier,
        "stitch_length": stitch_length,
    }