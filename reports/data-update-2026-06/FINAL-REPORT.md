# Итоговый отчёт: обновление данных трекера (2026-06-21)

Обновлены данные по 8 играм в порядке: Genshin Impact → Zenless Zone Zero → Honkai: Star Rail → Arknights: Endfield → Neverness to Everness → NIKKE → Diablo IV → World of Warcraft. Подробные отчёты по каждой игре — в этой же папке (`genshin-impact.md`, `zenless-zone-zero.md`, `honkai-star-rail.md`, `arknights-endfield.md`, `neverness-to-everness.md`, `nikke.md`, `diablo-iv.md`, `world-of-warcraft.md`).

## Сводная таблица по играм

| Игра | Баннеры | События | Сезоны | Confirmed | Corroborated | Single-source | Conflicting/Unverified | Demo удалено |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Genshin Impact | 5 | 15 | 2 | 0 | 5 | 17 | 0 | 0 |
| Zenless Zone Zero | 2 | 9 | 1 | 0 | 4 | 8 | 0 | 0 |
| Honkai: Star Rail | 6 | 8 | 1 | 0 | 9 | 6 | 0 | 0 |
| Arknights: Endfield | 2 | 4 | 2 | 2 | 1 | 5 | 0 | 0 |
| Neverness to Everness | 4 | 10 | 1 | 12 | 3 | 0 | 0 | 0 |
| NIKKE | 2 | 5 | 0 | 5 | 2 | 0 | 0 | 0 |
| Diablo IV | 0 | 2 | 1 | 2 | 1 | 0 | 0 | 0 |
| World of Warcraft | 0 | 4 | 1 | 4 | 1 | 0 | 0 | 0 |
| **Итого** | **21** | **57** | **9** | **25** | **26** | **36** | **0** | **0** |

Всего записей в проекте: **87** (было 70 до обновления). Записей `conflicting`/`unverified` не обнаружено — все добавленные/изменённые записи подтверждены минимум одним приемлемым источником, расхождений в датах между источниками не найдено. Демо-записей по этим 8 играм не было и не появилось.

## Использованные источники (по ролям)
- **Discovery:** PC Gamer/Prydwen/Game8 (HoYoverse-игры), GameWith/Game8 (NTE, NIKKE), Wowhead (Diablo IV, WoW), Darmory (WoW, источник вновь подключён).
- **Verification:** прямые фетчи официальных доменов удались для `nte.perfectworld.com` (Neverness to Everness), `news.blizzard.com`/`worldofwarcraft.blizzard.com` (Diablo IV, WoW). Прямые фетчи HoYoverse-доменов (genshin.hoyoverse.com, zenless.hoyoverse.com) и `nikke-en.com` стабильно не отдавали содержимое (вероятно JS-рендеринг) — для этих игр верификация шла через корроборацию минимум двумя независимыми специализированными источниками.
- **Corroboration:** Game8, Prydwen, BuffHub, gamsgo, lootbar, allthings.how, gurugamer, Mobalytics, GamesRadar, blizzardwatch и другие — использовались для повышения `single-source` → `corroborated`, когда находились двое независимых.

## Разрешённые отключённые источники
| Источник | Игра | Результат |
| --- | --- | --- |
| `src-nte-update-notes` | Neverness to Everness | **Включён.** `baseUrl` подтверждён: `nte.perfectworld.com/en/article/news/gamebroad/` (официальные патч-ноуты, прямой фетч успешен). |
| `src-nte-official-announcements` | Neverness to Everness | Оставлен без изменений (уже был включён; более точного официального сайта объявлений, кроме уже покрытого `nte.perfectworld.com`, не нашлось). |
| `src-wow-darmory-calendar` | World of Warcraft | **Включён.** `baseUrl` подтверждён: `darmory.com/events/calendar` (прямой фетч успешен, показывает текущие/предстоящие события с датами). |
| `src-wow-today-in-wow` | World of Warcraft | **Остался отключён.** Домен найден (`todayinwow.com`), но прямой фетч даёт HTTP 403 (защита от ботов) — содержимое подтвердить не удалось. |

## Данные, которые не удалось найти/подтвердить (и почему не добавлены)
- **Будущие версии/сезоны, помеченные источниками как leak/прогноз** — не добавлены согласно правилу проекта (HSR 4.4, ZZZ 3.1, NTE 1.2, Arknights: Endfield 1.4, WoW Midnight Season 2/patch 12.1 с точной датой).
- **Arknights: Endfield** — точная дата окончания версии 1.3 (и связанных баннера Camille/события/сезона) официально не объявлена; использована единственная найденная оценка с явной пометкой неопределённости (`single-source`, подробный `verificationNote`).
- **NIKKE** — официальный сайт (`nikke-en.com/notice`) не отдал содержимое напрямую (404/пусто); верификация шла через корроборацию специализированных источников.
- **Diablo IV Season 14** — дата начала корроборирована, но точная дата окончания нигде не объявлена (источники прямо пишут «not officially confirmed») — запись о сезоне 14 не создана.

## Результаты пяти проверок
| Проверка | Результат |
| --- | --- |
| `npm run format` | ✅ пройдена |
| `npm run validate` | ✅ пройдена, 0 ошибок, 0 предупреждений |
| `npm run typecheck` | ✅ пройдена |
| `npm run lint` | ✅ пройдена |
| `npm run build` | ✅ пройдена (production build успешен) |

## Ручная проверка в браузере (dev-сервер)
Проверены: главная страница (счётчики 8 игр / 87 записей корректны), страница «Игры» (счётчики активных/всего по каждой из 8 игр совпадают с данными), страницы отдельных игр (Arknights: Endfield — все 8 записей, статусы и фильтры по достоверности отображаются верно), «Архив» (завершённые записи, включая новые завершившиеся, фильтры работают), «Календарь» (метки начала/окончания по дням месяца), карточка отдельной записи (полная русская локализация, оригинальное название, источники, `verificationNote`). Блок «Требует проверки» не отображается ни на одной странице — ожидаемо, так как в датасете не появилось ни одной записи со статусом `conflicting`/`unverified`. Ошибок в консоли браузера не обнаружено.

## Изменённые файлы
- `data/banners.json`, `data/events.json`, `data/seasons.json` — основные изменения данных.
- `data/sources.json` — обновлены 2 источника (включены и подтверждён `baseUrl`).
- `reports/data-update-2026-06/*.md` — 8 отчётов по играм + этот итоговый отчёт.

## Публикация
Изменения сохранены на диске и закоммичены не были — **`git push` и публикация на Vercel не выполнялись**, как было явно указано. Ожидаю отдельного подтверждения перед публикацией.
