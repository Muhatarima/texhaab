import pandas as pd

data = pd.read_parquet("data/processed/knit_clean.parquet")

checks = [("gsm", "GSM"),
          ("yarn_count", "Yarn Count"),
          ("fabric_type", "Fabrication")]

for clean_col, raw_col in checks:
    failed = data[data[clean_col].isna()]
    print()
    print(f"{clean_col}: {len(failed)} failed. Most common raw values:")
    print(failed[raw_col].value_counts().head(10))