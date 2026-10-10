# max-fork

Клиент мессенджера MAX на [GREEN-API](https://green-api.com/v3/docs/). UI на `@maxhub/max-ui`, сборка — Vite + React.

Работает через HTTP API инстанса: список чатов, история, отправка, входящие через long-poll.

## Запуск

```bash
npm i
npm run dev
```

Нужны `idInstance` и `apiTokenInstance` из личного кабинета GREEN-API (хост `3100.api.green-api.com`).

### Хранение credentials

Креды **намеренно не сохраняются** в `localStorage` / `sessionStorage` / cookies браузера: это небезопасно — токен инстанса лежит в открытом виде и доступен любому скрипту на странице (XSS) и инструментам разработчика.

Нормальная схема — бэкенд, который хранит секреты и ходит в GREEN-API сам; клиент общается только со своим API и получает уже готовые данные. В этом учебном/демо-клиенте креды живут только в памяти React-состояния на время сессии вкладки.

## Эндпоинты GREEN-API

Базовый URL: `https://3100.api.green-api.com/waInstance{idInstance}/{method}/{apiTokenInstance}`.

| Метод | Зачем в приложении |
| --- | --- |
| `getStateInstance` | Проверка авторизации инстанса при подключении |
| `getChats` | Список чатов в сайдбаре |
| `getChatHistory` | История открытого чата и превью последнего сообщения в списке |
| `sendMessage` | Отправка текстовых сообщений |
| `getContactInfo` | Мета контакта: имя, аватар, телефон, last seen |
| `getGroupData` | Мета группы/канала: название, описание, аватар, ссылка |
| `receiveNotification` | Long-poll входящих/исходящих событий (real-time) |
| `deleteNotification` | Подтверждение обработанного уведомления из очереди |

В инстансе должен быть включён приём через HTTP API, иначе очередь уведомлений не поедет.

## Что умеет

- список чатов с превью последнего сообщения, аватарами и unread
- переписка, emoji, markdown-ссылки `[текст](url)`
- профиль контакта / группы
- real-time через `receiveNotification`

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
