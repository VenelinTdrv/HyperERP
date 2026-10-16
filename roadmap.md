# HyperERP redesign
- [x] Establish Bulgarian ERP design system and order layout.
- [x] Implement customer, delivery, product, and order-summary interactions.
- [x] Verify order flow and smaller-screen layout.

## Deliveries screen
- [x] Add a deliveries workspace matching the order screen and supplied reference.
- [x] Implement filters, delivery details, and demonstration add/edit/receive actions.
- [x] Verify navigation and delivery flow on wide and narrow screens.

## Orders menu
- [x] Add Orders above Sales with an unprocessed-only demonstration list.
- [x] Verify navigation, filtering, details, and pagination.
- [x] Add per-row checkboxes with select-all on the current page and a selection summary.

## Articles screen
- [x] Add article list, category navigation, search, selection, and category changes using SKU terminology.
- [x] Add and validate the Add article dialog with demonstration-only updates.
- [x] Verify add flow, filtering, category changes, and narrow-screen layout.

## Combos screen
- [x] Add combos list, search, influencer filter, and pagination.
- [x] Implement demonstration create, details, edit, and confirmed delete with product quantities.
- [x] Verify CRUD flow and smaller-screen layout.

## Categories screen
- [x] Add a hierarchical categories workspace and expand/collapse controls.
- [x] Implement demonstration create, subcategory, details, edit, and safe confirmed delete.
- [x] Verify CRUD, validation, hierarchy, navigation, and smaller-screen layout.

## Settlements screen
- [x] Add settlements list with name/region filters, pagination, and demonstration CRUD (country, name, region, postal code).
- [x] Verify CRUD flow, validation, and smaller-screen layout.

## Warehouses screen
- [x] Add warehouses list with name/city filters, pagination, and demonstration CRUD (physical/virtual, country, city, address, postal code).
- [x] Verify CRUD flow, validation, and smaller-screen layout.

## Transfers screen
- [x] Add /transfers with filters, statuses, product picker, stock move on completion, PDF/XLS export.
- [x] Add per-row checkboxes with select-all on the current page and a selection summary.
- [x] Продажби: списък на / с checkboxes, Нова поръчка на /sales/new
- [x] Поръчки: икони за експорт в PDF (прозорец за печат) и XLS (porachki.xls) до бутона "Нова поръчка"; експортират филтрирания списък.
- [x] Продажби: икони за експорт в PDF (прозорец за печат) и XLS (prodazhbi.xls) до бутона "Нова поръчка"; експортират филтрирания списък.
- [x] Доставки: checkboxes за избор на редове + икони за експорт в PDF и XLS.
- [x] Артикули: икони за експорт в PDF (прозорец за печат) и XLS (artikuli.xls) в заглавието; експортират филтрирания списък.
- [x] Поръчки: меню ⋮ (Отвори и редактирай, Обработена, Анулирай) и екран /orders/$id със статус, продукти, цени и доставка (демо).
- [x] Бланка на поръчка: PDF бланка (клиент, доставка, плащане, продукти) от меню ⋮ в Поръчки, прегледа и екрана /orders/$id; метод на плащане в Order

## Order blank waybill
- [x] Use the firm data ("Георги Желев 2009" ЕАД, Ямбол, ЕИК, телефон) as Изпращач in the waybill.
- [x] Add a Code 128 barcode of the order number to the waybill in the printable blank and the downloaded PDF.
- [x] Verify the barcode decodes on every page and the Cyrillic text layer stays correct across downloads.

## New order screen
- [x] Клиент и доставка: данните за доставка се показват чак след избор на клиент; преди това стои подсказка.

## Продажби списък
- [x] Добавени 4 демо продажби (ORD-0018..ORD-0015) — общо 10, всички на една страница.
- [x] Проверено, че 10-те реда и пагинацията се събират без скрол; филтрите по статус и куриер работят.

## Доставки списък
- [x] Компактен изглед като Поръчки/Продажби: info „i" до заглавието, по-малки отстояния и редове.
- [x] Броячите по статус са намалени и качени на един ред със заглавието „Доставки".
- [x] Проверено в браузъра: заглавие + 4 чипа + бутони на един ред, подсказката и филтрирането по статус работят.
- [x] Добавени 4 демо доставки (DEL-0012..DEL-0009) — общо 10 реда на една страница; чиповете и филтрите ги засичат.
- [x] Пътят горе показва "Нова поръчка" само на /sales/new.

## Комбота списък
- [x] Компактен изглед като Поръчки/Продажби/Доставки: info „i" до заглавието вместо подзаглавието, по-плътни филтри и редове.
- [x] Добавени 7 демо комбота (id 4..10) — общо 10 реда на една страница.
- [x] Проверено в браузъра: 10 реда + пагинация се събират без скрол, подсказката излиза, компилацията е чиста.

## Категории списък
- [x] Компактен изглед като останалите екрани: info „i" до заглавието вместо подзаглавието, по-плътни редове и по-малки отстояния.
- [x] Добавени 4 демо категории (Дамски парфюми, Мъжки парфюми, Креми, Монитори) — общо 10 реда, разгънати по подразбиране.
- [x] Проверено в браузъра: 10 реда + футерът се събират без скрол, подсказката и свиването на клон работят.
