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