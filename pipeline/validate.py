import pandas as pd

# Realistic ranges for knitting: (lowest allowed, highest allowed)
RULES = {
    "gsm": (60, 600),
    "gauge": (5, 40),
    "mc_dia": (10, 60),
    "yarn_count": (6, 100),
    "stitch_length": (5, 90),
}

# Which original Excel column each clean column came from
RAW_COLUMN = {
    "gsm": "GSM",
    "gauge": "Mc Dia",
    "mc_dia": "Mc Dia",
    "yarn_count": "Yarn Count",
    "stitch_length": "St Length",
}

data = pd.read_parquet("data/processed/knit_clean.parquet")

# 1. Count values outside each range
for col, (low, high) in RULES.items():
    values = data[col]
    too_low = (values < low).sum()
    too_high = (values > high).sum()
    print(f"{col}: {too_low} below {low}, {too_high} above {high}")

# 2. Show how the out-of-range values were written in Excel
for col, (low, high) in RULES.items():
    outside = data[(data[col] < low) | (data[col] > high)]
    if len(outside) > 0:
        print()
        print(f"{col} outside {low}-{high} (raw value as written):")
        print(outside[RAW_COLUMN[col]].value_counts().head(10))





# 3. Mark every row that breaks a rule, with the reason
REQUIRED = ["fabric_type", "composition", "gsm", "mc_dia", "gauge",
            "yarn_count", "stitch_length"]

data["reject_reason"] = ""

for col in REQUIRED:
    missing = data[col].isna()
    data.loc[missing, "reject_reason"] += f"missing {col}; "

for col, (low, high) in RULES.items():
    outside = (data[col] < low) | (data[col] > high)
    data.loc[outside, "reject_reason"] += f"{col} outside {low}-{high}; "

# 4. Split and save
rejected = data[data["reject_reason"] != ""]
valid = data[data["reject_reason"] == ""].drop(columns="reject_reason")

rejected.to_csv("data/processed/rejects.csv", index=False)
valid.to_parquet("data/processed/knit_valid.parquet", index=False)

print()
print("Valid rows:", len(valid))
print("Rejected rows:", len(rejected))
print()
print("Top reject reasons:")
print(rejected["reject_reason"].value_counts().head(10))