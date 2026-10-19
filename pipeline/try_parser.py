from parsers import parse_shade

tests = ["01-Puma Black", "Medium Gray Heather", "02-Puma White",
         "NAVY BLAZER", "DARK GREY MELANGE", "LT PINK", "12-330"]

for t in tests:
    print(t, "->", parse_shade(t))