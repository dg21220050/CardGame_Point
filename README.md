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

- Score Battle supports 2-6 human players. It does not use money, blinds, betting, or computer players.
- A game has five rounds. Each round deals five new community cards and tops each player up to 3, 4, 5, 5, then 5 hand cards.
- Players choose exactly five cards from their own hand and the current community cards. Each play must include at least one community card.
- Played hand cards are permanently discarded; unused hand cards remain for the next round.
- Each player starts with four discard uses per game. A discard can exchange any number of selected hand cards for unique replacements in the same hand positions.
- During rounds 2-5, players may choose one of three private effect cards while selecting a play. Effects are optional and resolved by the server.
- Players act one at a time in rotating seat order. Each turn has a two-minute timer. Timeout automatically plays the best available five-card score that includes a community card.
- Interactive effects may change hands or the community board immediately, so later players in the same round see and score against the changed state.
- Score Battle effects use the current balance rules shown in the in-game scoring rules panel.
- Scores use the selected cards' point total (Ace is 15), hand multiplier, and effect modifiers. The five round scores are added together.
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

## Deployment Notes

- The app is currently a Node.js server with local JSON persistence.
- For public internet hosting, use environment variables for host secrets and keep account data in provider storage or a managed database.
- Add TLS/HTTPS, stronger session cookie settings, backup/restore tooling, and an administrator maintenance interface before using it beyond a trusted group.
- Do not expose raw data files through static hosting. The `public/` folder is browser-facing; `data/` must remain server-only.
