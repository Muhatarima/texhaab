import pandas as pd

TRAIN_FILE = "data/processed/train.parquet"
TEST_FILE = "data/processed/test.parquet"

# One test row per unique buyer request
REQUEST = ["OrderNo", "fabric_type", "composition", "lycra", "gsm", "form", "fab_width"]

# Inputs the models use
FEATURES = ["fabric_type", "knit", "composition", "lycra", "gsm", "form", "fab_width",
            "Buyer", "shade", "yarn_type"]
CATEGORICAL = ["fabric_type", "knit", "composition", "form",
               "Buyer", "shade", "yarn_type"]


def load():
    """Load train and test, keep one test row per request, tidy buyer names."""
    train = pd.read_parquet(TRAIN_FILE)
    test = pd.read_parquet(TEST_FILE).drop_duplicates(subset=REQUEST)
    for df in (train, test):
        df["Buyer"] = df["Buyer"].str.strip().str.upper()
    return train, test


def prepare(df, train, features=FEATURES):
    """Turn the inputs into the format LightGBM needs.
    Categories are learned from train; unseen values become missing."""
    X = df[features].copy()
    for col in CATEGORICAL:
        if col not in features:
            continue
        known = sorted(train[col].dropna().unique())
        X[col] = X[col].where(X[col].isin(known))
        X[col] = pd.Categorical(X[col], categories=known)
    if "lycra" in features:
        X["lycra"] = X["lycra"].astype(int)
    return X