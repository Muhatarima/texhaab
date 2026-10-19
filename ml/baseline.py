import pandas as pd

train = pd.read_parquet("data/processed/train.parquet")
test = pd.read_parquet("data/processed/test.parquet")

# Each unique buyer request counts once (repeated colour lines don't inflate scores)
REQUEST = ["OrderNo", "fabric_type", "composition", "lycra", "gsm", "form", "fab_width"]
test = test.drop_duplicates(subset=REQUEST)
print("Unique test requests:", len(test))

# The "dumb rule": most common value per fabric type, learned from training data
most_common = train.groupby("fabric_type").agg(
    gauge=("gauge", lambda s: s.mode()[0]),
    yarn_count=("yarn_count", lambda s: s.mode()[0]),
    stitch_length=("stitch_length", "median"),
)
print()
print(most_common)

# Apply the rule to every test request
guess_gauge = test["fabric_type"].map(most_common["gauge"])
guess_count = test["fabric_type"].map(most_common["yarn_count"])
guess_sl = test["fabric_type"].map(most_common["stitch_length"])

# Score it against what the factory really did
print()
print("BASELINE ACCURACY")
print(f"Gauge exact:          {(guess_gauge == test['gauge']).mean():.1%}")
print(f"Yarn count exact:     {(guess_count == test['yarn_count']).mean():.1%}")
print(f"Yarn count within 2:  {((guess_count - test['yarn_count']).abs() <= 2).mean():.1%}")
print(f"Stitch length within 1: {((guess_sl - test['stitch_length']).abs() <= 1).mean():.1%}")