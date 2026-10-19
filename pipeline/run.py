import pandas as pd
from parsers import (parse_machine, parse_stitch_length, parse_fabric_dia,
                     parse_fabric_type, parse_composition, has_lycra, parse_yarn,
                     parse_gsm, parse_shade, parse_yarn_type)

RAW = "data/raw/Knit_parameters.xlsx"
OUT = "data/processed/knit_clean.parquet"

# 1. Load and combine both sheets
sheets = pd.read_excel(RAW, sheet_name=None)
keep = ["Buyer", "OrderNo", "Fabrication", "GSM", "Fab Dia", "Mc Dia",
        "Yarn Count", "Fab Color", "St Length", "OrderDate", "ProcLoss"]
data = pd.concat([df[keep] for df in sheets.values()], ignore_index=True)
data = data.replace(r"^\s*$", pd.NA, regex=True)
print("Raw rows:", len(data))

# 2. Drop rows with no recipe recorded
data = data.dropna(subset=["Mc Dia", "Yarn Count", "St Length", "GSM", "Fabrication"])
print("Rows with a recipe:", len(data))

# 3. Run every parser on every row
machine = data["Mc Dia"].apply(parse_machine)
data["mc_dia"] = [m[0] for m in machine]
data["gauge"] = [m[1] for m in machine]

fab_dia = data["Fab Dia"].apply(parse_fabric_dia)
data["form"] = [f[0] for f in fab_dia]
data["fab_width"] = [f[1] for f in fab_dia]

fab_type = data["Fabrication"].apply(parse_fabric_type)
data["fabric_type"] = [f[0] for f in fab_type]
data["knit"] = [f[1] for f in fab_type]

yarn = data["Yarn Count"].apply(parse_yarn)
data["yarn_count"] = [y[0] for y in yarn]
data["yarn_ply"] = [y[1] for y in yarn]
data["lycra_denier"] = [y[2] for y in yarn]

data["composition"] = data["Fabrication"].apply(parse_composition)
data["lycra"] = data["Fabrication"].apply(has_lycra)
data["stitch_length"] = data["St Length"].apply(parse_stitch_length)
data["gsm"] = data["GSM"].apply(parse_gsm)
data["shade"] = data["Fab Color"].apply(parse_shade)
data["yarn_type"] = data["Yarn Count"].apply(parse_yarn_type)

# 4. Report what the parsers couldn't read
new_cols = ["mc_dia", "gauge", "form", "fab_width", "fabric_type", "knit",
            "yarn_count", "yarn_ply", "lycra_denier", "composition", "lycra",
            "stitch_length", "gsm", "shade", "yarn_type"]
print()
print("Could not parse (per column):")
print(data[new_cols].isna().sum())

print()
print("Shade groups:", data["shade"].value_counts().to_dict())
print("Yarn types:  ", data["yarn_type"].value_counts().to_dict())

# Original columns: store as text so mixed types don't break saving
text_cols = ["Buyer", "OrderNo", "Fabrication", "GSM", "Fab Dia",
             "Mc Dia", "Yarn Count", "Fab Color", "St Length"]
for col in text_cols:
    data[col] = data[col].astype("string")

data["ProcLoss"] = pd.to_numeric(data["ProcLoss"], errors="coerce")

# 5. Save
data.to_parquet(OUT, index=False)
print()
print("Saved", len(data), "rows to", OUT)