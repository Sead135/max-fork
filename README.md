# max-fork

Клиент мессенджера MAX на [GREEN-API](https://green-api.com/v3/docs/). UI на `@maxhub/max-ui`, сборка — Vite + React + TanStack Query.

## Запуск

```bash
npm i
npm run dev
```

Нужны `idInstance` и `apiTokenInstance` из кабинета GREEN-API (хост `3100.api.green-api.com`).

Креды живут только в памяти сессии вкладки (без `localStorage`).

## Поток

1. Connect: `getStateInstance` → loader → `getChats` (до 3 попыток) → fade на чаты.
2. Если чаты не загрузились — всё равно открываем UI, ошибка и «Повторить» в списке.
3. По каждому чату: preview (`getChatHistory` count:1) и meta (`getContactInfo` / `getGroupData`).
4. Открытие чата — полная история; отправка через `sendMessage`.
5. Real-time — один long-poll `receiveNotification` на инстанс.

## Эндпоинты

| Метод | Зачем |
| --- | --- |
| `getStateInstance` | проверка инстанса |
| `getChats` | список |
| `getChatHistory` | preview (1) и полная история |
| `sendMessage` | исходящие |
| `getContactInfo` / `getGroupData` | meta |
| `receiveNotification` / `deleteNotification` | live |

## Лимиты

Две очереди с паузой: history/preview и meta. На **466** остальные meta не ходят; preview продолжается.

## Скрипты

| команда | что делает |
| --- | --- |
| `npm run dev` | локалка |
| `npm run build` | production |
| `npm run preview` | превью |
| `npm run lint` | oxlint |
