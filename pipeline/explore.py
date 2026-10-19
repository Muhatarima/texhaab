import pandas as pd

path = "data/raw/Knit_parameters.xlsx"
sheets = pd.read_excel(path, sheet_name=None)

# Only the columns the recipe needs
keep = ["Buyer", "OrderNo", "Fabrication", "GSM", "Fab Dia",
        "Mc Dia", "Yarn Count", "Fab Color", "St Length",
        "OrderDate", "ProcLoss"]

# Take those columns from each sheet, then stack them into one table
tables = [df[keep] for df in sheets.values()]
data = pd.concat(tables, ignore_index=True)
# Cells with only spaces (or nothing) count as missing
data = data.replace(r"^\s*$", pd.NA, regex=True)

print("Total rows:", len(data))
print()
print("Empty cells per column:")
print(data.isna().sum())

# The recipe columns the model must learn
targets = ["Mc Dia", "Yarn Count", "St Length", "GSM", "Fabrication"]

usable = data.dropna(subset=targets)

print()
print("Usable rows:", len(usable))
print("Removed rows:", len(data) - len(usable))