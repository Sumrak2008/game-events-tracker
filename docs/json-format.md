# Формат данных JSON

Все данные лежат в каталоге `data/` и являются единственным источником правды. После правки запускайте `npm run validate`.

## Файлы

| Файл | Содержимое |
| --- | --- |
| `games.json` | Список игр. |
| `banners.json` | Записи типа `banner`. |
| `events.json` | Записи типа `event`. |
| `seasons.json` | Записи типа `season`. |
| `sources.json` | Официальные источники по играм (справочник). |

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
| `confidence` | `confirmed \| corroborated \| single-source \| conflicting` | да | Уровень достоверности дат. |
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

## Источник (`sources.json`)

```json
{
  "id": "src-genshin-official",
  "gameId": "genshin-impact",
  "name": "Genshin Impact — официальные новости",
  "url": "https://genshin.hoyoverse.com/en/news",
  "note": "Официальный новостной хаб."
}
```
