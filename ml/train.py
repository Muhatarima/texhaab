import json
import os
import joblib
import lightgbm as lgb
from features import load, prepare, FEATURES, CATEGORICAL

MODEL_DIR = "ml/models"
os.makedirs(MODEL_DIR, exist_ok=True)

train, _ = load()
print("Training on", len(train), "rows")


def new_classifier():
    return lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                              reg_lambda=1.0, verbose=-1)


X_train = prepare(train, train)

# 1. Gauge, machine dia, yarn count: same inputs, different answers
for target in ["gauge", "mc_dia", "yarn_count"]:
    model = new_classifier().fit(X_train, train[target].astype(int))
    joblib.dump(model, f"{MODEL_DIR}/{target}.joblib")
    print("Saved", target)

# 2. Lycra denier: only lycra fabrics, without the lycra input
lycra_rows = train[train["lycra"] & train["lycra_denier"].notna()]
LYCRA_FEATURES = [f for f in FEATURES if f != "lycra"]
model = new_classifier().fit(prepare(lycra_rows, train, LYCRA_FEATURES),
                             lycra_rows["lycra_denier"].astype(int))
joblib.dump(model, f"{MODEL_DIR}/lycra_denier.joblib")
print("Saved lycra_denier")

# 3. Stitch length: also sees gauge and yarn count (the chain)
SL_FEATURES = FEATURES + ["gauge", "yarn_count"]
model = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05,
                          reg_lambda=1.0, verbose=-1)
model.fit(prepare(train, train, SL_FEATURES), train["stitch_length"])
joblib.dump(model, f"{MODEL_DIR}/stitch_length.joblib")
print("Saved stitch_length")

# 4. Save the category lists, so the app can prepare inputs without the training data
categories = {col: [str(v) for v in sorted(train[col].dropna().unique())]
              for col in CATEGORICAL}
with open(f"{MODEL_DIR}/categories.json", "w") as f:
    json.dump(categories, f, indent=2)
print("Saved categories")