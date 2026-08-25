import json
import subprocess

SITES = {
    "ak-lash-studio": "/ak-lash-studio-salon",
    "salon-krasoty-alisa": "/alisa-salon",
    "angels-kasta": "/angels-kasta-salon",
    "klub-krasoty-d-art": "/dart-salon",
    "art-look": "/art-look-salon",
    "nogtevaya-studiya-astriya": "/astriya-salon",
    "studiya-beautyzone": "/beautyzone-salon",
    "beauty": "/beauty-salon",
    "krasota-i-stil": "/krasota-i-stil-salon",
    "beauty-bar-mari": "/beauty-bar-mari-salon",
}
BASE = "https://kpopsdeath14.github.io/small-business-sites"


def fetch(url):
    return subprocess.run(["curl", "-s", url], capture_output=True, text=True).stdout.replace("&amp;", "&")


fail = 0
for s, base in SITES.items():
    data = json.load(open(f"sites/{s}/src/data/site.json"))
    html = fetch(f"{BASE}{base}/")
    problems = []
    if not html:
        problems.append("страница не скачалась")
    else:
        if "data-booking-widget" in html:
            problems.append("виджет на странице")
        if "Место под виджет записи" in html:
            problems.append("заглушка")
        bu = data.get("bookingUrl")
        if bu and f'href="{bu}"' not in html:
            problems.append(f"нет ссылки {bu}")
        for k, u in (data.get("socialLinks") or {}).items():
            if u and f'href="{u}"' not in html:
                problems.append(f"нет {k}")
    status = "OK" if not problems else "FAIL " + "; ".join(problems)
    fail += bool(problems)
    print(f"  [{status}] {s} (booking={'да' if data.get('bookingUrl') else '—'})")

print()
print("ИТОГ:", "ВСЕ 10 ЖИВЫХ САЙТОВ ОК — запись ссылками, без виджетов" if fail == 0 else f"{fail} ПРОБЛЕМ")

