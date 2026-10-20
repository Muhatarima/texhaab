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


def get_categories(train):
    """The list of known values for each category column, learned from train."""
    return {col: [str(v) for v in sorted(train[col].dropna().unique())]
            for col in CATEGORICAL}


def prepare(df, train=None, features=FEATURES, categories=None):
    """Turn the inputs into the format LightGBM needs.
    Give either the training data or a saved categories dictionary.
    Unseen values (e.g. a new buyer) become missing."""
    if categories is None:
        categories = get_categories(train)
    X = df[features].copy()

    # Category columns: only values seen in training are allowed
    for col in CATEGORICAL:
        if col not in features:
            continue
        known = categories[col]
        X[col] = X[col].astype("string")
        X[col] = X[col].where(X[col].isin(known))
        X[col] = pd.Categorical(X[col], categories=known)

    # Number columns must be real numbers, even when a value is missing
    for col in features:
        if col not in CATEGORICAL and col != "lycra":
            X[col] = pd.to_numeric(X[col], errors="coerce")

    if "lycra" in features:
        X["lycra"] = X["lycra"].astype(int)
    return X