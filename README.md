# max-fork

Клиент мессенджера MAX на [GREEN-API](https://green-api.com/v3/docs/). UI на `@maxhub/max-ui`, сборка — Vite + React.

Работает через HTTP API инстанса: список чатов, история, отправка, входящие через long-poll.

## Запуск

```bash
npm i
npm run dev
```

Нужны `idInstance` и `apiTokenInstance` из личного кабинета GREEN-API (хост `3100.api.green-api.com`). В dev креды кладутся в `localStorage`, чтобы не вбивать каждый раз.

## Что умеет

- список чатов с превью последнего сообщения, аватарами и unread
- переписка, emoji, markdown-ссылки `[текст](url)`
- профиль контакта / группы
- real-time через `receiveNotification`

В инстансе должен быть включён приём через HTTP API, иначе очередь уведомлений не поедет.

## Ограничения API

`getContactInfo` / `getGroupData` / `getChatHistory` жрут квоту. Meta и превью ходят по одной цепочке с паузой; на **466** (квота плана) оставшиеся meta-запросы обрываются, превью продолжают грузиться отдельно.

Пустая история — не всегда баг приложения: журнал GREEN-API ограничен глубиной и настройками инстанса.

## Скрипты

| команда | что делает |
| --- | --- |
| `npm run dev` | локалка |
| `npm run build` | production-сборка |
| `npm run preview` | превью сборки |
| `npm run lint` | oxlint |

## Стек

React 19, TypeScript, Vite, TanStack Query, styled-components, Max UI.
