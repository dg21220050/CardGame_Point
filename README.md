# CardGame Point

Version 0.0.6 is a points-only online card party game for lab teammates. The traditional betting-table mode has been removed; the project now focuses on Score Battle, effect cards, tomatoes, avatars, profile history, and future internet deployment.

## Start the Server

From this folder:

```powershell
.\start-server.ps1
```

Then open:

```text
http://localhost:3000
```

For LAN play, teammates can open the host computer's LAN address, for example:

```text
http://192.168.1.23:3000
```

If Windows asks about network access, allow the Node.js server on the private/lab network.

## Stop the Server

Double-click:

```text
Stop server.bat
```

Or run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\stop-server.ps1"
```

The stop script only shuts down the CardGame Point server started from this folder. It does not close unrelated Node.js programs.

## Current Rules

- Score Battle supports 2-6 human or computer players. It does not use money, blinds, or betting.
- A game has five rounds. Each round deals five new community cards and tops each player up to 3, 4, 5, 5, then 5 hand cards.
- During each player's first-round turn, FATE presents two random build choices and requires one selection before play. The chosen FATE remains visible at that player's seat for the full game.
- The six FATE builds are The Giant, The Dice, The Big Short, Going Long, The Collector, and The Clod. Only one player can choose The Giant in a game.
- The Dice replaces the base hand multiplier with the player's highest roll that round; additive effect multipliers still apply afterward. Specified reroll and mirror effects permanently add dice.
- The Clod changes its owner's round hand sizes to 5, 6, 7, 7, and 7 and grants one extra discard use each round.
- Players choose exactly five cards from their own hand and the current community cards. Each play must include at least one community card.
- Played hand cards are permanently discarded; unused hand cards remain for the next round.
- Each player starts with four discard uses per game. A discard can exchange any number of selected hand cards for unique replacements in the same hand positions.
- During rounds 2-5, players may choose one of three private effect cards while selecting a play. Effects are optional and resolved by the server.
- Players act one at a time in rotating seat order. Each turn has a 90-second timer. Timeout automatically plays the best available five-card score that includes a community card.
- A one-click play button beside the local player's seat uses the same server-side search to submit the highest estimated valid score while respecting the selected effect and FATE state.
- Interactive effects may change hands or the community board immediately, so later players in the same round see and score against the changed state.
- Score Battle effects use the current balance rules shown in the in-game scoring rules panel.
- Scores use the selected cards' point total (Ace is 15), hand multiplier, and effect modifiers. The five round scores are added together.
- Playing a same-suit 10, J, Q, K, and A Royal Flush immediately wins the game in any round.
- Tomato King, Tomato Shooter, and Tempered Tomato multiply their count bonus by the lower of the played hand's base multiplier and 2.
- Score Battle tomatoes can be thrown only during another player's active turn, not during your own turn or round settlement.
- Submitted plays are revealed to all players with community cards highlighted and a scoring breakdown shown to the scoring player.
- Players can throw tomatoes at other seated players. Tomato throws are visible to everyone at the table and are rate-limited.
- Final standings award persistent in-game coins: 8 for first place, 4 for second, 2 for third, and 1 for later places.
- Score Battle standings are saved into each participating player's profile history.
- Waiting or finished Score Battle tables close automatically if no new game starts within 10 minutes.

## Saved Data

Registered accounts, password hashes, sessions, avatar uploads, and profile history are stored on the host computer in:

```text
data/
```

Passwords are saved as salted hashes, not plain text. Do not commit or publish the `data/` directory. Running table state is kept in memory, so restarting the server clears active tables but keeps account data.

When `DATABASE_URL` is set, CardGame Point stores users and remembered login sessions in Postgres instead of JSON files. This is the recommended mode for Render deployment because free web-service files are ephemeral.

## Render Environment Variables

Set these on the Render Web Service:

```text
DATABASE_URL=<your Render Postgres internal database URL>
ADMIN_SECRET=<a long private administrator password>
PGSSLMODE=disable
```

Use `PGSSLMODE=require` only if your Postgres URL requires SSL. Render internal Postgres URLs usually work without SSL.

Optional:

```text
ADMIN_PATH=/admin
MAX_JSON_BODY_BYTES=8388608
```

## Administrator Tools

If `ADMIN_SECRET` is configured, open:

```text
https://your-render-service.onrender.com/admin
```

The admin page can:

- log in with `ADMIN_SECRET`
- export users, avatars, coins, history, and remembered sessions
- import a previous admin export or old `users.json` data

Import replaces the current user database, so export a backup first. Treat exported files as sensitive because they contain password hashes and remembered session tokens.

## Deployment Notes

- The app is currently a Node.js server with local JSON persistence.
- For public internet hosting, use environment variables for host secrets and keep account data in Postgres.
- Add regular export backups before important updates.
- Do not expose raw data files through static hosting. The `public/` folder is browser-facing; `data/` must remain server-only.
