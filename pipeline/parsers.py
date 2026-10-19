import re


def parse_machine(text):
    """Turn '34X24' into (34, 24). Returns (None, None) if it can't."""
    text = str(text).upper()
    match = re.search(r"(\d+)\s*X\s*(\d+)", text)
    if match is None:
        return None, None
    dia = int(match.group(1))
    gauge = int(match.group(2))
    return dia, gauge

def parse_stitch_length(text):
    """Turn '28,0' or '26.5' into 28.0 or 26.5. Returns None if it can't.
    Fixes values written in the wrong unit (2.85 -> 28.5)
    and rejects placeholders like '1'."""
    text = str(text).replace(" ", "")
    match = re.match(r"(\d+(\.\d+)?)", text)
    if match is None:
        return None
    value = float(match.group(1))

    if value < 2:
        return None          # placeholder, not a real stitch length
    if value < 5:
        return value * 10    # written in the wrong unit
    return value


def parse_fabric_dia(text):
    """Turn '70/ inch Open' into ('Open', 70.0). Width is None if not given."""
    text = str(text).upper()

    # 1. Open or tube?
    if "TUBE" in text:
        form = "Tube"
    elif "OPEN" in text:
        form = "Open"
    else:
        form = None

    # 2-4. Find the width in inches
    width = None
    inch_in_brackets = re.search(r"\((\d+(\.\d+)?)\s*INCH", text)
    cm = re.search(r"(\d+(\.\d+)?)\s*CM", text)
    any_number = re.search(r"(\d+(\.\d+)?)", text)

    if inch_in_brackets:
        width = float(inch_in_brackets.group(1))
    elif cm:
        width = round(float(cm.group(1)) / 2.54, 1)
    elif any_number:
        width = float(any_number.group(1))

    # 5. Ignore 0 and impossible widths
    if width is not None and (width < 10 or width > 110):
        width = None

    return form, width


# Checked top to bottom: specific names before general ones
FABRIC_TYPES = [
    ("PIQUE INTERLOCK", "Pique Interlock"),
    ("FRENCH TERRY", "French Terry"),
    ("FLEECE", "Fleece"),
    ("BRUSHBACK", "Fleece"),
    ("LOOPBACK", "French Terry"),
    ("TERRY", "Terry"),
    ("PIQUE", "Pique"),
    ("INTERLOCK", "Interlock"),
    ("WAFFLE", "Waffle"),
    ("POINT", "Pointelle"),
    ("RIB", "Rib"),
    ("SLUB", "Slub S/J"),
    ("S/J", "Single Jersey"),
    ("SINGLE JERSEY", "Single Jersey"),
    ("JERSEY", "Single Jersey"),
]

DOUBLE_KNITS = ["Rib", "Interlock", "Pointelle", "Waffle", "Pique Interlock"]


def parse_fabric_type(text):
    """Turn '1X1 L RIB 95% COTTON...' into ('Rib', 'Double')."""
    text = str(text).upper()
    for keyword, name in FABRIC_TYPES:
        if keyword in text:
            knit = "Double" if name in DOUBLE_KNITS else "Single"
            return name, knit
    return None, None


def parse_composition(text):
    """Turn 'FLEECE 80% COTTON 20% POLYESTER' into a fiber family name."""
    text = str(text).upper()
    cotton = "COTTON" in text
    poly = "POLY" in text
    viscose = "VISCOSE" in text
    modal = "MODAL" in text

    if viscose and not cotton:
        return "Viscose"
    if modal:
        return "Cotton/Modal"
    if poly and cotton:
        return "Cotton/Poly"
    if viscose:
        return "Cotton/Viscose"
    if poly:
        return "Polyester"
    if cotton:
        return "Cotton"
    return None


def has_lycra(text):
    """True if the fabric contains lycra / elastane / spandex."""
    text = str(text).upper()
    if re.search(r"ELASTANE|LYCRA|SPANDEX", text):
        return True
    # 'L' written before the fabric name, e.g. '1X1 L RIB', 'L S/J'
    if re.search(r"\bL[\s-]?(S/J|SINGLE|SLUB|TERRY|PIQUE|RIB|FLEECE|INTERLOCK)", text):
        return True
    return False


def parse_yarn(text):
    """Turn '30S1-...,40D-LYCRA...' into (30, 1, 40) and 'TW40S2-...' into (40, 2, None).
    Returns: main yarn count, ply, lycra denier (or None)."""
    text = str(text).upper()

    count, ply = None, None
    count_match = re.search(r"(\d{1,3})S(\d)", text)
    if count_match:
        count = int(count_match.group(1))
        ply = int(count_match.group(2))

    denier = None
    denier_match = re.search(r"(\d{2,3})D-(LYCRA|SPANDEX|ELASTANE)", text)
    if denier_match:
        denier = int(denier_match.group(1))

    return count, ply, denier


def parse_gsm(text):
    """Turn '160' into 160.0 and a range '220-230' into its middle, 225.0."""
    numbers = re.findall(r"\d+(?:\.\d+)?", str(text))
    if not numbers:
        return None
    values = [float(n) for n in numbers[:2]]
    return sum(values) / len(values)



def parse_shade(text):
    """Group a colour name into Light, Medium, Dark or Melange."""
    text = str(text).upper()
    if re.search(r"MEL|HEATHER|MARL|GRINDLE", text):
        return "Melange"
    if re.search(r"BLACK|NAVY|DARK|DK\b|BURGUNDY|MAROON|CHARCOAL|DEEP|OLIVE|ANTHRA", text):
        return "Dark"
    if re.search(r"WHITE|ECRU|IVORY|CREAM|LIGHT|LT\b|PASTEL|PALE|NATURAL|OPTIC", text):
        return "Light"
    return "Medium"


def parse_yarn_type(text):
    """Find how the main yarn was spun: Compact, Combed, Carded or Other."""
    main_yarn = str(text).upper().split(",")[0]
    if "COMP" in main_yarn:
        return "Compact"
    if re.search(r"-CH\b|COMB", main_yarn):
        return "Combed"
    if re.search(r"-KH\b|CARD", main_yarn):
        return "Carded"
    return "Other"