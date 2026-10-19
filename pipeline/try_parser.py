from parsers import parse_yarn_type

tests = ["26S1-COTTON-100%-IC2-CH",
         "TW40S2-COTTON-100%-CH COMP ORGANIC",
         "30S1-BCI COTTON-100%-KH",
         "24S1-CVC-(60%+40%)-KH,40D-LYCRA-100%-H350-SD",
         "75D-POLYESTER-72F-RECYCLE POLY-SD RW SIM"]

for t in tests:
    print(t, "->", parse_yarn_type(t))