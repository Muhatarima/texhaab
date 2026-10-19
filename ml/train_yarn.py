import pandas as pd
import lightgbm as lgb

train = pd.read_parquet("data/processed/train.parquet")
test = pd.read_parquet("data/processed/test.parquet")
REQUEST = ["OrderNo", "fabric_type", "composition", "lycra", "gsm", "form", "fab_width"]
test = test.drop_duplicates(subset=REQUEST)

FEATURES = ["fabric_type", "knit", "composition", "lycra", "gsm", "form", "fab_width"]
CATEGORICAL = ["fabric_type", "knit", "composition", "form"]


def prepare(df):
    """Turn the inputs into the format LightGBM needs."""
    X = df[FEATURES].copy()
    for col in CATEGORICAL:
        X[col] = pd.Categorical(X[col], categories=sorted(train[col].dropna().unique()))
    X["lycra"] = X["lycra"].astype(int)
    return X


X_train, y_train = prepare(train), train["yarn_count"].astype(int)
X_test, y_test = prepare(test), test["yarn_count"].astype(int)

# Train
model = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                           reg_lambda=1.0, verbose=-1)
model.fit(X_train, y_train)

# Predict and score
predicted = model.predict(X_test)
exact = (predicted == y_test).mean()
within_2 = (abs(predicted - y_test) <= 2).mean()

print("                  Baseline   Model    Target")
print(f"Yarn count exact:   36.5%     {exact:.1%}    85%")
print(f"Within 2:           49.3%     {within_2:.1%}    95%")