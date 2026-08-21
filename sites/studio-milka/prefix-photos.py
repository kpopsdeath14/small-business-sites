"""One-off deploy prep: prefix root-relative /photos/ paths in site.json with the
GitHub Pages base (/small-business-sites). Astro's `base` config only rewrites its
own asset URLs — photo paths live in data JSON as plain strings, so they need this."""
import json

BASE = "/small-business-sites"
PATH = "src/data/site.json"

def fix(value):
    if isinstance(value, str) and value.startswith("/photos/"):
        return BASE + value
    return value

def walk(obj):
    if isinstance(obj, dict):
        return {k: walk(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [walk(i) for i in obj]
    return fix(obj)

data = walk(json.load(open(PATH)))
with open(PATH, "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")
print("photos prefixed with", BASE)