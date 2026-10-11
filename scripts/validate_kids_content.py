#!/usr/bin/env python3
"""Pre-release content and illustration checks for the five preschool worlds."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "src/data/content.json").read_text(encoding="utf-8"))
EXPECTED_WORLDS = {"warna", "bentuk", "hewan", "angka", "huruf"}
assert len(DATA["worlds"]) == 5
assert {world["id"] for world in DATA["worlds"]} == EXPECTED_WORLDS
question_ids = set()
total = 0
for world in DATA["worlds"]:
    for group in ("3", "5"):
        questions = world["levels"][group]
        assert 3 <= len(questions) <= 4, f"Expected a 3–4 question bank per difficulty group: {world['id']}"
        for question in questions:
            total += 1
            assert question["id"] not in question_ids, "Duplicate question ID"
            question_ids.add(question["id"])
            options = question["options"]
            assert len(options) >= 2, f"Too few answers: {question['id']}"
            assert len({choice["id"] for choice in options}) == len(options)
            assert question["answer"] in {choice["id"] for choice in options}
            for choice in options:
                assert choice["label"].strip(), f"Missing label in {question['id']}"
                if world["id"] == "warna":
                    assert re.fullmatch(r"#[0-9a-fA-F]{6}", choice.get("color", "")), (
                        f"Color choice must provide full-card color: {question['id']}"
                    )
                if choice.get("image"):
                    relative = Path(choice["image"])
                    assert not relative.is_absolute() and ".." not in relative.parts
                    path = ROOT / "public" / relative
                    assert path.is_file(), f"Missing illustration {choice['image']}"
                    assert path.suffix.lower() == ".svg"
                if choice["id"] == "paku":
                    assert choice["label"].casefold() == "paku"
                    assert choice.get("image") == "icons/paku.svg", (
                        "Paku must show a smooth-shaft nail illustration, not a bolt emoji"
                    )
assert total == 38
print("Content QA PASSED: five worlds, 38 active questions, valid choices, colors and local illustrations")
