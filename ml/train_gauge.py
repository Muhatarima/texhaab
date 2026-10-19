import pandas as pd
import lightgbm as lgb

train = pd.read_parquet("data/processed/train.parquet")
test = pd.read_parquet("data/processed/test.parquet")
REQUEST = ["OrderNo", "fabric_type", "composition", "lycra", "gsm", "form", "fab_width"]
test = test.drop_duplicates(subset=REQUEST)

# Inputs: only what the buyer tells us
FEATURES = ["fabric_type", "knit", "composition", "lycra", "gsm", "form", "fab_width"]
CATEGORICAL = ["fabric_type", "knit", "composition", "form"]


def prepare(df):
    """Turn the inputs into the format LightGBM needs."""
    X = df[FEATURES].copy()
    for col in CATEGORICAL:
        # Same list of categories for train and test, learned from train
        X[col] = pd.Categorical(X[col], categories=sorted(train[col].dropna().unique()))
    X["lycra"] = X["lycra"].astype(int)
    return X


X_train, y_train = prepare(train), train["gauge"].astype(int)
X_test, y_test = prepare(test), test["gauge"].astype(int)

# Train
model = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                           reg_lambda=1.0, verbose=-1)
model.fit(X_train, y_train)

# Predict on orders the model has never seen, and score
predicted = model.predict(X_test)
accuracy = (predicted == y_test).mean()

print("Baseline gauge accuracy: 88.8%")
print(f"Model gauge accuracy:    {accuracy:.1%}")