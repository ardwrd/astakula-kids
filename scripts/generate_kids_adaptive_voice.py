#!/usr/bin/env python3
"""Generate review-only Eleven v4 candidates, ten clips per run."""
import argparse, hashlib, json, os, re
from pathlib import Path
from generate_v4_candidates import convert
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"public/audio/previews/indo-v4-adaptive-v2"
CATALOG=OUT/"catalog.json"
MANIFEST=OUT/"manifest.json"
SAMPLES=ROOT/"public/audio/previews/indo-v4-kids-prosody-02"
SEEDS={"global/correct":"pujian","questions/warna-3-2":"pertanyaan-warna","activities/instructions/dice-match":"instruksi-dadu"}

def hash_bytes(raw):
    return hashlib.sha256(raw).hexdigest()

def scripts():
    catalog=json.loads(CATALOG.read_text(encoding="utf-8"))
    if (catalog.get("version")!="indo-v4-adaptive-v2" or
        catalog.get("voice_id")!="wtqqNhC5H27DEv1Ojo4B" or
        catalog.get("model_id")!="eleven_v4" or
        catalog.get("language_code")!="id" or
        catalog.get("approval_status")!="REVIEW_ONLY" or
        len(catalog.get("clips",[]))!=104):
        raise ValueError("Invalid revision catalog")
    expected_core=set(json.loads((ROOT/"src/data/audioManifest.json").read_text())["keys"])-set(catalog["archived_excluded"])
    expected_activity={"activities/"+k for k in json.loads((ROOT/"src/data/activityNarrationV4.json").read_text())["clips"]}
    rows=catalog["clips"]
    if {r["key"] for r in rows}!=expected_core|expected_activity or len({r["key"] for r in rows})!=104:
        raise ValueError("Incomplete active narration coverage")
    approved=json.loads((SAMPLES/"samples.json").read_text())
    sample_text={s["id"]:s["text"] for s in approved["samples"]}
    for r in rows:
        k=r["key"]
        if not re.fullmatch("[a-z0-9/-]+",k) or ".." in k or k.startswith("/"):
            raise ValueError("Unsafe key")
        if not isinstance(r["text"],str) or len(r["text"].strip())<4 or "<" in r["text"]:
            raise ValueError("Bad script")
        if r["role"]=="praise" and ("[slowly]" in r["text"] or "[pause]" in r["text"]):
            raise ValueError("Praises may not be slowed")
        if r["role"]=="question" and "?" not in r["text"]:
            raise ValueError("Question needs question mark")
        if k in SEEDS and (r.get("seed")!=SEEDS[k] or r["text"]!=sample_text[SEEDS[k]]):
            raise ValueError("Seed text does not match approved sample")
    return catalog

def save(catalog,entries):
    MANIFEST.write_text(json.dumps({"version":catalog["version"],"model_id":"eleven_v4",
      "voice_id":catalog["voice_id"],"required_count":104,"generated_count":len(entries),
      "approved":False,"entries":entries},indent=2)+"\n")

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate",action="store_true")
    parser.add_argument("--limit",type=int,default=10)
    args=parser.parse_args()
    if not 1<=args.limit<=10: parser.error("batch limit must be 1 to 10")
    catalog=scripts()
    rows={r["key"]:r for r in catalog["clips"]}
    previous=json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {"entries":{}}
    if previous.get("version",catalog["version"])!=catalog["version"] or previous.get("approved",False):
        raise ValueError("Invalid candidate manifest")
    entries=previous["entries"]
    if not set(entries).issubset(rows):
        raise ValueError("Unexpected clip")
    for k,v in entries.items():
        f=OUT/(k+".mp3")
        if not f.is_file(): raise ValueError("Missing staged clip "+k)
        raw=f.read_bytes()
        if len(raw)!=v["bytes"] or hash_bytes(raw)!=v["sha256"] or hash_bytes(rows[k]["text"].encode())!=v["text_sha256"]:
            raise ValueError("Changed script or damaged audio "+k)
    print("VALID:",len(rows),"scripts;",len(entries),"already staged",flush=True)
    if args.validate or len(entries)==104: return
    api_key=os.environ.get("ELEVENLABS_API_KEY")
    if not api_key: raise SystemExit("Missing GitHub ElevenLabs secret")
    new=0
    try:
        for r in catalog["clips"]:
            k=r["key"]
            if k in entries: continue
            if new>=args.limit: break
            dest=OUT/(k+".mp3")
            dest.parent.mkdir(parents=True,exist_ok=True)
            if r.get("seed"):
                source=SAMPLES/(r["seed"]+".mp3")
                raw=source.read_bytes()
                prev=json.loads((SAMPLES/"manifest.json").read_text())["entries"][r["seed"]]
                if hash_bytes(raw)!=prev["sha256"]: raise ValueError("Changed approved sample")
                dest.write_bytes(raw)
                print("Reused approved sample:",k,flush=True)
            else:
                dest.write_bytes(convert(r["text"],api_key))
                print("Generated:",k,flush=True)
            raw=dest.read_bytes()
            if len(raw)<512: raise ValueError("Empty MP3")
            entries[k]={"sha256":hash_bytes(raw),"bytes":len(raw),"text_sha256":hash_bytes(r["text"].encode()),"role":r["role"]}
            new+=1
            save(catalog,entries)
    finally:
        save(catalog,entries)
        print("Staged",len(entries),"/104; new this batch",new,flush=True)

if __name__=="__main__":
    main()
