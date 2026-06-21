# Формат данных JSON

Все данные лежат в каталоге `data/` и являются единственным источником правды. После правки запускайте `npm run validate`.

## Файлы

| Файл | Содержимое |
| --- | --- |
| `games.json` | Список игр. |
| `banners.json` | Записи типа `banner`. |
| `events.json` | Записи типа `event`. |
| `seasons.json` | Записи типа `season`. |
| `sources.json` | Реестр источников по играм (обнаружение/подтверждение/резерв), см. [docs/data-sources.md](data-sources.md). |

Поле `type` в каждой записи должно совпадать с файлом.

## Игра (`games.json`)

```json
{
  "id": "genshin-impact",
  "name": "Genshin Impact",
  "shortName": "Genshin",
  "initials": "GI",
  "publisher": "HoYoverse",
  "colorFrom": "#2dd4bf",
  "colorTo": "#0e7490",
  "imageUrl": ""
}
```

`imageUrl` — необязательное растровое изображение-обложка. Если пусто, используется оригинальный SVG-арт `public/art/games/<id>.svg`.

## Запись — общие поля

| Поле | Тип | Обяз. | Описание |
| --- | --- | --- | --- |
| `id` | string | да | Уникальный среди всех записей. Для демо начинайте с `demo-`. |
| `type` | `banner \| event \| season` | да | Должен совпадать с файлом. |
| `gameId` | string | да | Должен существовать в `games.json`. |
| `title`, `description` | string | да | Заголовок и описание. |
| `startAt`, `endAt` | string (ISO 8601 + TZ) | да | `endAt` не раньше `startAt`. |
| `timezone` | string (IANA) | да | Напр. `Asia/Shanghai`. |
| `region` | string | да | Напр. `Global`, `Asia`, `Europe`, `Americas`. |
| `sourceType` | `official \| specialist \| wiki \| community` | да | Категория сильнейшего источника. |
| `confidence` | `confirmed \| corroborated \| single-source \| conflicting \| unverified` | да | Уровень достоверности дат. |
| `sourceUrls` | string[] | да | Все использованные ссылки (≥1, первая — сильнейшая). |
| `verifiedAt` | string (ISO 8601 + TZ) | да | Когда данные сверялись. |
| `verificationNote` | string | нет | Причина неопределённости / как сверялось. |
| `isDemo` | boolean | да | `true` — демонстрационная/ориентировочная запись (в UI «Демо-данные»). |
| `imageUrl`, `note` | string | нет | Доп. изображение и заметка. |
| `sourceUrl` | string | нет | Устаревшее, заменено на `sourceUrls`. |

### Достоверность

- `confirmed` — дата подтверждена **официальным** источником (только при `sourceType: "official"`).
- `corroborated` — дата совпадает минимум в **двух независимых** сторонних источниках.
- `single-source` — только один приемлемый сторонний источник. В UI — «Один сторонний источник».
- `conflicting` — источники расходятся. В UI попадает в блок «Требует проверки», не среди подтверждённых.
- `unverified` — сведения найдены, но пока не подтверждены ни одним приемлемым источником. В UI — тот же блок «Требует проверки».

## Поля баннера (`banners.json`)

`bannerSubtype` (нет): `character` \| `weapon` \| `equipment` \| `other`.

## Поля события (`events.json`, все необязательные)

| Поле | Тип | Описание |
| --- | --- | --- |
| `eventSubtype` | `major \| challenge \| login \| web \| limited-mode \| reward-event \| other` | Подтип события. |
| `rewards` | string[] | Список наград. |
| `rewardSummary` | string | Короткое описание наград. |
| `premiumCurrencyName` | string | Название премиальной валюты (напр. `Primogems`). |
| `premiumCurrencyAmount` | number | Подтверждённое количество. **Не выдумывать.** |
| `summonCurrencyAmount` | number | Подтверждённое количество валюты призыва/билетов. |
| `requirements` | string | Условия участия. |
| `claimEndAt` | string (ISO 8601 + TZ) | Срок получения наград, если позже `endAt`. |

> Если подтверждён только факт наличия премиальной валюты, укажите `premiumCurrencyName` **без** `premiumCurrencyAmount`.

## Статус не хранится

Поля статуса в JSON нет. `upcoming` / `active` / `completed` вычисляются по текущему времени:

- `now < startAt` → `upcoming`
- `startAt ≤ now ≤ endAt` → `active`
- `now > endAt` → `completed` (архив)

## Пример события

```json
{
  "id": "nikke-event-cinderella-poll-2026-06",
  "type": "event",
  "gameId": "goddess-of-victory-nikke",
  "title": "Doki Doki NIKKE: голосование за костюм Cinderella",
  "description": "Голосование за новый дизайн костюма Cinderella…",
  "startAt": "2026-06-17T11:00:00+09:00",
  "endAt": "2026-06-24T23:59:00+09:00",
  "timezone": "Asia/Seoul",
  "region": "Global",
  "eventSubtype": "web",
  "rewards": ["Recruit Voucher (за голос)", "Бесплатный костюм-победитель"],
  "rewardSummary": "До 2 Recruit Voucher; бесплатный костюм-победитель.",
  "summonCurrencyAmount": 2,
  "requirements": "Проголосовать; репост даёт второй ваучер.",
  "sourceType": "official",
  "confidence": "confirmed",
  "sourceUrls": ["https://nikke-en.com/events/cinderellapoll/"],
  "verifiedAt": "2026-06-19T00:00:00+00:00",
  "isDemo": false
}
```

## Что проверяет валидатор

Обязательные поля; существование `gameId`; уникальность `id`; ISO-даты с TZ (`startAt`, `endAt`, `verifiedAt`, `claimEndAt`); `endAt ≥ startAt`; `region`; валидный IANA `timezone`; `sourceType`/`confidence` из допустимых наборов; `confirmed` только при `sourceType: official`; `sourceUrls` — непустой массив URL; допустимость `type`/`bannerSubtype`/`eventSubtype`; числовые `*CurrencyAmount`; `rewards` — массив строк; полные дубликаты; соглашение об `isDemo`.

Дополнительно для `sources.json`: `gameId` каждого реестра существует и не дублируется; у каждого источника заполнены `id` (уникален), `name`, `baseUrl` (URL, либо `enabled: false` с предупреждением), `role` совпадает с массивом (`discoverySources`/`verificationSources`/`fallbackSources`), `sourceType` из допустимого набора, `priority` — число, все `supports*`/`enabled` — boolean; предупреждение, если у игры из `games.json` вовсе нет реестра.

## Реестр источников (`sources.json`)

`sources.json` — массив реестров источников по играм (`GameSourceRegistry`), не записей баннеров/событий/сезонов. У каждой игры свой набор источников обнаружения/подтверждения/резерва — подробное описание и таблица по каждой игре в [docs/data-sources.md](data-sources.md).

```json
{
  "gameId": "genshin-impact",
  "discoverySources": [
    {
      "id": "src-genshin-game8-events",
      "name": "Game8 — Events Schedule and Calendar",
      "baseUrl": "https://game8.co/games/Genshin-Impact",
      "role": "discovery",
      "sourceType": "specialist",
      "priority": 1,
      "supportsEvents": true,
      "supportsBanners": false,
      "supportsSeasons": true,
      "supportsRewards": true,
      "supportsRegionalDates": false,
      "enabled": true,
      "notesRu": "Используется для поиска полного перечня текущих и анонсированных событий версии."
    }
  ],
  "verificationSources": [
    {
      "id": "src-genshin-official-news",
      "name": "Genshin Impact — официальные новости",
      "baseUrl": "https://genshin.hoyoverse.com/en/news",
      "role": "verification",
      "sourceType": "official",
      "priority": 1,
      "supportsEvents": true,
      "supportsBanners": true,
      "supportsSeasons": true,
      "supportsRewards": true,
      "supportsRegionalDates": true,
      "enabled": true
    }
  ],
  "fallbackSources": []
}
```

`enabled: false` помечает источник, который временно не используется (например, точный URL не подтверждён) — не брать из него данные, пока не проверено и не включено.
