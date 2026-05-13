from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
PNG_PATH = DOCS / "Autoostas_vizualais_wireframe.png"
PDF_PATH = DOCS / "Autoostas_vizualais_wireframe.pdf"

WIDTH = 5200
HEIGHT = 3400

INK = "#111827"
MUTED = "#6B7280"
LINE = "#1F2937"
SOFT_LINE = "#9CA3AF"
PANEL = "#D8EAF7"
PANEL_LIGHT = "#EAF4FB"
HEADER_BLUE = "#8DBFE5"
ACCENT = "#1D4ED8"
GREEN = "#22C55E"
ORANGE = "#F59E0B"
RED = "#EF4444"
PURPLE = "#7C3AED"
NOTE = "#EDF7D8"


def font(size, bold=False):
    font_dir = Path("C:/Windows/Fonts")
    candidates = [
        font_dir / ("arialbd.ttf" if bold else "arial.ttf"),
        font_dir / ("segoeuib.ttf" if bold else "segoeui.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


F = {
    "huge": font(58),
    "h1": font(34, True),
    "h2": font(24, True),
    "h3": font(20, True),
    "body": font(18),
    "small": font(15),
    "tiny": font(13),
    "button": font(16, True),
}


img = Image.new("RGB", (WIDTH, HEIGHT), "white")
draw = ImageDraw.Draw(img)


def text_size(text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(text, fnt, max_width):
    words = str(text).split()
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if text_size(candidate, fnt)[0] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_text(x, y, text, fnt=None, fill=INK, max_width=None, line_gap=5, align="left"):
    fnt = fnt or F["body"]
    lines = wrap_text(text, fnt, max_width) if max_width else str(text).split("\n")
    cursor = y
    for line in lines:
        w, h = text_size(line, fnt)
        tx = x
        if align == "center":
            tx = x - w / 2
        elif align == "right":
            tx = x - w
        draw.text((tx, cursor), line, font=fnt, fill=fill)
        cursor += h + line_gap
    return cursor


def rounded_box(x, y, w, h, fill="white", outline=LINE, radius=10, width=2):
    draw.rounded_rectangle((x, y, x + w, y + h), radius=radius, fill=fill, outline=outline, width=width)


def field(x, y, w, h=36, label=None, value=""):
    if label:
        draw_text(x, y - 24, label, F["small"], INK)
    rounded_box(x, y, w, h, fill="#F8FBFD", outline=LINE, radius=4, width=2)
    if value:
        draw_text(x + 12, y + 8, value, F["small"], MUTED, max_width=w - 20)


def button(x, y, w, h, label, fill="#EFF6FF", outline=LINE):
    rounded_box(x, y, w, h, fill=fill, outline=outline, radius=9, width=2)
    draw_text(x + w / 2, y + h / 2 - 9, label, F["button"], INK, align="center")


def checkbox(x, y, label, checked=False):
    draw.rectangle((x, y, x + 22, y + 22), fill="#F8FBFD", outline=LINE, width=2)
    if checked:
        draw.line((x + 4, y + 12, x + 9, y + 18, x + 19, y + 5), fill=INK, width=3)
    draw_text(x + 32, y + 1, label, F["small"], INK)


def arrow(start, end, color=LINE, width=3, bend=0):
    x1, y1 = start
    x2, y2 = end
    if bend:
        midx = (x1 + x2) / 2 + bend
        points = [(x1, y1), (midx, y1), (midx, y2), (x2, y2)]
        draw.line(points, fill=color, width=width, joint="curve")
        angle = math.atan2(y2 - y2, x2 - midx)
    else:
        draw.line((x1, y1, x2, y2), fill=color, width=width)
        angle = math.atan2(y2 - y1, x2 - x1)
    head = 18
    angle = math.atan2(y2 - y1, x2 - x1) if not bend else math.atan2(0, x2 - ((x1 + x2) / 2 + bend))
    p1 = (x2 - head * math.cos(angle - math.pi / 7), y2 - head * math.sin(angle - math.pi / 7))
    p2 = (x2 - head * math.cos(angle + math.pi / 7), y2 - head * math.sin(angle + math.pi / 7))
    draw.polygon([end, p1, p2], fill=color)


def callout(x, y, w, h, text, color=NOTE):
    rounded_box(x, y, w, h, fill=color, outline="#A3B66F", radius=3, width=1)
    draw_text(x + 14, y + 12, text, F["small"], "#4B5563", max_width=w - 28)


def screen(x, y, w, h, title, subtitle=None):
    draw_text(x, y - 36, title, F["h2"], INK)
    rounded_box(x, y, w, h, fill=PANEL, outline=LINE, radius=2, width=2)
    draw.rectangle((x, y, x + w, y + 74), fill="#C7DFF1", outline=LINE, width=0)
    rounded_box(x + 24, y + 22, 120, 42, fill="#DDEBF5", outline=LINE, radius=5, width=2)
    draw_text(x + 42, y + 29, "Autoosta\nlogo", F["tiny"], INK, line_gap=0)
    draw_text(x + w / 2, y + 28, "Autoostas IS", F["h3"], HEADER_BLUE, align="center")
    draw_text(x + w - 32, y + 28, "14:45", F["small"], INK, align="right")
    draw.line((x + 34, y + 88, x + w - 34, y + 88), fill=LINE, width=2)
    if subtitle:
        draw_text(x + 34, y + 108, subtitle, F["small"], INK, max_width=w - 68)
    draw.line((x + 34, y + h - 58, x + w - 34, y + h - 58), fill=LINE, width=2)
    draw_text(x + 34, y + h - 42, "© 2026 Autoostas projekts", F["small"], INK)
    return x + 34, y + 118


def table(x, y, w, h, headers, rows):
    cols = len(headers)
    row_h = h / (len(rows) + 1)
    draw.rectangle((x, y, x + w, y + h), fill="#EAF4FB", outline=LINE, width=2)
    draw.rectangle((x, y, x + w, y + row_h), fill="#BFD8E9", outline=LINE, width=2)
    col_w = w / cols
    for i, header in enumerate(headers):
        draw_text(x + i * col_w + 8, y + 8, header, F["tiny"], INK, max_width=col_w - 16)
        draw.line((x + i * col_w, y, x + i * col_w, y + h), fill=LINE, width=1)
    for r, row in enumerate(rows):
        yy = y + row_h * (r + 1)
        draw.line((x, yy, x + w, yy), fill=LINE, width=1)
        for c, value in enumerate(row):
            draw_text(x + c * col_w + 8, yy + 8, value, F["tiny"], INK, max_width=col_w - 16)
    draw.line((x + w, y, x + w, y + h), fill=LINE, width=1)


def draw_route_card(x, y, w, title, time, price):
    rounded_box(x, y, w, 112, fill=PANEL_LIGHT, outline=LINE, radius=8, width=2)
    draw_text(x + 14, y + 12, title, F["h3"], INK)
    draw_text(x + 14, y + 42, time, F["small"], MUTED)
    draw_text(x + 14, y + 70, price, F["small"], INK)
    button(x + w - 140, y + 66, 118, 34, "Izvēlēties")


# Column headings.
headings = [
    (100, 70, "Viesa skati", "Sākumlapa un publiski pieejama maršrutu meklēšana."),
    (1040, 70, "Autentifikācija", "Pieteikšanās, konta izveide un redzamas kļūdas."),
    (1930, 70, "Pasažiera iespējas", "Bilance, reisa izvēle, apmaksa, QR kods un čeks."),
    (2960, 70, "Šofera iespējas", "Pieteikums, maršrutu saraksts un jauna maršruta veidošana."),
    (4000, 70, "Autoostas vadītājs", "Piekļuve visiem datiem, naudai, biļetēm un pārskatiem."),
]
for x, y, title, sub in headings:
    draw_text(x, y, title, F["huge"], "#8A8A8A")
    draw_text(x + 8, y + 72, sub, F["h2"], "#9A9A9A", max_width=820)
for sep in [970, 1840, 2870, 3900]:
    draw.line((sep, 40, sep, 235), fill="#8E8E8E", width=10)


# Guest start page.
sx, sy, sw, sh = 100, 330, 800, 520
cx, cy = screen(sx, sy, sw, sh, "Sākumlapa", "Viesis meklē autobusa maršrutu vai atver konta darbības.")
button(sx + 500, sy + 24, 120, 36, "Pieteikties")
button(sx + 635, sy + 24, 130, 36, "Izveidot")
field(cx, cy + 54, 280, label="No kurienes")
field(cx + 310, cy + 54, 280, label="Uz kurieni")
button(cx + 610, cy + 54, 120, 38, "Meklēt", fill="#DBEAFE")
draw_text(cx, cy + 122, "Maršrutu rezultāti", F["h3"], INK)
draw_route_card(cx, cy + 154, 340, "Rīga - Liepāja", "08:10-11:35 • 3 pieturas", "12.50 EUR")
draw_route_card(cx + 380, cy + 154, 340, "Rīga - Daugavpils", "09:00-13:10 • 4 pieturas", "14.00 EUR")
callout(120, 900, 300, 92, "Ja nav rezultātu, sistēma rāda: “Nav atrasts neviens piemērots maršruts.”")


# Auth screens.
lx, ly, lw, lh = 1060, 330, 700, 360
cx, cy = screen(lx, ly, lw, lh, "Pieteikšanās logs", "Lietotājs ievada konta nosaukumu un paroli.")
field(cx + 190, cy + 28, 320, label="Konta nosaukums")
field(cx + 190, cy + 98, 320, label="Parole")
checkbox(cx + 190, cy + 154, "Parādīt paroli")
draw_text(cx + 190, cy + 188, "Nepareizs konta nosaukums vai parole.", F["small"], RED, max_width=340)
button(cx + 385, cy + 226, 130, 38, "Pieteikties", fill="#DBEAFE")

rx, ry, rw, rh = 1060, 820, 700, 500
cx, cy = screen(rx, ry, rw, rh, "Konta izveides logs", "Jauns lietotājs ievada personas un konta datus.")
field(cx, cy + 18, 240, label="Vārds")
field(cx + 270, cy + 18, 240, label="Uzvārds")
field(cx, cy + 88, 160, label="Vecums")
field(cx + 190, cy + 88, 320, label="Konta nosaukums")
field(cx, cy + 158, 510, label="Parole")
field(cx, cy + 228, 510, label="Atkārtot paroli")
draw_text(cx, cy + 288, "Parole: vismaz 8 simboli, lielais burts, cipars un speciālais simbols.", F["small"], RED, max_width=510)
button(cx + 370, cy + 342, 140, 38, "Izveidot", fill="#DBEAFE")


# Passenger views.
px, py, pw, ph = 1930, 330, 850, 610
cx, cy = screen(px, py, pw, ph, "Pasažiera skats pēc pieteikšanās", "Augšā redzams vārds, uzvārds, loma un bilance.")
button(px + 270, py + 24, 170, 36, "Jānis Bērziņš")
button(px + 452, py + 24, 170, 36, "Bilance: 25.00")
button(px + 635, py + 24, 130, 36, "Iziet")
field(cx, cy + 28, 230, label="No")
field(cx + 260, cy + 28, 230, label="Uz")
button(cx + 520, cy + 28, 130, 38, "Meklēt")
draw_route_card(cx, cy + 98, 370, "Rīga - Liepāja", "08:10, 12:10, 16:10", "12.50 EUR")
rounded_box(cx + 420, cy + 98, 340, 220, fill=PANEL_LIGHT, outline=LINE, radius=8, width=2)
draw_text(cx + 438, cy + 112, "Izvēlētais reiss", F["h3"], INK)
draw_text(cx + 438, cy + 146, "Rīga → Liepāja", F["small"], INK)
button(cx + 438, cy + 186, 90, 32, "08:10")
button(cx + 536, cy + 186, 90, 32, "12:10")
draw_text(cx + 438, cy + 232, "Cena: 12.50 EUR", F["small"], INK)
button(cx + 560, cy + 265, 140, 40, "Apmaksāt", fill="#DBEAFE")

bx, by, bw, bh = 1930, 1040, 820, 420
cx, cy = screen(bx, by, bw, bh, "Bilances logs", "Papildināšana no 0.01 līdz 200 EUR un iepriekšējās izmaksas.")
draw_text(cx, cy + 18, "Bilance: 25.00 EUR", F["h2"], INK)
field(cx, cy + 88, 250, label="Papildināmā summa")
button(cx + 280, cy + 88, 200, 38, "Papildināt bilanci")
draw_text(cx, cy + 154, "Iepriekšējās izmaksas", F["h3"], INK)
draw_text(cx, cy + 190, "• Rīga - Liepāja, 12.50 EUR, 08:10\n• Jelgava - Rīga, 4.20 EUR, pirkuma laiks", F["small"], INK)
callout(bx + 520, by + 140, 240, 82, "Ja summa ir 0, -5 vai 250, parādās brīdinājums.")

tx, ty, tw, th = 1930, 1560, 820, 460
cx, cy = screen(tx, ty, tw, th, "Biļetes rezultāts", "Pēc apmaksas tiek parādīts QR kods un lejupielādējams čeks.")
rounded_box(cx, cy + 32, 210, 210, fill="white", outline=LINE, radius=3, width=2)
for i in range(0, 7):
    for j in range(0, 7):
        if i in (0, 6) or j in (0, 6) or (2 <= i <= 4 and 2 <= j <= 4):
            draw.rectangle((cx + 22 + i * 14, cy + 52 + j * 14, cx + 33 + i * 14, cy + 63 + j * 14), fill=INK)
for i in range(42):
    if (i * 7 + 3) % 5 < 2:
        draw.rectangle((cx + 38 + (i % 12) * 12, cy + 164 + (i // 12) * 12, cx + 46 + (i % 12) * 12, cy + 172 + (i // 12) * 12), fill=INK)
draw_text(cx + 250, cy + 42, "Čekā saglabājas:", F["h3"], INK)
draw_text(cx + 250, cy + 82, "• vārds un uzvārds\n• reiss un cena\n• pirkuma laiks\n• apmaksāts: jā", F["small"], INK)
button(cx + 250, cy + 210, 230, 42, "Lejupielādēt čeku")

prx, pry, prw, prh = 1930, 2130, 820, 420
cx, cy = screen(prx, pry, prw, prh, "Profila logs", "No profila lietotājs var pieteikties par šoferi.")
draw_text(cx, cy + 26, "Jānis Bērziņš", F["h2"], INK)
draw_text(cx, cy + 66, "Statuss: Pasažieris", F["small"], INK)
button(cx, cy + 120, 240, 44, "Pieteikties par šoferi", fill="#DBEAFE")
button(cx + 270, cy + 120, 270, 44, "Kļūt par Autoostas vadītāju")
callout(prx + 520, pry + 126, 240, 96, "Autoostas vadītāja poga ir redzama tikai šoferim.")


# Driver views.
dx, dy, dw, dh = 2960, 330, 850, 500
cx, cy = screen(dx, dy, dw, dh, "Šofera pieteikums", "Pirms šofera statusa sistēma pārbauda pieredzi.")
field(cx, cy + 32, 360, label="Apliecības numurs")
field(cx + 390, cy + 32, 180, label="Pieredzes gadi")
field(cx, cy + 112, 650, 92, label="Motivācija")
draw_text(cx, cy + 230, "Kļūda: “Tas nav iespējams, jo tiesības var būt tikai no 18 gadu vecuma.”", F["small"], RED, max_width=660)
button(cx + 480, cy + 300, 160, 42, "Iesniegt", fill="#DBEAFE")

dpx, dpy, dpw, dph = 2960, 950, 850, 430
cx, cy = screen(dpx, dpy, dpw, dph, "Šofera panelis", "Šoferis redz savus maršrutus un var izveidot jaunu.")
button(dpx + 540, dpy + 24, 180, 36, "Jauns maršruts")
draw_route_card(cx, cy + 42, 360, "Mans reiss", "Rīga - Liepāja • 3 laiki", "12.50 EUR")
button(cx + 430, cy + 92, 120, 36, "Labot")

rex, rey, rew, reh = 2960, 1510, 850, 700
cx, cy = screen(rex, rey, rew, reh, "Maršruta izveides lapa", "Atsevišķa lapa ar pieturām un vairākiem reisa laikiem.")
field(cx, cy + 22, 360, label="Reisa nosaukums")
field(cx + 390, cy + 22, 150, label="Cena")
field(cx, cy + 92, 250, label="Sākums")
field(cx + 280, cy + 92, 250, label="Galapunkts")
draw_text(cx, cy + 160, "Pieturvietas", F["h3"], INK)
for i, stop in enumerate(["Saldus", "Brocēni", "Grobiņa"]):
    yy = cy + 198 + i * 58
    field(cx, yy, 350, value=stop)
    button(cx + 370, yy, 42, 36, "-")
    if i < 2:
        button(cx + 430, yy + 28, 42, 36, "+")
draw_text(cx, cy + 390, "Reisa laiki", F["h3"], INK)
button(cx, cy + 430, 120, 34, "Manuāli", fill="#DBEAFE")
button(cx + 132, cy + 430, 150, 34, "Atkārtojas")
field(cx, cy + 492, 120, label="08:00")
field(cx + 140, cy + 492, 120, label="11:00")
draw_text(cx + 300, cy + 492, "vai: no 08:00 līdz 18:00 ik pēc 1h/2h", F["small"], INK, max_width=380)
button(cx + 500, cy + 560, 230, 42, "Saglabāt maršrutu", fill="#DBEAFE")


# Manager views.
mx, my, mw, mh = 4000, 330, 1040, 330
cx, cy = screen(mx, my, mw, mh, "Kļūt par Autoostas vadītāju", "Pieejams tikai lietotājam, kurš jau ir autobusa vadītājs.")
draw_text(cx, cy + 24, "Statuss: Autobusa vadītājs", F["h3"], INK)
button(cx, cy + 82, 280, 44, "Kļūt par Autoostas vadītāju", fill="#DBEAFE")
draw_text(cx + 330, cy + 86, "Pēc apstiprinājuma parādās poga “Pārvaldīt autoostu”.", F["small"], INK, max_width=560)

mpx, mpy, mpw, mph = 4000, 810, 1040, 780
cx, cy = screen(mpx, mpy, mpw, mph, "Autoostas pārvaldības lapa", "Vadītājs redz visus kontus, maršrutus, iemaksas un biļetes.")
button(mpx + 790, mpy + 24, 160, 36, "Atpakaļ")
draw_text(cx, cy + 22, "Ātrā analīze", F["h3"], INK)
labels = ["Visvairāk iztērēts", "Visizdevīgākais", "Populārākais", "Lielākā iemaksa", "Kopējie ienākumi"]
for i, label in enumerate(labels):
    button(cx + (i % 3) * 210, cy + 58 + (i // 3) * 52, 190, 38, label)
table(cx, cy + 180, 910, 210, ["Konts", "Loma", "Bilance", "Biļetes"], [["janis", "šoferis", "25.00", "2"], ["anna", "pasažieris", "8.00", "1"], ["sistema", "vadītājs", "0.00", "0"]])
table(cx, cy + 430, 910, 170, ["Maršruts", "Šoferis", "Cena", "Laiki"], [["Rīga-Liepāja", "janis", "12.50", "08:10,12:10"], ["Rīga-Daugavpils", "sistema", "14.00", "09:00"]])

rtx, rty, rtw, rth = 4000, 1710, 1040, 700
cx, cy = screen(rtx, rty, rtw, rth, "Pārskatu un datu tabulu skati", "Pārskata pogas aprēķina rezultātus no SQL datiem.")
table(cx, cy + 38, 430, 170, ["Iemaksa", "Lietotājs", "Summa"], [["1", "Jānis", "50.00"], ["2", "Anna", "20.00"]])
table(cx + 480, cy + 38, 430, 170, ["Biļete", "Reiss", "Apmaksāts"], [["AIS-01", "Rīga-Liepāja", "Jā"], ["AIS-02", "Jelgava-Rīga", "Jā"]])
rounded_box(cx, cy + 270, 900, 160, fill=PANEL_LIGHT, outline=LINE, radius=8, width=2)
draw_text(cx + 24, cy + 292, "Rezultāts", F["h3"], INK)
draw_text(cx + 24, cy + 332, "Visvairāk iztērēts: Jānis Bērziņš kopā iztērēja 25.00 EUR.", F["small"], INK, max_width=820)


# Flow arrows.
arrow((sx + 622, sy + 42), (lx, ly + 105), color=LINE)
arrow((sx + 702, sy + 42), (rx, ry + 110), color=ORANGE)
arrow((lx + lw, ly + 210), (px, py + 125), color=ORANGE)
arrow((rx + rw, ry + 260), (px, py + 175), color=ORANGE)
arrow((px + 530, py + 42), (bx, by + 145), color=ACCENT)
arrow((px + 735, py + 430), (tx, ty + 120), color=GREEN)
arrow((px + 345, py + 42), (prx, pry + 105), color=PURPLE)
arrow((prx + prw, pry + 170), (dx, dy + 165), color=PURPLE)
arrow((dx + dw / 2, dy + dh), (dpx + dpw / 2, dpy), color=PURPLE)
arrow((dpx + 630, dpy + 42), (rex + 120, rey), color=PURPLE)
arrow((prx + prw, pry + 180), (mx, my + 120), color=GREEN)
arrow((mx + 260, my + 155), (mpx, mpy + 90), color=GREEN)
arrow((mpx + 410, mpy + 195), (rtx, rty + 105), color=GREEN)


# Bottom legend.
legend_x, legend_y = 110, 3000
draw_text(legend_x, legend_y, "Leģenda", F["h2"], INK)
for i, (color, label) in enumerate([
    (LINE, "Navigācija no viesa skata"),
    (ORANGE, "Pieteikšanās / konta izveide"),
    (ACCENT, "Bilances papildināšana"),
    (GREEN, "Apmaksa un pārvaldība"),
    (PURPLE, "Pāreja uz šofera funkcijām"),
]):
    y = legend_y + 50 + i * 42
    draw.line((legend_x, y + 10, legend_x + 80, y + 10), fill=color, width=5)
    draw.polygon([(legend_x + 80, y + 10), (legend_x + 62, y), (legend_x + 62, y + 20)], fill=color)
    draw_text(legend_x + 105, y - 2, label, F["small"], INK)
callout(720, 3030, 610, 170, "Šis ir wireframe, ne gala dizains. Tas rāda ekrānu struktūru, lietotāju lomas un pārejas starp galvenajām darbībām.")


def save_outputs():
    DOCS.mkdir(parents=True, exist_ok=True)
    img.save(PNG_PATH, "PNG")
    # RGB image can be saved directly as a one-page PDF.
    img.save(PDF_PATH, "PDF", resolution=150.0)
    print(PNG_PATH)
    print(PDF_PATH)


if __name__ == "__main__":
    save_outputs()
