from parsers import parse_stitch_length

for t in ["28", "28,0", "1", "1,1", "2.85", "10,15,4.5", "77,30", "260"]:
    print(t, "->", parse_stitch_length(t))