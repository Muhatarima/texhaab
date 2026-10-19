from pipeline.parsers import (parse_machine, parse_stitch_length, parse_fabric_dia,
                              parse_fabric_type, parse_composition, has_lycra,
                              parse_yarn, parse_gsm)


# Machine dia x gauge
def test_machine_normal():
    assert parse_machine("34X24") == (34, 24)

def test_machine_lowercase():
    assert parse_machine("34x24") == (34, 24)

def test_machine_with_spaces():
    assert parse_machine("36 X 18") == (36, 18)

def test_machine_nonsense():
    assert parse_machine("nonsense") == (None, None)


# Stitch length
def test_stitch_length_plain():
    assert parse_stitch_length("28") == 28.0

def test_stitch_length_second_yarn():
    assert parse_stitch_length("26.5,0") == 26.5

def test_stitch_length_placeholder():
    assert parse_stitch_length("1,1") is None

def test_stitch_length_wrong_unit():
    assert parse_stitch_length("2.85") == 28.5


# Fabric dia
def test_fabric_dia_open():
    assert parse_fabric_dia("70/ inch Open") == ("Open", 70.0)

def test_fabric_dia_any_tube():
    assert parse_fabric_dia("0/ inch ANY TUBE") == ("Tube", None)

def test_fabric_dia_cm_with_inch():
    assert parse_fabric_dia("188 CM (74 INCH) OPEN") == ("Open", 74.0)


# Fabric type
def test_fabric_type_rib():
    assert parse_fabric_type("1X1 L RIB 95% COTTON 5% ELASTANE") == ("Rib", "Double")

def test_fabric_type_pique_interlock():
    assert parse_fabric_type("PIQUE INTERLOCK 100% COTTON") == ("Pique Interlock", "Double")

def test_fabric_type_brushback_is_fleece():
    assert parse_fabric_type("3 THREAD BRUSHBACK 80% BCI COTTON") == ("Fleece", "Single")


# Composition and lycra
def test_composition_cvc_with_viscose():
    assert parse_composition("FLEECE 77% COTTON 20% POLYESTER 3% VISCOSE") == "Cotton/Poly"

def test_lycra_letter_l():
    assert has_lycra("1X1 L RIB 95% COTTON") is True

def test_no_lycra_in_plated():
    assert has_lycra("1X1 PLATED RIB 80% COTTON 20% POLYESTER") is False


# Yarn
def test_yarn_with_lycra():
    assert parse_yarn("30S1-BCI COTTON-100%-CH,40D-LYCRA-100%-H350-SD") == (30, 1, 40)

def test_yarn_two_ply():
    assert parse_yarn("TW40S2-COTTON-100%-CH BCI") == (40, 2, None)

def test_yarn_polyester_not_lycra():
    assert parse_yarn("30S1-COTTON,75D-POLYESTER-36F-DTY") == (30, 1, None)


# GSM
def test_gsm_plain():
    assert parse_gsm("160") == 160.0

def test_gsm_range():
    assert parse_gsm("220-230") == 225.0