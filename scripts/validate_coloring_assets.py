#!/usr/bin/env python3
"""Validate toddler-friendly vector outlines used in finger coloring."""
import re
from pathlib import Path
from xml.etree import ElementTree as ET

root = Path(__file__).resolve().parents[1]
expected = ["balloon", "sun", "fish", "flower", "house", "car"]
src = (root / "src/ColoringActivity.tsx").read_text(encoding="utf-8")
block = src.split("const pictures: Picture[] = [", 1)[1].split("]", 1)[0]
actual = re.findall(r"\{ id: '([^']+)', name: '([^']+)' \}", block)
assert [id for id, _ in actual] == expected, "Activity picture order must stay in sync"
for slug in expected:
    path = root / "public/coloring" / f"{slug}.svg"
    svg = path.read_text(encoding="utf-8")
    assert "<script" not in svg and "<image" not in svg and "href=" not in svg and "url(" not in svg, slug
    drawing = ET.fromstring(svg)
    assert drawing.attrib["viewBox"] == "0 0 320 270", f"{slug}: invalid viewport"
    namespace = "{http://www.w3.org/2000/svg}"
    allowed = {"svg", "title", "g", "path", "circle", "ellipse", "rect"}
    assert all(node.tag.removeprefix(namespace) in allowed for node in drawing.iter()), slug
    shapes = [n for n in drawing.iter() if n.tag.removeprefix(namespace) in {"path", "circle", "ellipse", "rect"}]
    assert 1 <= len(shapes) <= 12, f"{slug}: too many details"
    stroke_group = drawing.find(namespace + "g")
    assert stroke_group is not None
    assert stroke_group.attrib["stroke"] == "#24282f" and stroke_group.attrib["stroke-width"] == "6", slug
    assert stroke_group.attrib["fill"] == "none", f"{slug}: canvas must remain visible behind art"
    assert all(not any(k.lower().startswith("on") for k in n.attrib) for n in drawing.iter()), slug
print("Coloring QA PASSED: 6 aligned, simplified, safe outlines")
