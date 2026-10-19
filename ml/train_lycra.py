import pandas as pd
import lightgbm as lgb

train = pd.read_parquet("data/processed/train.parquet")
test = pd.read_parquet("data/processed/test.parquet")
REQUEST = ["OrderNo", "fabric_type", "composition", "lycra", "gsm", "form", "fab_width"]
test = test.drop_duplicates(subset=REQUEST)

# Only fabrics that have lycra AND a recorded denier
train = train[train["lycra"] & train["lycra_denier"].notna()]
test = test[test["lycra"] & test["lycra_denier"].notna()]
print("Lycra rows - train:", len(train), " test:", len(test))

FEATURES = ["fabric_type", "knit", "composition", "gsm", "form", "fab_width"]
CATEGORICAL = ["fabric_type", "knit", "composition", "form"]


def prepare(df):
    """Turn the inputs into the format LightGBM needs."""
    X = df[FEATURES].copy()
    for col in CATEGORICAL:
        X[col] = pd.Categorical(X[col], categories=sorted(train[col].dropna().unique()))
    return X


X_train, y_train = prepare(train), train["lycra_denier"].astype(int)
X_test, y_test = prepare(test), test["lycra_denier"].astype(int)

# Baseline: most common denier overall
baseline = (y_test == y_train.mode()[0]).mean()

model = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                           reg_lambda=1.0, verbose=-1)
model.fit(X_train, y_train)
exact = (model.predict(X_test) == y_test).mean()

print()
print(f"Baseline (most common denier): {baseline:.1%}")
print(f"Model lycra denier exact:      {exact:.1%}    (target 90%)")