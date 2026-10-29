import json
import os
import joblib
import lightgbm as lgb
from features import load, prepare, FEATURES, CATEGORICAL

MODEL_DIR = "ml/models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Train on all validated dataset rows (75,221 rows)
train, _ = load(full=True)
print("Training on full validated dataset:", len(train), "rows")


def new_classifier():
    return lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                              reg_lambda=1.0, verbose=-1, n_jobs=-1)


# 1. Gauge and Yarn Count
X_train = prepare(train, train)

for target in ["gauge", "yarn_count"]:
    print(f"Fitting {target}...")
    model = new_classifier().fit(X_train, train[target].astype(int))
    joblib.dump(model, f"{MODEL_DIR}/{target}.joblib")
    print("Saved", target)

# 2. Machine Dia (Chained with Gauge)
DIA_FEATURES = FEATURES + ["gauge"]
print("Fitting mc_dia (chained with gauge)...")
X_train_dia = prepare(train, train, DIA_FEATURES)
model_dia = new_classifier().fit(X_train_dia, train["mc_dia"].astype(int))
joblib.dump(model_dia, f"{MODEL_DIR}/mc_dia.joblib")
print("Saved mc_dia")

# 3. Lycra denier: only lycra fabrics, without the lycra boolean input
lycra_rows = train[train["lycra"] & train["lycra_denier"].notna()]
LYCRA_FEATURES = [f for f in FEATURES if f != "lycra"]
print("Fitting lycra_denier...")
model_ly = new_classifier().fit(prepare(lycra_rows, train, LYCRA_FEATURES),
                                lycra_rows["lycra_denier"].astype(int))
joblib.dump(model_ly, f"{MODEL_DIR}/lycra_denier.joblib")
print("Saved lycra_denier")

# 4. Stitch length: chained with gauge and yarn count
SL_FEATURES = FEATURES + ["gauge", "yarn_count"]
print("Fitting stitch_length (chained with gauge and yarn count)...")
model_sl = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05,
                             reg_lambda=1.0, verbose=-1, n_jobs=-1)
model_sl.fit(prepare(train, train, SL_FEATURES), train["stitch_length"])
joblib.dump(model_sl, f"{MODEL_DIR}/stitch_length.joblib")
print("Saved stitch_length")

# 5. Save the category lists, so the app can prepare inputs without the training data
categories = {col: [str(v) for v in sorted(train[col].dropna().unique())]
              for col in CATEGORICAL}
with open(f"{MODEL_DIR}/categories.json", "w") as f:
    json.dump(categories, f, indent=2)
print("Saved categories with", sum(len(v) for v in categories.values()), "total categories across", len(categories), "columns")