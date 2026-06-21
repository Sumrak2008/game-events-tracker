# Как добавить баннер, событие или сезон

Выберите файл по типу записи:

- баннер → `data/banners.json` (`type: "banner"`)
- событие → `data/events.json` (`type: "event"`)
- сезон → `data/seasons.json` (`type: "season"`)

## Шаги

1. Убедитесь, что игра уже есть в `data/games.json` (нужен её `id`). Если нет — см. [adding-a-game.md](adding-a-game.md).
2. Найдите дату и время **в официальном источнике** (см. `data/sources.json`). Не угадывайте даты.
3. Добавьте объект записи в соответствующий массив.

### Баннер

```json
{
  "id": "gi-banner-2026-07-character-x",
  "type": "banner",
  "gameId": "genshin-impact",
  "title": "Баннер: Имя персонажа",
  "description": "Что это за баннер.",
  "bannerSubtype": "character",
  "startAt": "2026-07-01T11:00:00+08:00",
  "endAt": "2026-07-22T14:59:00+08:00",
  "timezone": "Asia/Shanghai",
  "region": "Global",
  "sourceType": "official",
  "confidence": "confirmed",
  "sourceUrls": ["https://genshin.hoyoverse.com/en/news/..."],
  "verifiedAt": "2026-06-30T10:00:00+00:00",
  "isDemo": false
}
```

`bannerSubtype` — необязательное: `character`, `weapon`, `equipment` или `other`.

**Правило: один публичный баннер — это баннер персонажа.** Если в игре одновременно с баннером персонажа идёт связанный оружейный/арк-баннер (то же окно дат, тот же персонаж), **не добавляй для него отдельную запись** — игроку очевидно, что сигнатурное оружие персонажа доступно вместе с ним. Не указывай оружие в заголовке баннера персонажа (правильно: «Баннер Фурины»; неправильно: «Баннер Фурины и Изумрудного овода»). Записи с `bannerSubtype: "weapon"` в любом случае скрываются из публичного интерфейса (см. `src/lib/visibility.ts`), но лучше не создавать их вовсе.

### Событие

```json
{
  "id": "wow-event-2026-summer",
  "type": "event",
  "gameId": "world-of-warcraft",
  "title": "Название события",
  "description": "Описание.",
  "startAt": "2026-07-05T15:00:00+02:00",
  "endAt": "2026-07-26T15:00:00+02:00",
  "timezone": "Europe/Paris",
  "region": "Europe",
  "sourceType": "official",
  "confidence": "confirmed",
  "sourceUrls": ["https://worldofwarcraft.blizzard.com/en-us/news/..."],
  "verifiedAt": "2026-06-30T10:00:00+00:00",
  "isDemo": false
}
```

### Сезон

```json
{
  "id": "d4-season-2026-08",
  "type": "season",
  "gameId": "diablo-iv",
  "title": "Название сезона",
  "description": "Описание.",
  "startAt": "2026-08-01T17:00:00-04:00",
  "endAt": "2026-10-31T17:00:00-04:00",
  "timezone": "America/New_York",
  "region": "Americas",
  "sourceType": "official",
  "confidence": "confirmed",
  "sourceUrls": ["https://news.blizzard.com/en-us/diablo4/..."],
  "verifiedAt": "2026-07-25T10:00:00+00:00",
  "isDemo": false
}
```

## Правила

- **Даты — ISO 8601 с часовым поясом** (смещение `+08:00`, `-04:00`, `Z`). `endAt` не раньше `startAt`.
- **Заполняйте `region` и `timezone`.**
- **`sourceUrls` обязателен** для реальных записей (`isDemo: false`) и должен быть непустым массивом URL. Также заполните `sourceType`, `confidence` и `verifiedAt`.
- **`verifiedAt`** — дата/время, когда вы сверились с источником.
- **Статус не указывайте** — он вычисляется автоматически.
- **Не копируйте изображения** с сайтов игр; `imageUrl` оставляйте пустым.
- **Завершённые записи не удаляйте** — они уходят в архив сами.
- Для демонстрационных записей ставьте `"isDemo": true` и начинайте `id` с `demo-`.

## После добавления

```bash
npm run validate     # обязательно
npm run lint && npm run typecheck && npm run build
```

Если валидатор сообщает об ошибке — исправьте запись и повторите. Не публикуйте при ошибках.
