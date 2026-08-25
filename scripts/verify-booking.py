#!/usr/bin/env python3
"""Verifies booking across the 10 salon sites: plain links only.

Every booking section must be a list of links — the salon's own booking system
(if connected), every social channel from site.json, and the phone line.
No embedded widgets/iframes, no fake forms, no reserved placeholder slots.
"""
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

# Third-party booking hosts that must never appear as embedded iframes again.
WIDGET_HOSTS = ("yclients", "dikidi", "sonline", "clients.site")


def load(site):
    try:
        return json.load(open(f"sites/{site}/src/data/site.json"))
    except (OSError, json.JSONDecodeError):
        return {}


failures = 0

print("=== ЗАПИСЬ ССЫЛКАМИ (без виджетов) ===")
for s in ALL_SITES:
    data = load(s)
    try:
        raw_html = open(f"sites/{s}/dist/index.html").read()
    except OSError:
        print(f"  [FAIL] {s}: нет dist/index.html — сайт не собран")
        failures += 1
        continue
    # Compare against de-escaped HTML so URLs containing &amp; still match.
    html = raw_html.replace("&amp;", "&")

    problems = []

    # 1. No widget embeds of any kind.
    if "data-booking-widget" in html:
        problems.append("остался embed виджета")
    m = re.search(r'<iframe src="([^"]+)"', html)
    if m and any(host in m.group(1) for host in WIDGET_HOSTS):
        problems.append(f"остался iframe букинга: {m.group(1)}")

    # 2. No reserved placeholder slot.
    if "Место под виджет записи" in html:
        problems.append("осталась заглушка «Место под виджет записи»")

    # 3. No leftover fake forms inside the booking section.
    if 'id="booking"' in html:
        section = html.split('id="booking"')[1].split("</section>")[0]
        if "<form" in section:
            problems.append("в секции записи осталась форма")

    # 4. Booking link present when the salon has one.
    booking_url = data.get("bookingUrl")
    has_booking_link = True
    if booking_url:
        has_booking_link = f'href="{booking_url}"' in html and "Онлайн-запись" in html
        if not has_booking_link:
            problems.append(f"нет ссылки записи {booking_url}")

    # 5. Every social channel rendered as a link.
    socials = data.get("socialLinks") or {}
    missing_socials = [k for k, u in socials.items() if u and f'href="{u}"' not in html]
    if missing_socials:
        problems.append("нет ссылок: " + ", ".join(missing_socials))

    # 6. Phone line as a link.
    phone = data.get("phone")
    tel_digits = re.sub(r"[^+\d]", "", phone) if phone else ""
    tel_ok = not phone or f'href="tel:{tel_digits}"' in html
    if not tel_ok:
        problems.append("нет ссылки на телефон")

    status = "OK " if not problems else "FAIL"
    if problems:
        failures += 1
    channels = ", ".join(sorted(socials)) or "нет соцсетей"
    extra = "" if not problems else " | " + "; ".join(problems)
    print(f"  [{status}] {s}: booking={'да' if booking_url else '—'} ({channels}){extra}")

print(f"\nИтог: {'ВСЕ 10 САЙТОВ ОК — запись только ссылками' if failures == 0 else str(failures) + ' ПРОБЛЕМ'}")

