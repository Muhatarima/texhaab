import json
import os
from datetime import date
import joblib
import numpy as np
from features import load, prepare, FEATURES

MODEL_DIR = "ml/models"
REPORT = "reports/accuracy.md"

# Load test orders, saved models and saved categories (no training data used)
_, test = load()
with open(f"{MODEL_DIR}/categories.json") as f:
    cats = json.load(f)
models = {name: joblib.load(f"{MODEL_DIR}/{name}.joblib")
          for name in ["gauge", "mc_dia", "yarn_count", "lycra_denier", "stitch_length"]}

X = prepare(test, categories=cats)
results = []   # (output, measure, score, target)

# Gauge
gauge = models["gauge"].predict(X)
results.append(("Gauge", "exact", (gauge == test["gauge"]).mean(), 0.97))

# Machine dia: actual in top 2 (chained with predicted gauge)
chain_dia = test.copy()
chain_dia["gauge"] = gauge
DIA_FEATURES = FEATURES + ["gauge"]
proba = models["mc_dia"].predict_proba(prepare(chain_dia, features=DIA_FEATURES, categories=cats))
top2 = models["mc_dia"].classes_[np.argsort(proba, axis=1)[:, -2:]]
in_top2 = np.mean([a in g for a, g in zip(test["mc_dia"], top2)])
results.append(("Machine dia", "actual in top 2", in_top2, 0.90))

# Yarn count
yarn = models["yarn_count"].predict(X)
results.append(("Yarn count", "exact", (yarn == test["yarn_count"]).mean(), 0.85))
results.append(("Yarn count", "within 2", (abs(yarn - test["yarn_count"]) <= 2).mean(), 0.95))

# Lycra denier: lycra fabrics only
ly = test[test["lycra"] & test["lycra_denier"].notna()]
LYCRA_FEATURES = [f for f in FEATURES if f != "lycra"]
denier = models["lycra_denier"].predict(prepare(ly, features=LYCRA_FEATURES, categories=cats))
results.append(("Lycra denier", "exact", (denier == ly["lycra_denier"]).mean(), 0.90))

# Stitch length: uses the PREDICTED gauge and yarn count (the chain)
chain = test.copy()
chain["gauge"], chain["yarn_count"] = gauge, yarn
SL_FEATURES = FEATURES + ["gauge", "yarn_count"]
sl = models["stitch_length"].predict(prepare(chain, features=SL_FEATURES, categories=cats))
results.append(("Stitch length", "within 1", (abs(sl - test["stitch_length"]) <= 1).mean(), 0.93))

# Print and write the report
lines = [f"# texHAAB accuracy report ({date.today()})", "",
         f"Test set: {len(test)} unique requests, Jul-Dec 2023.", "",
         "| Output | Measure | Score | Target | Status |",
         "|---|---|---|---|---|"]
for output, measure, score, target in results:
    status = "PASS" if score >= target else "FAIL"
    lines.append(f"| {output} | {measure} | {score:.1%} | {target:.0%} | {status} |")
    print(f"{output:14} {measure:16} {score:6.1%}   target {target:.0%}   {status}")

os.makedirs("reports", exist_ok=True)
with open(REPORT, "w") as f:
    f.write("\n".join(lines) + "\n")
print()
print("Report written to", REPORT)