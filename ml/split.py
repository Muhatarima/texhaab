import pandas as pd

CUTOFF = "2023-07-01"

data = pd.read_parquet("data/processed/knit_valid.parquet")

# Make sure OrderDate is a real date, not text
data["OrderDate"] = pd.to_datetime(data["OrderDate"], errors="coerce")
print("Rows with no readable date:", data["OrderDate"].isna().sum())

train = data[data["OrderDate"] < CUTOFF]
test = data[data["OrderDate"] >= CUTOFF]

print()
print("Train:", len(train), "rows, from", train["OrderDate"].min().date(),
      "to", train["OrderDate"].max().date())
print("Test: ", len(test), "rows, from", test["OrderDate"].min().date(),
      "to", test["OrderDate"].max().date())

train.to_parquet("data/processed/train.parquet", index=False)
test.to_parquet("data/processed/test.parquet", index=False)