#!/usr/bin/env python3
"""Verifies booking integration across the 10 upgraded salon sites."""
import glob
import json
import re

ALL_SITES = [
    "ak-lash-studio",
    "salon-krasoty-alisa",
    "angels-kasta",
    "klub-krasoty-d-art",
    "art-look",
    "nogtevaya-studiya-astriya",
    "studiya-beautyzone",
    "beauty",
    "krasota-i-stil",
    "beauty-bar-mari",
]


def booking_url(site):
    """A site with bookingUrl renders a live widget instead of the reserved slot."""
    try:
        data = json.load(open(f"sites/{site}/src/data/site.json"))
        return data.get("bookingUrl")
    except (OSError, json.JSONDecodeError):
        return None


failures = 0

# Membership is derived from site.json, not hardcoded — when a salon connects
# real booking (e.g. YClients found on Yandex Maps), it moves sections automatically.
widget_sites = [s for s in ALL_SITES if booking_url(s)]
slot_sites = [s for s in ALL_SITES if not booking_url(s)]

print("=== ВИДЖЕТЫ (подключён букинг) ===")
for s in widget_sites:
    html = open(f"sites/{s}/dist/index.html").read()
    css = "".join(open(f).read() for f in glob.glob(f"sites/{s}/dist/_astro/*.css"))
    m = re.search(r'<iframe src="([^"]+)"', html)
    iframe_ok = bool(m)
    premium = all(x in html for x in ("bw-dots", "Не открывается")) and ".bw-skeleton" in css
    status = "OK " if iframe_ok and premium else "FAIL"
    if not (iframe_ok and premium):
        failures += 1
    print(f"  [{status}] {s}: {m.group(1) if m else 'нет iframe'} | premium={premium}")

print("=== СЛОТЫ (место под виджет зарезервировано) ===")
for s in slot_sites:
    html = open(f"sites/{s}/dist/index.html").read()
    slot_ok = "Место под виджет записи" in html
    no_form = "<form" not in html.split('id="booking"')[1].split("</section>")[0] if 'id="booking"' in html else True
    status = "OK " if slot_ok else "FAIL"
    if not slot_ok:
        failures += 1
    print(f"  [{status}] {s}: slot={slot_ok}")

print(f"\nИтог: {'ВСЕ 10 САЙТОВ ОК' if failures == 0 else str(failures) + ' ПРОБЛЕМ'}")
