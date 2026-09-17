from pathlib import Path
import zipfile
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root / 'output/pdf/Polis-demo'
render = root / 'artifacts/mock-preview'
out.mkdir(parents=True, exist_ok=True)
render.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold', 'C:/Windows/Fonts/arialbd.ttf'))
style = ParagraphStyle('body', fontName='Arial', fontSize=11, leading=17, textColor=HexColor('#243a42'))
offers = [
    ('01-Орбита.pdf', 'Орбита Страхование', '#196a60', '420 000', 'Помещение магазина, торговое оборудование и товарные запасы.', '100 000 тенге по каждому страховому случаю.', 'Затопление вследствие аварии водопроводных и канализационных сетей включено в пределах общей страховой суммы. Отдельный подлимит не установлен.', 'Естественный износ и постепенное воздействие влаги; умышленные действия страхователя.'),
    ('02-Вектор.pdf', 'Вектор Полис', '#315787', '365 000', 'Помещение магазина и торговое оборудование. Товарные запасы не являются застрахованным имуществом.', 'Безусловная франшиза: 1% от общей страховой суммы по каждому страховому случаю.', None, 'Естественный износ; умышленные действия страхователя. Убытки в отношении товарных запасов не возмещаются.'),
    ('03-Сфера.pdf', 'Сфера Защита', '#855838', '485 000', 'Помещение магазина, торговое оборудование и товарные запасы.', '50 000 тенге по каждому страховому случаю.', 'Затопление вследствие аварии водопроводных и канализационных сетей включено. Подлимит по данному риску: 5 000 000 тенге на весь срок страхования.', 'Естественный износ и постепенное воздействие влаги; умышленные действия страхователя. По затоплению применяется подлимит раздела 2.'),
]
for i, (filename, name, accent, price, objects, deductible, water, exclusions) in enumerate(offers, 1):
    path = out / filename
    c = canvas.Canvas(str(path), pagesize=(595, 842))
    c.setTitle(name + ' - учебное предложение')
    c.setAuthor('Polis - синтетические данные')
    def page(number, title):
        c.setFillColor(HexColor(accent)); c.rect(0, 810, 595, 32, fill=1, stroke=0)
        c.setFillColor(HexColor('#ffffff')); c.setFont('ArialBold', 9)
        c.drawString(42, 821, 'УЧЕБНЫЙ ПРИМЕР / ВСЕ КОМПАНИИ И УСЛОВИЯ ВЫМЫШЛЕНЫ')
        c.setFillColor(HexColor('#19323b')); c.setFont('ArialBold', 23); c.drawString(42, 768, name)
        c.setFont('Arial', 10); c.drawString(42, 742, f'Предложение DEMO-2026-00{i} | 15 сентября 2026 года')
        c.setFont('ArialBold', 16); c.drawString(42, 702, title)
        c.setStrokeColor(HexColor('#d7e0e3')); c.line(42, 62, 553, 62)
        c.setFont('Arial', 8); c.setFillColor(HexColor('#607179'))
        c.drawString(42, 43, 'Не является офертой, полисом или реальным страховым предложением.')
        c.drawRightString(553, 29, f'Страница {number} из 2')
    y = 666
    def block(label, text):
        global y
        c.setFillColor(HexColor(accent)); c.setFont('ArialBold', 11); c.drawString(42, y, label)
        p = Paragraph(text, style); _, h = p.wrap(511, 600)
        p.drawOn(c, 42, y - 12 - h); y -= h + 42
        assert y > 84, (filename, label, y)
    page(1, '1. Объект и стоимость страхования')
    block('Страхователь', 'Вымышленное ТОО «Точка Маркет». Объект: розничный магазин в Алматы.')
    block('Застрахованное имущество', objects)
    block('Общая страховая сумма', '80 000 000 тенге.')
    block('Срок страхования', '12 месяцев с даты начала действия договора.')
    block('Страховая премия', price + ' тенге за весь срок страхования. Оплата единовременно.')
    c.showPage(); page(2, '2. Покрытие и особые условия'); y = 666
    block('Пожар', 'Ущерб застрахованному имуществу вследствие пожара покрывается в пределах общей страховой суммы.')
    if water:
        block('Затопление', water)
    block('Франшиза', deductible)
    block('Исключения', exclusions)
    block('Общие положения', 'Условия действуют для указанного объекта и срока. Окончательный состав покрытия фиксируется в согласованном договоре и приложениях к нему.')
    c.save()
    reader = PdfReader(path)
    assert len(reader.pages) == 2
    assert all('ВЫМЫШЛЕНЫ' in p.extract_text() for p in reader.pages)
    pdf = pdfium.PdfDocument(str(path))
    for n in range(len(pdf)):
        pdf[n].render(scale=1.2).to_pil().save(render / f'{i}-{n+1}.png')

request = 'Страхование магазина в Алматы на 12 месяцев. Страховая сумма 80 000 000 тенге. Включить помещение, оборудование и товарные запасы. Покрыть пожар и затопление при аварии водопровода без отдельного подлимита. Франшиза не более 100 000 тенге.'
(out / '00-Запрос-клиента.txt').write_text('Название заявки: Магазин «Точка» - показ\nКлиент: Вымышленное ТОО «Точка Маркет»\n\nТребования клиента (скопировать в поле):\n' + request, encoding='utf-8-sig')
(out / 'Сценарий-показа.txt').write_text('POLIS - КОМПЛЕКТ ДЛЯ ЖИВОГО ПОКАЗА\n\n1. Открой http://127.0.0.1:5173/ и нажми «Новая заявка».\n2. Скопируй название, клиента и требования из 00-Запрос-клиента.txt.\n3. Добавь три предложения: Орбита Страхование, Вектор Полис, Сфера Защита. Загрузи соответствующий PDF для каждого. TXT-файлы загружать не нужно.\n4. Запусти анализ. Дождись результата: время зависит от API и квоты.\n5. Открой франшизу Вектора и покажи цитату на странице 2.\n6. Покажи различия по товарным запасам и затоплению.\n7. Проверь условия по документам, затем открой предложение клиенту.\n\nОЖИДАЕМЫЕ НАХОДКИ (НЕ ЗАГРУЖАТЬ В АНАЛИЗ)\nОрбита: 420 000 тенге в год; франшиза 100 000; товары включены; затопление без отдельного подлимита.\nВектор: 365 000 тенге в год; франшиза 1% от 80 млн = 800 000 тенге, выше запроса в 8 раз; товары исключены. Условия затопления в PDF отсутствуют: модель должна запросить уточнение, а не объявить отказ в покрытии.\nСфера: 485 000 тенге в год; франшиза 50 000; товары включены; затопление ограничено 5 млн тенге, что расходится с запросом.\n\nРЕПЛИКА ДЛЯ ПОКАЗА\n«Самая низкая цена не означает соответствие запросу. Polis сопоставляет документы с требованиями клиента и показывает, где именно находятся ограничения. Брокер проверяет выводы по первоисточнику».\n\nВсе данные вымышлены. В PDF нет готовых выводов модели. Названия нужны только для демонстрации.\nЕсли доступ к Google истёк, используй сохранённую заявку «Gemini · учебный кейс для презентации» и честно покажи ранее выполненный анализ.\n', encoding='utf-8-sig')
with zipfile.ZipFile(out.parent / 'Polis-demo.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for p in out.iterdir():
        z.write(p, arcname='Polis-demo/' + p.name)
thumbs = []
for p in sorted(render.glob('[1-3]-[1-2].png')):
    im = Image.open(p).convert('RGB'); im.thumbnail((357, 505))
    tile = Image.new('RGB', (377, 535), '#e7ebed'); tile.paste(im, (10, 20))
    ImageDraw.Draw(tile).text((10, 5), p.stem, fill='black'); thumbs.append(tile)
sheet = Image.new('RGB', (377*3, 535*2), 'white')
for i, im in enumerate(thumbs): sheet.paste(im, ((i//2)*377, (i%2)*535))
sheet.save(render / 'contact.png')
print('Created 3 PDFs, client brief, presenter notes and ZIP:', out)
