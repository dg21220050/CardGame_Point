# CardGame Point

Version 0.0.9 is the online, points-only CardGame Point build. It focuses on Score Battle, FATE builds, renewable personal decks, effect cards, tomatoes, table chat, avatars, profile history, and Render deployment; the traditional betting-table mode is not part of this release.

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

## Score Battle Mode

- Score Battle is a separate online mode for 2-6 human or computer players. It does not use blinds or bets.
- A game has five rounds. Each round deals five new community cards and normally tops each player up to 3, 4, 5, 5, then 5 hand cards; The Giant instead uses 4, 5, 5, 5, then 5.
- During each player's first-round turn, FATE presents three random build choices and requires one selection before play. The chosen FATE remains visible at that player's seat for the full game.
- The nine FATE builds are The Giant, The Dice, The Big Short, Going Long, The Collector, The Clod, The Hanged Man, Persona, and American Psycho. Only one player can choose The Giant, only one can choose American Psycho, and at most two can choose Persona in a game.
- The Giant starts with 3,500 total score, eight discard uses, 4/5/5/5/5 hand cards, and +1 mult on every hand. It loses the greater of 1.3 times the lowest non-Giant round score or 50% of the highest non-Giant round score after each round. Its AOE deducts 30% of its bare hand score from every non-Giant player's total. Every non-Giant below the Giant's bare hand score is Smashed for 30%, while every tied non-Giant round leader receives a separate 60% leader Smash; both deductions stack when both conditions apply. Once per game, Defense Stance reduces that round's Giant burden by 80%, 70%, 60%, 50%, or 40% in rounds 1-5.
- The Big Short and Going Long each start with six discard uses and predict the lowest and highest current-round scorer without changing the target's score. Their success counters are cumulative rather than consecutive; accumulated successes grant the existing 0, 50, 100, 300, then 500 bonus progression. The Collector starts with six discards, awards 20, 80, 150, 300, then 400 for its first five unique hand types, and shows the collected hand types at the player's seat.
- The Dice starts with six discard uses. Its final multiplier is the higher of (the highest die roll + all active effect multiplier bonuses) and (the hand-type multiplier + those same bonuses). Its outcomes are x3/x4/x5/x6/x7/x8/x10/x12/x15/x20 at 2.5%/5%/8.5%/20%/21%/20%/13%/6%/3%/1%. Shadow Swap, Void Erosion, Refresher Orb, World in Mirror, Man in Mirror, GOELIA, Void Targeting, and Chaos Dice each permanently add one die. Every x3 immediately triggers Misfortune and grants one extra roll.
- The Clod changes its owner's round hand sizes to 4, 5, 6, 6, and 6 and starts with six discard uses.
- The Hanged Man starts with five discard uses. Ace remains worth 15 chips, while every other card is worth 14 minus its printed rank. High Card, One Pair, Two Pair, Three of a Kind, and Straight use x6 base multiplier.
- Persona starts with three discard uses and sees the conventionally highest remaining hand card of every opponent. At most two players may choose it per game. It may copy at most one revealed card in every round. The original stays in its owner's hand but scores half base chips when that physical card is later played.
- American Psycho starts with five discard uses. Its true name is visible only to its owner; every other player sees one fixed non-Giant FATE disguise. Final `m` and `n` counts include every player, including the Giant. If both initial counts are zero, its current round score is reduced to 70% and the standings are recomputed; the next round then gains `m x 5` chips and a multiplier bonus capped at +3. An opponent who strictly beats both its round and total score in three accumulated rounds becomes eligible for Assassination. Before a later play, American Psycho may mark one eligible target to lose 100% of its current round score at settlement. It may assassinate up to two different targets per game and one per round; each use permanently adds 1 to both `n` and `m`.
- Players choose exactly five cards from their own hand and the current community cards. Each play must include at least one community card. Played hand cards are permanently discarded; unused hand cards remain for the next round.
- Each player normally starts with four discard uses, with no hard cap on uses gained from FATE or effects. A discard exchanges any number of selected hand cards for unique replacement cards in the same hand positions.
- During rounds 2-5, each player may choose one of three private effect cards while selecting a play. Effects are optional and are resolved by the server when scoring the selected five cards.
- Players act one at a time in a rotating seat order. Each turn has a 120-second timer for effect choice, discard choices, and card selection. Timeout automatically plays the best available five-card score that includes a community card, using only an effect the player already selected.
- A one-click play button beside the local player's seat uses the same server-side search to submit the highest estimated valid score while respecting the selected effect and FATE state.
- Interactive effects may change hands or the community board immediately, so later players in the same round see and score against the changed state.
- Score Battle effects use the current balance rules shown in the in-game scoring rules panel.
- Void Erosion adds `30 x n` final score for players still to act. Old days' Tomatoes adds both throw and hit counts to chips before multiplication. Mirror effects treat Ace as 1 only for their absolute-difference bonus while Ace remains worth 15 when scored. Dance of Illusions grants +100% attack speed.
- Scores use the chosen five cards' point total (Ace is 15) multiplied by the poker-hand multiplier, plus any effect modifiers. The five round scores are added together.
- Astral Body's flat +1,000 final-score bonus is never reduced. Its persistent penalty affects only hand score, becomes 70%/70%/60%/50% in rounds 1-4, and does not apply in round 5.
- One Royal Flush suit is selected randomly at the start of each game and shown beside the round counter. A 10, J, Q, K, A Royal Flush in that suit wins immediately and plays a six-second five-card reveal; the other suits score as normal Straight Flushes.
- Giant Killer lasts for its selection round and the following round, using x1.3/x1.45/x1.6/x1.75/x1.9 by score gap, then expires and cannot appear again for that player in the same game.
- Tomato King and Tomato Shooter multiply their count bonus by the lower of the played hand's natural multiplier and 2. Tempered Tomato remains capped by the lower of the natural multiplier and 1.
- Click another player's tomato icon to auto-fire at that target using attack speed. Click the same target to stop or another target to switch. Auto-fire stops when your own turn or settlement begins.
- A non-Giant player reduced to 0 total score by Giant deductions becomes Weakened next round and scores 75% of that round's complete hand score. Weakened lasts one round.
- When the active player selects a valid five-card play, the table shows that player a private estimated score preview before submission.
- Score Battle now reveals every player's submitted five-card play after scoring, highlights submitted community cards, and shows a short scoring breakdown animation.
- The final standings award persistent in-game coins: 8 for first place, 4 for second, 2 for third, and 1 for later places. Score Battle standings are also saved into each participating player's profile history.
- A waiting or finished Score Battle table closes automatically if no new game starts within 10 minutes.

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
