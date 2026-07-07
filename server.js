const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const scoreBattle = require("./score-battle-engine");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const CARD_DIR = path.join(PUBLIC_DIR, "cards");
const AVATAR_PRESET_DIR = path.join(PUBLIC_DIR, "avatars");
const DATA_DIR = path.join(ROOT, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const CONTROL_FILE = path.join(DATA_DIR, "server-control.json");
const APP_VERSION = "0.0.6";

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const MAX_SEATS = 8;
const STARTING_STACK = 100;
const SMALL_BLIND = 1;
const BIG_BLIND = 2;
const ACTION_SECONDS = 15;
const SESSION_COOKIE = "cardgame_point_session";
const REMEMBER_SESSION_DAYS = 30;
const USERNAME_BLOCKLIST = ["dwu", "diwu", "wudi"];
const MAX_HISTORY_ENTRIES = 50;
const MAX_AVATAR_DATA_URL_BYTES = 256 * 1024;
const MAX_JSON_BODY_BYTES = 512 * 1024;
const UNSTARTED_TABLE_TTL_MS = 5 * 60 * 1000;
const SCORE_TABLE_IDLE_TTL_MS = 10 * 60 * 1000;
const TABLE_PRUNE_INTERVAL_MS = 15 * 1000;
const TOMATO_LIMIT = 5;
const TOMATO_WINDOW_MS = 5 * 1000;
const TOMATO_COOLDOWN_MS = 5 * 1000;
const TOMATO_EVENT_TTL_MS = 8 * 1000;
const SCORE_BATTLE_MAX_SEATS = 6;
const SCORE_BATTLE_MIN_PLAYERS = 2;
const SCORE_BATTLE_ROUNDS = 5;
const SCORE_BATTLE_DISCARD_USES = 4;
const SCORE_BATTLE_PLAY_SECONDS = 120;
const SCORE_BATTLE_RESULT_SECONDS = 6;
const SCORE_BATTLE_ONCE_PER_GAME_EFFECTS = new Set([
  "tomato-king",
  "tomato-shooter",
  "change-straight",
  "protoceratops",
  "bread-butter",
  "bread-cheese",
  "bread-jam",
  "astral-body",
  "tempered-tomato",
  "returning-fundamentals",
  "draw-sword",
  "critical-hit",
  "infinity-edge",
  "giant-killer",
  "matthew-effect",
  "critical-switch-hand"
]);

const sessions = new Map();
const tables = new Map();
const scoreTables = new Map();
let nextTableNumber = 1;
let nextBotNumber = 1;
let nextScoreTableNumber = 1;
const shutdownToken = crypto.randomBytes(24).toString("hex");

const rankNames = {
  14: "Ace",
  13: "King",
  12: "Queen",
  11: "Jack",
  10: "Ten",
  9: "Nine",
  8: "Eight",
  7: "Seven",
  6: "Six",
  5: "Five",
  4: "Four",
  3: "Three",
  2: "Two"
};

const rankPluralNames = {
  14: "Aces",
  13: "Kings",
  12: "Queens",
  11: "Jacks",
  10: "Tens",
  9: "Nines",
  8: "Eights",
  7: "Sevens",
  6: "Sixes",
  5: "Fives",
  4: "Fours",
  3: "Threes",
  2: "Twos"
};

const handRankNames = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush"
];

ensureDataFiles();
let userDb = readUsers();
loadRememberedSessions();

const server = http.createServer((req, res) => {
  route(req, res).catch((error) => {
    handleRouteError(res, error);
  });
});

server.listen(PORT, HOST, () => {
  writeControlFile();
  console.log(`CardGame Point server running on http://localhost:${PORT}`);
  for (const ip of getLanAddresses()) {
    console.log(`LAN address: http://${ip}:${PORT}`);
  }
  console.log("Stop script: .\\stop-server.ps1");
});

setInterval(processActionTimeouts, 500);
setInterval(processScoreBattleTimeouts, 500);
setInterval(pruneStaleUnstartedTables, TABLE_PRUNE_INTERVAL_MS).unref();
setInterval(pruneStaleScoreTables, TABLE_PRUNE_INTERVAL_MS).unref();
setInterval(pruneExpiredSessions, 60 * 60 * 1000).unref();

process.on("exit", cleanupControlFile);
process.on("SIGINT", () => {
  cleanupControlFile();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanupControlFile();
  process.exit(0);
});

function handleRouteError(res, error) {
  if (error && Number.isInteger(error.status)) {
    sendJson(res, error.status, { error: error.message });
    return;
  }
  console.error(error);
  sendJson(res, 500, { error: "Server error" });
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const method = req.method || "GET";

  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url, method);
    return;
  }

  if (url.pathname.startsWith("/cards/")) {
    sendCardImage(res, decodeURIComponent(url.pathname.slice("/cards/".length)));
    return;
  }

  await serveStatic(req, res, url);
}

async function handleApi(req, res, url, method) {
  const user = getSessionUser(req);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (method === "GET" && url.pathname === "/api/me") {
    sendJson(res, 200, { user: publicUser(user) });
    return;
  }

  if (method === "POST" && url.pathname === "/api/register") {
    const body = await readJsonBody(req);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");

    if (!username) {
      sendJson(res, 400, { error: "Use a name with 2-20 letters, numbers, spaces, underscores, or hyphens." });
      return;
    }
    if (password.length < 4 || password.length > 72) {
      sendJson(res, 400, { error: "Use a password between 4 and 72 characters." });
      return;
    }
    if (containsBlockedUsernameTerm(username)) {
      sendJson(res, 400, { error: "That name contains a blocked word." });
      return;
    }
    if (userDb.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      sendJson(res, 409, { error: "That name is already registered." });
      return;
    }

    const created = createUser(username, password);
    createSession(res, created.id, Boolean(body.remember));
    sendJson(res, 201, { user: publicUser(created) });
    return;
  }

  if (method === "POST" && url.pathname === "/api/login") {
    const body = await readJsonBody(req);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");

    if (username && containsBlockedUsernameTerm(username)) {
      sendJson(res, 403, { error: "That account name is not allowed." });
      return;
    }

    const found = userDb.users.find((u) => u.username.toLowerCase() === String(username || "").toLowerCase());

    if (!found || !verifyPassword(password, found.passwordSalt, found.passwordHash)) {
      sendJson(res, 401, { error: "Name or password is incorrect." });
      return;
    }

    createSession(res, found.id, Boolean(body.remember));
    sendJson(res, 200, { user: publicUser(found) });
    return;
  }

  if (method === "POST" && url.pathname === "/api/logout") {
    const sid = getCookie(req, SESSION_COOKIE);
    if (sid) {
      sessions.delete(sid);
      writeSessions();
    }
    clearSession(res);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (method === "POST" && url.pathname === "/api/admin/shutdown") {
    if (req.headers["x-shutdown-token"] !== shutdownToken) {
      sendJson(res, 403, { error: "Invalid shutdown token." });
      return;
    }
    sendJson(res, 200, { ok: true, message: "Server is shutting down." });
    setTimeout(() => {
      cleanupControlFile();
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 1500).unref();
    }, 100).unref();
    return;
  }

  if (!user) {
    sendJson(res, 401, { error: "Please log in first." });
    return;
  }

  if (method === "GET" && url.pathname === "/api/profile") {
    sendJson(res, 200, { profile: profileForClient(user) });
    return;
  }

  if (method === "GET" && url.pathname === "/api/profile/avatar-presets") {
    sendJson(res, 200, { presets: avatarPresetsForClient() });
    return;
  }

  if (method === "POST" && url.pathname === "/api/profile/avatar") {
    const body = await readJsonBody(req);
    const avatar = String(body.avatar || "").trim();

    if (avatar && !isSupportedAvatar(avatar)) {
      sendJson(res, 400, { error: "Use PNG, JPEG, WebP, or GIF for the avatar." });
      return;
    }
    if (Buffer.byteLength(avatar, "utf8") > MAX_AVATAR_DATA_URL_BYTES) {
      sendJson(res, 413, { error: "Avatar image is too large." });
      return;
    }

    ensureUserProfile(user);
    user.avatar = avatar;
    writeUsers();
    sendJson(res, 200, { user: publicUser(user), profile: profileForClient(user) });
    return;
  }

  if (method === "POST" && url.pathname === "/api/profile/update-notice") {
    user.seenUpdateVersion = APP_VERSION;
    writeUsers();
    sendJson(res, 200, { user: publicUser(user), version: APP_VERSION });
    return;
  }

  pruneStaleUnstartedTables();
  pruneStaleScoreTables();

  if (method === "GET" && url.pathname === "/api/score-tables") {
    sendJson(res, 200, { tables: Array.from(scoreTables.values()).map((table) => scoreTableSummary(table, user)) });
    return;
  }

  if (method === "POST" && url.pathname === "/api/score-tables") {
    const body = await readJsonBody(req);
    const table = createScoreTable(body.name, user);
    joinScoreTable(table, user);
    sendJson(res, 201, { table: scoreTableView(table, user) });
    return;
  }

  if (pathParts[1] === "score-tables" && pathParts[2]) {
    const table = scoreTables.get(pathParts[2]);
    if (!table) {
      sendJson(res, 404, { error: "Score battle table not found." });
      return;
    }

    if (method === "GET" && pathParts.length === 3) {
      sendJson(res, 200, { table: scoreTableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "join") {
      joinScoreTable(table, user);
      sendJson(res, 200, { table: scoreTableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "leave") {
      const result = leaveScoreTable(table, user.id);
      if (result.deleted) {
        sendJson(res, 200, { left: true, deleted: true });
        return;
      }
      sendJson(res, 200, { left: true, table: scoreTableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "ready") {
      const body = await readJsonBody(req);
      const result = setScoreSeatReady(table, user.id, body.ready !== false);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { table: scoreTableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "start") {
      if (table.createdBy !== user.id) {
        sendJson(res, 403, { error: "Only the table host can start the score battle." });
        return;
      }
      const result = startScoreBattle(table);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { table: scoreTableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "effect") {
      const body = await readJsonBody(req);
      const result = chooseScoreEffect(table, user.id, body.effectId, body);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { table: scoreTableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "discard") {
      const body = await readJsonBody(req);
      const result = discardScoreCards(table, user.id, body.cardCodes);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { table: scoreTableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "play") {
      const body = await readJsonBody(req);
      const result = submitScorePlay(table, user.id, body.cardCodes);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { table: scoreTableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "preview") {
      const body = await readJsonBody(req);
      const result = previewScorePlay(table, user.id, body.cardCodes);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { preview: result.preview });
      return;
    }

    if (method === "POST" && pathParts[3] === "tomato") {
      const body = await readJsonBody(req);
      const result = recordTomatoThrow(table, user.id, body.targetSeatId);
      if (!result.ok) {
        sendJson(res, result.status || 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { table: scoreTableView(table, user), event: result.event });
      return;
    }
  }

  if (url.pathname === "/api/tables" || pathParts[1] === "tables") {
    sendJson(res, 410, { error: "Traditional table mode has been removed in version 0.0.6." });
    return;
  }

  if (method === "GET" && url.pathname === "/api/tables") {
    sendJson(res, 200, { tables: Array.from(tables.values()).map((table) => tableSummary(table, user)) });
    return;
  }

  if (method === "POST" && url.pathname === "/api/tables") {
    const body = await readJsonBody(req);
    const table = createTable(body.name, user);
    sitUser(table, user, false);
    sendJson(res, 201, { table: tableView(table, user) });
    return;
  }

  if (pathParts[1] === "tables" && pathParts[2]) {
    const table = tables.get(pathParts[2]);
    if (!table) {
      sendJson(res, 404, { error: "Table not found." });
      return;
    }

    if (method === "GET" && pathParts.length === 3) {
      sendJson(res, 200, { table: tableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "join") {
      const seat = table.seats.find((s) => s.userId === user.id);
      if (!seat) {
        sitUser(table, user, isLivePhase(table.phase));
      }
      sendJson(res, 200, { table: tableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "leave") {
      const result = leaveTable(table, user.id);
      if (result.deleted) {
        sendJson(res, 200, { left: true, deleted: true });
        return;
      }
      processBots(table);
      sendJson(res, 200, { left: true, table: tableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "ready") {
      const body = await readJsonBody(req);
      const result = setSeatReady(table, user.id, body.ready !== false);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { table: tableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "rebuy") {
      const result = rebuySeat(table, user.id);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { table: tableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "add-bot") {
      if (table.createdBy !== user.id) {
        sendJson(res, 403, { error: "Only the table host can add computer players." });
        return;
      }
      if (!["waiting", "showdown", "finished"].includes(table.phase)) {
        sendJson(res, 409, { error: "Computer players can be added before a hand starts." });
        return;
      }
      if (table.seats.length >= MAX_SEATS) {
        sendJson(res, 409, { error: "The table is full." });
        return;
      }
      addBot(table);
      sendJson(res, 200, { table: tableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "start") {
      if (table.createdBy !== user.id) {
        sendJson(res, 403, { error: "Only the table host can start the hand." });
        return;
      }
      const result = startHand(table);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      processBots(table);
      sendJson(res, 200, { table: tableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "action") {
      const body = await readJsonBody(req);
      const seat = table.seats.find((s) => s.userId === user.id);
      if (!seat || table.actionSeatId !== seat.seatId) {
        sendJson(res, 409, { error: "It is not your turn." });
        return;
      }
      const result = applyPlayerAction(table, seat, body.type, body.amount);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error });
        return;
      }
      processBots(table);
      sendJson(res, 200, { table: tableView(table, user) });
      return;
    }

    if (method === "POST" && pathParts[3] === "tomato") {
      const body = await readJsonBody(req);
      const result = recordTomatoThrow(table, user.id, body.targetSeatId);
      if (!result.ok) {
        sendJson(res, result.status || 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { table: tableView(table, user), event: result.event });
      return;
    }
  }

  sendJson(res, 404, { error: "Not found" });
}

function createUser(username, password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const user = {
    id: crypto.randomUUID(),
    username,
    passwordSalt: salt,
    passwordHash,
    createdAt: new Date().toISOString(),
    avatar: "",
    coins: 0,
    history: [],
    stats: blankUserStats(),
    seenUpdateVersion: ""
  };
  userDb.users.push(user);
  writeUsers();
  return user;
}

function verifyPassword(password, salt, expectedHash) {
  try {
    const actual = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHash, "hex");
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function createSession(res, userId, remember = false) {
  const sid = crypto.randomBytes(24).toString("hex");
  const now = Date.now();
  const maxAgeSeconds = REMEMBER_SESSION_DAYS * 24 * 60 * 60;
  const session = {
    userId,
    createdAt: now,
    remember: Boolean(remember),
    expiresAt: remember ? now + maxAgeSeconds * 1000 : null
  };
  sessions.set(sid, session);

  const maxAge = remember ? `; Max-Age=${maxAgeSeconds}` : "";
  setCookie(res, `${SESSION_COOKIE}=${sid}; HttpOnly; SameSite=Lax; Path=/${maxAge}`);
  if (remember) writeSessions();
}

function clearSession(res) {
  setCookie(res, `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function getSessionUser(req) {
  const sid = getCookie(req, SESSION_COOKIE);
  const session = sid ? sessions.get(sid) : null;
  if (!session) return null;
  if (session.expiresAt && session.expiresAt <= Date.now()) {
    sessions.delete(sid);
    writeSessions();
    return null;
  }
  const user = userDb.users.find((u) => u.id === session.userId) || null;
  if (!user) {
    sessions.delete(sid);
    writeSessions();
  }
  return user;
}

function loadRememberedSessions() {
  try {
    const parsed = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"));
    const now = Date.now();
    for (const item of Array.isArray(parsed.sessions) ? parsed.sessions : []) {
      if (!item.sid || !item.userId || !item.expiresAt || item.expiresAt <= now) continue;
      sessions.set(item.sid, {
        userId: item.userId,
        createdAt: Number(item.createdAt) || now,
        remember: true,
        expiresAt: Number(item.expiresAt)
      });
    }
  } catch {
    // Remembered sessions are optional; a missing or corrupt file just means users log in again.
  }
}

function writeSessions() {
  const now = Date.now();
  const remembered = Array.from(sessions.entries())
    .filter(([, session]) => session.remember && session.expiresAt && session.expiresAt > now)
    .map(([sid, session]) => ({
      sid,
      userId: session.userId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt
    }));
  fs.writeFileSync(`${SESSIONS_FILE}.tmp`, JSON.stringify({ sessions: remembered }, null, 2));
  fs.renameSync(`${SESSIONS_FILE}.tmp`, SESSIONS_FILE);
}

function pruneExpiredSessions() {
  const now = Date.now();
  let changed = false;
  for (const [sid, session] of sessions.entries()) {
    if (session.expiresAt && session.expiresAt <= now) {
      sessions.delete(sid);
      changed = true;
    }
  }
  if (changed) writeSessions();
}

function publicUser(user) {
  if (!user) return null;
  ensureUserProfile(user);
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar || "",
    coins: Number(user.coins) || 0,
    seenUpdateVersion: user.seenUpdateVersion || ""
  };
}

function profileForClient(user) {
  ensureUserProfile(user);
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar || "",
    coins: Number(user.coins) || 0,
    seenUpdateVersion: user.seenUpdateVersion || "",
    stats: {
      sessionsPlayed: Number(user.stats.sessionsPlayed) || 0,
      bestPoints: Number(user.stats.bestPoints) || 0,
      bestStars: Number(user.stats.bestStars) || 0,
      lastPoints: Number(user.stats.lastPoints) || 0,
      lastStars: Number(user.stats.lastStars) || 0
    },
    history: user.history.slice(0, MAX_HISTORY_ENTRIES).map((entry) => ({
      id: entry.id,
      type: entry.type || "holdem",
      tableId: entry.tableId,
      tableName: entry.tableName,
      handNumber: Number(entry.handNumber) || 0,
      gameNumber: Number(entry.gameNumber) || 0,
      leftAt: entry.leftAt,
      points: Number(entry.points) || 0,
      stars: Number(entry.stars) || 0,
      rank: Number(entry.rank) || 0,
      totalScore: Number(entry.totalScore) || 0,
      standings: Array.isArray(entry.standings) ? entry.standings.map((standing) => ({
        rank: Number(standing.rank) || 0,
        displayName: String(standing.displayName || ""),
        totalScore: Number(standing.totalScore) || 0
      })) : []
    }))
  };
}

function createTable(rawName, user) {
  const id = `table-${crypto.randomBytes(4).toString("hex")}`;
  const table = {
    id,
    number: nextTableNumber++,
    name: cleanTableName(rawName) || `Table ${nextTableNumber - 1}`,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    seats: [],
    phase: "waiting",
    handNumber: 0,
    buttonSeatId: null,
    actionSeatId: null,
    actionDeadline: null,
    deck: [],
    community: [],
    currentBet: 0,
    minRaise: BIG_BLIND,
    showAll: false,
    lastWinnerSeatIds: [],
    lastVictoryHandNumber: 0,
    lastSeatDeltas: [],
    tomatoEvents: [],
    tomatoBuckets: Object.create(null),
    results: [],
    messages: [`${user.username} opened the table.`]
  };
  tables.set(id, table);
  return table;
}

function sitUser(table, user, sittingOut) {
  if (table.seats.length >= MAX_SEATS) {
    throwHttp(409, "The table is full. You can still watch after opening the table link.");
  }
  const seat = blankSeat({
    kind: "human",
    userId: user.id,
    displayName: user.username,
    avatar: user.avatar || "",
    sittingOut: Boolean(sittingOut)
  });
  table.seats.push(seat);
  table.messages.unshift(`${user.username} joined ${sittingOut ? "and is waiting for the next hand" : "the table"}.`);
  return seat;
}

function addBot(table) {
  const name = `Bot ${nextBotNumber++}`;
  const seat = blankSeat({
    kind: "bot",
    userId: null,
    displayName: name,
    sittingOut: false,
    ready: true
  });
  table.seats.push(seat);
  table.messages.unshift(`${name} took an empty seat.`);
  return seat;
}

function blankSeat(options) {
  return {
    seatId: crypto.randomBytes(8).toString("hex"),
    kind: options.kind,
    userId: options.userId,
    displayName: options.displayName,
    stack: STARTING_STACK,
    eliminated: false,
    sittingOut: Boolean(options.sittingOut),
    ready: Boolean(options.ready),
    left: false,
    inHand: false,
    folded: false,
    allIn: false,
    hole: [],
    betThisRound: 0,
    handContribution: 0,
    hasActed: false,
    bestHand: null,
    winCount: 0,
    avatar: options.avatar || "",
    historyRecorded: false,
    recordableSettledHands: 0,
    handStartStack: STARTING_STACK,
    lastDelta: 0,
    lastWinAmount: 0,
    lastResultHandNumber: 0
  };
}

function setSeatReady(table, userId, ready) {
  const seat = table.seats.find((s) => s.userId === userId && !s.left);
  if (!seat) return { ok: false, error: "You are not seated at this table." };
  if (seat.eliminated || seat.stack <= 0) return { ok: false, error: "Eliminated players can watch but cannot ready up." };
  if (seat.inHand && isLivePhase(table.phase)) return { ok: false, error: "You are already playing this hand." };
  seat.ready = Boolean(ready);
  seat.sittingOut = isLivePhase(table.phase) && !seat.inHand;
  table.messages.unshift(`${seat.displayName} is ${seat.ready ? "ready" : "not ready"}.`);
  return { ok: true };
}

function rebuySeat(table, userId) {
  const seat = table.seats.find((s) => s.userId === userId && !s.left);
  if (!seat) return { ok: false, error: "You are not seated at this table." };
  if (!seat.eliminated && seat.stack > 0) return { ok: false, error: "You still have points." };

  seat.stack = STARTING_STACK;
  seat.eliminated = false;
  seat.sittingOut = true;
  seat.ready = false;
  seat.inHand = false;
  seat.folded = false;
  seat.allIn = false;
  seat.hole = [];
  seat.betThisRound = 0;
  seat.handContribution = 0;
  seat.hasActed = false;
  seat.bestHand = null;
  seat.handStartStack = STARTING_STACK;
  seat.lastDelta = 0;
  seat.lastWinAmount = 0;
  seat.lastResultHandNumber = 0;
  table.messages.unshift(`${seat.displayName} reloaded to ${STARTING_STACK} points and can join the next hand.`);
  return { ok: true };
}

function leaveTable(table, userId) {
  const index = table.seats.findIndex((s) => s.userId === userId && !s.left);
  if (index < 0) return { ok: true };
  const seat = table.seats[index];
  const name = seat.displayName;
  recordPlayerExitStats(table, seat);
  seat.avatar = seat.avatar || getUserAvatar(userId);

  if (seat.inHand && isLivePhase(table.phase)) {
    seat.left = true;
    seat.userId = null;
    seat.ready = false;
    seat.sittingOut = true;
    seat.displayName = `${name} (left)`;
    if (!seat.folded) {
      seat.folded = true;
      seat.hasActed = true;
      table.messages.unshift(`${name} left the table and folded.`);
      if (table.actionSeatId === seat.seatId) {
        afterAction(table, seat);
      } else if (onlyOnePlayerCanWin(table)) {
        settleByFold(table);
      }
    } else {
      table.messages.unshift(`${name} left the table.`);
    }
  } else {
    table.seats.splice(index, 1);
    table.messages.unshift(`${name} left the table.`);
  }

  transferHostIfNeeded(table);
  if (!table.seats.some((s) => s.kind === "human" && s.userId && !s.left)) {
    tables.delete(table.id);
    return { ok: true, deleted: true };
  }
  return { ok: true, deleted: false };
}

function transferHostIfNeeded(table) {
  if (table.seats.some((s) => s.userId === table.createdBy && !s.left)) return;
  const nextHost = table.seats.find((s) => s.kind === "human" && s.userId && !s.left);
  if (nextHost) {
    table.createdBy = nextHost.userId;
    table.messages.unshift(`${nextHost.displayName} is now the table host.`);
  }
}

function startHand(table) {
  if (!["waiting", "showdown", "finished"].includes(table.phase)) {
    return { ok: false, error: "A hand is already running." };
  }

  pruneEliminatedBots(table);

  if (!table.seats.some((seat) => seat.kind === "human" && seat.userId && !seat.left && !seat.eliminated && seat.stack > 0)) {
    table.phase = "finished";
    table.results = ["No human players have points left at this table."];
    return { ok: false, error: "No human players can continue." };
  }

  if (!table.seats.some((seat) => seat.kind === "human" && seat.ready && !seat.left && !seat.eliminated && seat.stack > 0)) {
    return { ok: false, error: "At least one human player must be ready." };
  }

  while (eligibleSeats(table).length < 3 && table.seats.length < MAX_SEATS) {
    addBot(table);
  }

  const active = eligibleSeats(table);
  if (active.length < 3) {
    return { ok: false, error: "Need 3 ready seats. Free a seat or add/ready more players." };
  }

  table.handNumber += 1;
  table.phase = "preflop";
  table.deck = shuffle(createDeck());
  table.community = [];
  table.currentBet = 0;
  table.minRaise = BIG_BLIND;
  setActionSeat(table, null);
  table.showAll = false;
  table.lastWinnerSeatIds = [];
  table.lastVictoryHandNumber = 0;
  table.lastSeatDeltas = [];
  table.results = [];

  for (const seat of table.seats) {
    seat.inHand = active.includes(seat);
    seat.sittingOut = !seat.inHand && !seat.eliminated && !seat.left;
    seat.folded = false;
    seat.allIn = false;
    seat.hole = [];
    seat.betThisRound = 0;
    seat.handContribution = 0;
    seat.hasActed = false;
    seat.bestHand = null;
    seat.handStartStack = seat.stack;
    seat.lastDelta = 0;
    seat.lastWinAmount = 0;
    seat.lastResultHandNumber = 0;
    if (seat.inHand) {
      seat.hole = [table.deck.pop(), table.deck.pop()];
    }
  }

  table.buttonSeatId = chooseNextButton(table, active);
  const smallBlindSeat = nextActiveSeatAfter(table, table.buttonSeatId);
  const bigBlindSeat = nextActiveSeatAfter(table, smallBlindSeat.seatId);

  placeChips(smallBlindSeat, SMALL_BLIND);
  placeChips(bigBlindSeat, BIG_BLIND);
  table.currentBet = Math.max(smallBlindSeat.betThisRound, bigBlindSeat.betThisRound);
  setActionSeat(table, nextSeatNeedingAction(table, bigBlindSeat.seatId)?.seatId || null);
  table.messages.unshift(`Hand ${table.handNumber} started. Blinds are ${SMALL_BLIND}/${BIG_BLIND}.`);

  if (onlyOnePlayerCanWin(table)) {
    settleByFold(table);
  } else if (isBettingRoundComplete(table)) {
    advanceStreet(table);
  }
  return { ok: true };
}

function applyPlayerAction(table, seat, type, amount) {
  if (!isLivePhase(table.phase)) return { ok: false, error: "No betting round is active." };
  if (!seat || seat.seatId !== table.actionSeatId) return { ok: false, error: "It is not this seat's turn." };
  if (seat.folded || seat.allIn || !seat.inHand) return { ok: false, error: "This seat cannot act." };

  const toCall = Math.max(0, table.currentBet - seat.betThisRound);
  const cleanType = String(type || "").toLowerCase();

  if (cleanType === "fold") {
    seat.folded = true;
    seat.hasActed = true;
    table.messages.unshift(`${seat.displayName} folded.`);
    afterAction(table, seat);
    return { ok: true };
  }

  if (cleanType === "check") {
    if (toCall !== 0) return { ok: false, error: "You need to call, raise, or fold." };
    seat.hasActed = true;
    table.messages.unshift(`${seat.displayName} checked.`);
    afterAction(table, seat);
    return { ok: true };
  }

  if (cleanType === "call") {
    if (toCall === 0) return { ok: false, error: "There is nothing to call." };
    placeChips(seat, toCall);
    seat.hasActed = true;
    table.messages.unshift(`${seat.displayName} called ${Math.min(toCall, seat.handContribution)}.`);
    afterAction(table, seat);
    return { ok: true };
  }

  if (cleanType === "allin") {
    if (seat.stack <= 0) return { ok: false, error: "No points left to wager." };
    return raiseTo(table, seat, seat.betThisRound + seat.stack, true);
  }

  if (cleanType === "raise" || cleanType === "bet") {
    const target = Number(amount);
    if (!Number.isInteger(target) || target <= seat.betThisRound) {
      return { ok: false, error: "Enter a positive whole-number target bet." };
    }
    return raiseTo(table, seat, target, false);
  }

  return { ok: false, error: "Unknown action." };
}

function raiseTo(table, seat, targetBet, isAllInButton) {
  const maxTarget = seat.betThisRound + seat.stack;
  if (targetBet > maxTarget) {
    return { ok: false, error: `You can wager at most ${maxTarget} this round.` };
  }

  const oldCurrent = table.currentBet;
  const toCall = Math.max(0, oldCurrent - seat.betThisRound);
  const isIncreasingBet = targetBet > oldCurrent;
  const requiredOpen = table.currentBet === 0 ? 1 : table.currentBet + 1;
  const isFullAllIn = targetBet === maxTarget;

  if (!isIncreasingBet) {
    if (toCall === 0) return { ok: false, error: "Check instead." };
    placeChips(seat, toCall);
    seat.hasActed = true;
    table.messages.unshift(`${seat.displayName} called.`);
    afterAction(table, seat);
    return { ok: true };
  }

  if (targetBet < requiredOpen && !(isFullAllIn || isAllInButton)) {
    return { ok: false, error: `Minimum ${table.currentBet === 0 ? "bet" : "raise"} is to ${requiredOpen}.` };
  }

  const delta = targetBet - seat.betThisRound;
  placeChips(seat, delta);
  const actualRaise = targetBet - oldCurrent;
  table.currentBet = Math.max(table.currentBet, seat.betThisRound);
  if (actualRaise >= table.minRaise) {
    table.minRaise = actualRaise;
  }

  for (const other of table.seats) {
    if (other.inHand && !other.folded && !other.allIn && other.seatId !== seat.seatId && other.betThisRound < table.currentBet) {
      other.hasActed = false;
    }
  }
  seat.hasActed = true;
  table.messages.unshift(`${seat.displayName} ${oldCurrent === 0 ? "bet" : "raised to"} ${seat.betThisRound}.`);
  afterAction(table, seat);
  return { ok: true };
}

function afterAction(table, actingSeat) {
  if (onlyOnePlayerCanWin(table)) {
    settleByFold(table);
    return;
  }

  if (isBettingRoundComplete(table)) {
    advanceStreet(table);
    return;
  }

  setActionSeat(table, nextSeatNeedingAction(table, actingSeat.seatId)?.seatId || null);
}

function processBots(table) {
  let guard = 0;
  while (guard++ < 100 && isLivePhase(table.phase)) {
    const seat = table.seats.find((s) => s.seatId === table.actionSeatId);
    if (!seat || seat.kind !== "bot") break;
    const action = chooseBotAction(table, seat);
    applyPlayerAction(table, seat, action.type, action.amount);
  }
}

function processActionTimeouts() {
  const now = Date.now();
  for (const table of tables.values()) {
    if (!isLivePhase(table.phase)) continue;
    processBots(table);
    const seat = table.seats.find((s) => s.seatId === table.actionSeatId);
    if (!seat || seat.kind !== "human" || seat.left) continue;
    if (table.actionDeadline && now >= table.actionDeadline) {
      applyTimeoutAction(table, seat);
      processBots(table);
    }
  }
}

function applyTimeoutAction(table, seat) {
  const toCall = Math.max(0, table.currentBet - seat.betThisRound);
  if (toCall === 0) {
    seat.hasActed = true;
    table.messages.unshift(`${seat.displayName} timed out and checked.`);
    afterAction(table, seat);
    return;
  }

  const paid = placeChips(seat, toCall);
  seat.hasActed = true;
  table.messages.unshift(`${seat.displayName} timed out and automatically called ${paid}.`);
  afterAction(table, seat);
}

function setActionSeat(table, seatId) {
  table.actionSeatId = seatId || null;
  table.actionDeadline = null;
  if (!table.actionSeatId || !isLivePhase(table.phase)) return;
  const seat = table.seats.find((s) => s.seatId === table.actionSeatId);
  if (seat && seat.kind === "human" && !seat.left) {
    table.actionDeadline = Date.now() + ACTION_SECONDS * 1000;
  }
}

function chooseBotAction(table, seat) {
  const toCall = Math.max(0, table.currentBet - seat.betThisRound);
  if (toCall > 0) {
    if (toCall >= seat.stack) {
      return Math.random() < 0.75 ? { type: "call" } : { type: "fold" };
    }
    if (toCall > BIG_BLIND * 5 && Math.random() < 0.55) return { type: "fold" };
    if (toCall > BIG_BLIND * 3 && Math.random() < 0.25) return { type: "fold" };
    if (seat.stack > toCall + table.minRaise && Math.random() < 0.08) {
      return { type: "raise", amount: Math.min(seat.betThisRound + seat.stack, table.currentBet + table.minRaise) };
    }
    return { type: "call" };
  }

  if (seat.stack > BIG_BLIND && Math.random() < 0.18) {
    const target = Math.min(seat.stack + seat.betThisRound, BIG_BLIND * (1 + Math.floor(Math.random() * 3)));
    if (target > seat.betThisRound) return { type: "bet", amount: target };
  }
  return { type: "check" };
}

function advanceStreet(table) {
  const canActCount = table.seats.filter((s) => s.inHand && !s.folded && !s.allIn).length;
  if (canActCount <= 1) {
    dealRemainingCommunity(table);
    settleShowdown(table);
    return;
  }

  for (const seat of table.seats) {
    seat.betThisRound = 0;
    seat.hasActed = false;
  }
  table.currentBet = 0;
  table.minRaise = BIG_BLIND;

  if (table.phase === "preflop") {
    table.community.push(table.deck.pop(), table.deck.pop(), table.deck.pop());
    table.phase = "flop";
  } else if (table.phase === "flop") {
    table.community.push(table.deck.pop());
    table.phase = "turn";
  } else if (table.phase === "turn") {
    table.community.push(table.deck.pop());
    table.phase = "river";
  } else if (table.phase === "river") {
    settleShowdown(table);
    return;
  }

  table.messages.unshift(`${capitalize(table.phase)} dealt.`);
  setActionSeat(table, firstPostflopActionSeat(table)?.seatId || null);
  if (!table.actionSeatId || isBettingRoundComplete(table)) {
    advanceStreet(table);
  }
}

function settleByFold(table) {
  const winner = table.seats.find((s) => s.inHand && !s.folded);
  const pot = totalPot(table);
  if (winner) winner.stack += pot;
  const payouts = new Map();
  if (winner) payouts.set(winner.seatId, pot);
  recordWinners(table, winner ? [winner] : []);
  table.phase = "showdown";
  setActionSeat(table, null);
  table.showAll = true;
  table.results = winner ? [`${winner.displayName} wins ${pot} points after everyone else folded.`] : ["The hand ended without a winner."];
  markSeatDeltas(table, payouts);
  markRecordableSettledHands(table);
  markEliminations(table);
  pruneLeftSeats(table);
}

function settleShowdown(table) {
  dealRemainingCommunity(table);
  const contenders = table.seats.filter((s) => s.inHand && !s.folded);
  for (const seat of contenders) {
    seat.bestHand = evaluateSeven(seat.hole.concat(table.community));
  }

  const pots = buildSidePots(table);
  const payouts = new Map();
  const lines = [];

  for (const pot of pots) {
    const eligible = pot.eligible.filter((seat) => contenders.includes(seat));
    if (eligible.length === 0) continue;
    const best = eligible.reduce((winner, seat) => compareHands(seat.bestHand, winner.bestHand) > 0 ? seat : winner, eligible[0]);
    const winners = eligible.filter((seat) => compareHands(seat.bestHand, best.bestHand) === 0);
    const share = Math.floor(pot.amount / winners.length);
    let remainder = pot.amount % winners.length;
    const orderedWinners = winners.slice().sort((a, b) => seatDistanceFromButton(table, a) - seatDistanceFromButton(table, b));
    for (const winner of orderedWinners) {
      const extra = remainder > 0 ? 1 : 0;
      remainder -= extra;
      const won = share + extra;
      winner.stack += won;
      payouts.set(winner.seatId, (payouts.get(winner.seatId) || 0) + won);
    }
  }

  for (const [seatId, won] of payouts) {
    const seat = table.seats.find((s) => s.seatId === seatId);
    lines.push(`${seat.displayName} wins ${won} with ${seat.bestHand.name}.`);
  }
  if (lines.length === 0) lines.push("No chips were awarded.");
  recordWinners(table, Array.from(payouts.keys()).map((seatId) => table.seats.find((seat) => seat.seatId === seatId)).filter(Boolean));

  table.phase = "showdown";
  setActionSeat(table, null);
  table.showAll = true;
  table.results = lines;
  markSeatDeltas(table, payouts);
  markRecordableSettledHands(table);
  markEliminations(table);
  pruneLeftSeats(table);
}

function markSeatDeltas(table, payouts = new Map()) {
  table.lastSeatDeltas = [];
  for (const seat of table.seats) {
    if (!seat.inHand) continue;
    const startStack = Number.isFinite(Number(seat.handStartStack)) ? Number(seat.handStartStack) : STARTING_STACK;
    const delta = (Number(seat.stack) || 0) - startStack;
    const winAmount = Number(payouts.get(seat.seatId)) || 0;
    seat.lastDelta = delta;
    seat.lastWinAmount = winAmount;
    seat.lastResultHandNumber = table.handNumber;
    table.lastSeatDeltas.push({
      seatId: seat.seatId,
      delta,
      winAmount
    });
  }
}

function markRecordableSettledHands(table) {
  if (!Array.isArray(table.results) || table.results.length === 0) return;
  for (const seat of table.seats) {
    if (seat.kind !== "human" || !seat.userId || !seat.inHand || seat.left) continue;
    if ((Number(seat.handContribution) || 0) <= 0) continue;
    seat.recordableSettledHands = (Number(seat.recordableSettledHands) || 0) + 1;
  }
}

function recordWinners(table, winners) {
  const uniqueWinners = Array.from(new Set(winners.filter(Boolean)));
  table.lastWinnerSeatIds = uniqueWinners.map((seat) => seat.seatId);
  table.lastVictoryHandNumber = uniqueWinners.length ? table.handNumber : 0;
  for (const seat of uniqueWinners) {
    seat.winCount = (Number(seat.winCount) || 0) + 1;
  }
}

function buildSidePots(table) {
  const contributors = table.seats.filter((s) => s.inHand && s.handContribution > 0);
  const levels = Array.from(new Set(contributors.map((s) => s.handContribution))).sort((a, b) => a - b);
  const pots = [];
  let previous = 0;

  for (const level of levels) {
    const involved = contributors.filter((s) => s.handContribution >= level);
    const amount = (level - previous) * involved.length;
    if (amount > 0) {
      pots.push({
        amount,
        eligible: involved.filter((s) => !s.folded)
      });
    }
    previous = level;
  }
  return pots;
}

function markEliminations(table) {
  for (const seat of table.seats) {
    if (seat.inHand && seat.stack <= 0) {
      seat.stack = 0;
      seat.eliminated = true;
      seat.sittingOut = true;
      table.messages.unshift(`${seat.displayName} is out of points and is watching.`);
    }
  }
  if (!table.seats.some((seat) => seat.kind === "human" && seat.userId && !seat.left && !seat.eliminated && seat.stack > 0)) {
    table.phase = "finished";
    table.results.unshift("All human players are out of points at this table.");
  }
}

function placeChips(seat, requested) {
  const wager = Math.max(0, Math.min(Number(requested) || 0, seat.stack));
  seat.stack -= wager;
  seat.betThisRound += wager;
  seat.handContribution += wager;
  if (seat.stack === 0) seat.allIn = true;
  return wager;
}

function eligibleSeats(table) {
  return table.seats.filter((seat) => {
    if (seat.left || seat.eliminated || seat.stack <= 0) return false;
    return seat.kind === "bot" || seat.ready;
  });
}

function pruneEliminatedBots(table) {
  table.seats = table.seats.filter((seat) => seat.kind !== "bot" || (!seat.eliminated && seat.stack > 0));
}

function pruneLeftSeats(table) {
  table.seats = table.seats.filter((seat) => !seat.left);
  transferHostIfNeeded(table);
}

function pruneStaleUnstartedTables(now = Date.now()) {
  for (const [id, table] of tables.entries()) {
    if (table.handNumber > 0) continue;
    const createdAt = Date.parse(table.createdAt);
    if (!Number.isFinite(createdAt)) continue;
    if (now - createdAt >= UNSTARTED_TABLE_TTL_MS) {
      tables.delete(id);
    }
  }
}

function chooseNextButton(table, active) {
  if (!table.buttonSeatId) {
    return active[Math.floor(Math.random() * active.length)].seatId;
  }
  return nextActiveSeatAfter(table, table.buttonSeatId)?.seatId || active[0].seatId;
}

function nextActiveSeatAfter(table, seatId) {
  return nextSeatMatchingAfter(table, seatId, (seat) => seat.inHand);
}

function firstPostflopActionSeat(table) {
  return nextSeatMatchingAfter(table, table.buttonSeatId, (seat) => seat.inHand && !seat.folded && !seat.allIn);
}

function nextSeatNeedingAction(table, afterSeatId) {
  return nextSeatMatchingAfter(table, afterSeatId, (seat) => {
    return seat.inHand && !seat.folded && !seat.allIn && (!seat.hasActed || seat.betThisRound < table.currentBet);
  });
}

function nextSeatMatchingAfter(table, afterSeatId, predicate) {
  if (table.seats.length === 0) return null;
  const foundIndex = table.seats.findIndex((s) => s.seatId === afterSeatId);
  const startIndex = foundIndex >= 0 ? foundIndex : table.seats.length - 1;
  for (let offset = 1; offset <= table.seats.length; offset += 1) {
    const seat = table.seats[(startIndex + offset) % table.seats.length];
    if (predicate(seat)) return seat;
  }
  return null;
}

function seatDistanceFromButton(table, seat) {
  const buttonIndex = table.seats.findIndex((s) => s.seatId === table.buttonSeatId);
  const seatIndex = table.seats.findIndex((s) => s.seatId === seat.seatId);
  if (buttonIndex < 0 || seatIndex < 0) return seatIndex;
  return (seatIndex - buttonIndex + table.seats.length) % table.seats.length;
}

function onlyOnePlayerCanWin(table) {
  return table.seats.filter((s) => s.inHand && !s.folded).length <= 1;
}

function isBettingRoundComplete(table) {
  const actors = table.seats.filter((s) => s.inHand && !s.folded && !s.allIn);
  if (actors.length === 0) return true;
  return actors.every((seat) => seat.hasActed && seat.betThisRound === table.currentBet);
}

function isLivePhase(phase) {
  return ["preflop", "flop", "turn", "river"].includes(phase);
}

function dealRemainingCommunity(table) {
  while (table.community.length < 5) {
    table.community.push(table.deck.pop());
  }
}

function totalPot(table) {
  return table.seats.reduce((sum, seat) => sum + seat.handContribution, 0);
}

function createDeck() {
  const suits = ["S", "H", "D", "C"];
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ code: `${rank}${suit}`, rank: rankValue(rank), suit });
    }
  }
  return deck;
}

function shuffle(cards) {
  const deck = cards.slice();
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function rankValue(rank) {
  if (rank === "A") return 14;
  if (rank === "K") return 13;
  if (rank === "Q") return 12;
  if (rank === "J") return 11;
  if (rank === "T") return 10;
  return Number(rank);
}

function evaluateSeven(cards) {
  const byRank = new Map();
  const bySuit = new Map();
  for (const card of cards) {
    if (!byRank.has(card.rank)) byRank.set(card.rank, []);
    byRank.get(card.rank).push(card);
    if (!bySuit.has(card.suit)) bySuit.set(card.suit, []);
    bySuit.get(card.suit).push(card);
  }

  const uniqueRanks = Array.from(byRank.keys()).sort((a, b) => b - a);
  const flushCards = Array.from(bySuit.values()).find((sameSuit) => sameSuit.length >= 5);
  if (flushCards) {
    const straightFlushHigh = findStraightHigh(flushCards.map((card) => card.rank));
    if (straightFlushHigh) return hand(8, [straightFlushHigh]);
  }

  const groups = uniqueRanks
    .map((rank) => ({ rank, count: byRank.get(rank).length }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);

  const four = groups.find((group) => group.count === 4);
  if (four) {
    return hand(7, [four.rank, ...uniqueRanks.filter((rank) => rank !== four.rank).slice(0, 1)]);
  }

  const trips = groups.filter((group) => group.count === 3).map((group) => group.rank).sort((a, b) => b - a);
  const pairs = groups.filter((group) => group.count === 2).map((group) => group.rank).sort((a, b) => b - a);
  if (trips.length > 0 && (pairs.length > 0 || trips.length > 1)) {
    const trip = trips[0];
    const pair = trips.length > 1 ? trips[1] : pairs[0];
    return hand(6, [trip, pair]);
  }

  if (flushCards) {
    return hand(5, flushCards.map((card) => card.rank).sort((a, b) => b - a).slice(0, 5));
  }

  const straightHigh = findStraightHigh(uniqueRanks);
  if (straightHigh) return hand(4, [straightHigh]);

  if (trips.length > 0) {
    const kickers = uniqueRanks.filter((rank) => rank !== trips[0]).slice(0, 2);
    return hand(3, [trips[0], ...kickers]);
  }

  if (pairs.length >= 2) {
    const topPairs = pairs.slice(0, 2);
    const kicker = uniqueRanks.filter((rank) => !topPairs.includes(rank))[0];
    return hand(2, [...topPairs, kicker]);
  }

  if (pairs.length === 1) {
    const kicker = uniqueRanks.filter((rank) => rank !== pairs[0]).slice(0, 3);
    return hand(1, [pairs[0], ...kicker]);
  }

  return hand(0, uniqueRanks.slice(0, 5));
}

function hand(rank, tiebreakers) {
  return {
    rank,
    tiebreakers,
    name: describeHand(rank, tiebreakers)
  };
}

function describeHand(rank, tiebreakers) {
  const base = handRankNames[rank];
  if (rank === 8 || rank === 4) return `${rankNames[tiebreakers[0]]}-high ${base}`;
  if (rank === 7) return `${base}, ${rankPluralNames[tiebreakers[0]]}`;
  if (rank === 6) return `${base}, ${rankPluralNames[tiebreakers[0]]} over ${rankPluralNames[tiebreakers[1]]}`;
  if (rank === 3) return `${base}, ${rankPluralNames[tiebreakers[0]]}`;
  if (rank === 2) return `${base}, ${rankPluralNames[tiebreakers[0]]} and ${rankPluralNames[tiebreakers[1]]}`;
  if (rank === 1) return `${base}, ${rankPluralNames[tiebreakers[0]]}`;
  return `${base}, ${rankNames[tiebreakers[0]]}-high`;
}

function compareHands(a, b) {
  if (a.rank !== b.rank) return a.rank - b.rank;
  const length = Math.max(a.tiebreakers.length, b.tiebreakers.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (a.tiebreakers[i] || 0) - (b.tiebreakers[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function findStraightHigh(ranks) {
  const values = Array.from(new Set(ranks)).sort((a, b) => b - a);
  if (values.includes(14)) values.push(1);
  let run = 1;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i - 1] - values[i] === 1) {
      run += 1;
      if (run >= 5) return values[i - 4];
    } else if (values[i - 1] !== values[i]) {
      run = 1;
    }
  }
  return null;
}

function createScoreTable(rawName, user) {
  const id = `score-${crypto.randomBytes(4).toString("hex")}`;
  const number = nextScoreTableNumber++;
  const table = {
    id,
    number,
    name: cleanTableName(rawName) || `Score Battle ${number}`,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    seats: [],
    phase: "waiting",
    round: 0,
    gameNumber: 0,
    community: [],
    phaseDeadline: null,
    rosterLocked: false,
    standings: [],
    lastWinnerSeatIds: [],
    lastVictoryGameNumber: 0,
    currentRoundLeaderSeatIds: [],
    previousRoundLeaderSeatIds: [],
    turnOrderSeatIds: [],
    currentTurnSeatId: null,
    turnStartedAt: null,
    roundEffects: [],
    burnedCards: [],
    idleSince: Date.now(),
    tomatoEvents: [],
    tomatoBuckets: Object.create(null),
    scoreTomatoHits: [],
    historyRecorded: false,
    results: [],
    messages: [`${user.username} opened a score battle table.`]
  };
  scoreTables.set(id, table);
  return table;
}

function createScoreSeat(user) {
  return {
    seatId: crypto.randomBytes(8).toString("hex"),
    userId: user.id,
    displayName: user.username,
    avatar: user.avatar || "",
    ready: false,
    inGame: false,
    left: false,
    hand: [],
    discarded: [],
    played: [],
    discardUsesLeft: SCORE_BATTLE_DISCARD_USES,
    effectOptions: [],
    selectedEffect: null,
    effectChosen: false,
    usedEffectKinds: [],
    persistentEffects: {},
    submitted: false,
    roundScore: 0,
    totalScore: 0,
    winCount: 0,
    lastResult: null
  };
}

function joinScoreTable(table, user) {
  const existing = table.seats.find((seat) => seat.userId === user.id && !seat.left);
  if (existing) return existing;
  if (table.phase !== "waiting") {
    throwHttp(409, "This score battle has already started. You can watch until the next game.");
  }
  if (scoreVisibleSeats(table).length >= SCORE_BATTLE_MAX_SEATS) {
    throwHttp(409, "The score battle table is full. You can still watch after opening it.");
  }
  const seat = createScoreSeat(user);
  table.seats.push(seat);
  table.messages.unshift(`${user.username} joined the score battle.`);
  return seat;
}

function leaveScoreTable(table, userId) {
  const index = table.seats.findIndex((seat) => seat.userId === userId && !seat.left);
  if (index < 0) return { ok: true, deleted: false };
  const seat = table.seats[index];
  const name = seat.displayName;

  if (["waiting", "finished"].includes(table.phase)) {
    table.seats.splice(index, 1);
  } else {
    seat.left = true;
    seat.inGame = false;
    seat.ready = false;
    seat.userId = null;
    seat.displayName = `${name} (left)`;
    maybeAdvanceScoreBattle(table);
  }

  table.messages.unshift(`${name} left the score battle.`);
  transferScoreHost(table);
  if (!table.seats.some((entry) => entry.userId && !entry.left)) {
    scoreTables.delete(table.id);
    return { ok: true, deleted: true };
  }
  return { ok: true, deleted: false };
}

function transferScoreHost(table) {
  if (table.seats.some((seat) => seat.userId === table.createdBy && !seat.left)) return;
  const nextHost = table.seats.find((seat) => seat.userId && !seat.left);
  if (!nextHost) return;
  table.createdBy = nextHost.userId;
  table.messages.unshift(`${nextHost.displayName} is now the score battle host.`);
}

function setScoreSeatReady(table, userId, ready) {
  const seat = table.seats.find((entry) => entry.userId === userId && !entry.left);
  if (!seat) return { ok: false, error: "You are not seated at this score battle table." };
  if (!["waiting", "finished"].includes(table.phase)) {
    return { ok: false, error: "The roster is locked until this score battle ends." };
  }
  seat.ready = Boolean(ready);
  table.messages.unshift(`${seat.displayName} is ${seat.ready ? "ready" : "not ready"} for score battle.`);
  return { ok: true };
}

function startScoreBattle(table) {
  if (!["waiting", "finished"].includes(table.phase)) {
    return { ok: false, error: "A score battle is already running." };
  }
  const active = table.seats.filter((seat) => seat.userId && !seat.left && seat.ready);
  if (active.length < SCORE_BATTLE_MIN_PLAYERS) {
    return { ok: false, error: "Need at least 2 ready players to start." };
  }

  table.gameNumber += 1;
  table.idleSince = null;
  table.round = 1;
  table.rosterLocked = true;
  table.lastWinnerSeatIds = [];
  table.currentRoundLeaderSeatIds = [];
  table.previousRoundLeaderSeatIds = [];
  table.turnOrderSeatIds = [];
  table.currentTurnSeatId = null;
  table.turnStartedAt = null;
  table.roundEffects = [];
  table.burnedCards = [];
  table.scoreTomatoHits = [];
  table.historyRecorded = false;
  table.standings = [];
  table.results = [];
  for (const seat of table.seats) {
    seat.inGame = active.includes(seat);
    seat.hand = [];
    seat.discarded = [];
    seat.played = [];
    seat.discardUsesLeft = SCORE_BATTLE_DISCARD_USES;
    seat.effectOptions = [];
    seat.selectedEffect = null;
    seat.effectChosen = false;
    seat.usedEffectKinds = [];
    seat.persistentEffects = {};
    seat.submitted = false;
    seat.roundScore = 0;
    seat.totalScore = 0;
    seat.lastResult = null;
  }
  beginScoreBattleRound(table);
  table.messages.unshift(`Score battle ${table.gameNumber} started with ${active.length} players.`);
  return { ok: true };
}

function beginScoreBattleRound(table) {
  if (table.round > 1) {
    table.previousRoundLeaderSeatIds = table.currentRoundLeaderSeatIds || [];
  }
  table.currentRoundLeaderSeatIds = [];
  table.community = dealScoreCommunity(table);
  table.roundStartTotals = Object.create(null);
  for (const seat of activeScoreSeats(table)) {
    table.roundStartTotals[seat.seatId] = Number(seat.totalScore) || 0;
  }
  for (const seat of activeScoreSeats(table)) {
    topUpScoreHand(table, seat, scoreRoundHandSize(table.round));
    seat.selectedEffect = null;
    seat.effectChosen = false;
    seat.submitted = false;
    seat.roundScore = 0;
    seat.lastResult = null;
    seat.effectOptions = table.round >= 2 && !seat.persistentEffects?.returningFundamentals
      ? scoreBattle.createEffectOptions({ excludedKinds: seat.usedEffectKinds || [], round: table.round })
      : [];
  }
  table.results = [];
  table.roundEffects = [];
  table.turnOrderSeatIds = scoreTurnOrderSeatIds(table);
  table.currentTurnSeatId = null;
  activateScorePlayPhase(table);
  table.messages.unshift(`Round ${table.round} community cards are ready.`);
}

function scoreRoundHandSize(round) {
  return Math.min(5, round + 2);
}

function dealScoreCommunity(table) {
  const heldCodes = new Set(activeScoreSeats(table).flatMap((seat) => seat.hand.map((card) => card.code)));
  const burnedCodes = new Set((table.burnedCards || []).map((card) => card.code));
  const candidates = scoreBattle.createDeck().filter((card) => !heldCodes.has(card.code) && !burnedCodes.has(card.code));
  if (candidates.length < 5) throw new Error("Not enough cards available for the community board.");
  return scoreBattle.shuffle(candidates).slice(0, 5);
}

function topUpScoreHand(table, seat, targetSize) {
  const needed = Math.max(0, targetSize - seat.hand.length);
  if (needed === 0) return;
  const drawn = drawScoreCards(table, seat, needed);
  seat.hand.push(...drawn);
}

function drawScoreCards(table, seat, count) {
  const blocked = new Set([
    ...table.community.map((card) => card.code),
    ...(table.burnedCards || []).map((card) => card.code),
    ...seat.hand.map((card) => card.code),
    ...seat.discarded.map((card) => card.code),
    ...seat.played.map((card) => card.code)
  ]);
  const candidates = scoreBattle.createDeck().filter((card) => !blocked.has(card.code));
  if (candidates.length < count) throw new Error("This player has no unique cards left to draw.");
  return scoreBattle.shuffle(candidates).slice(0, count);
}

function drawScoreCommunityCards(table, count) {
  const blocked = new Set([
    ...table.community.map((card) => card.code),
    ...(table.burnedCards || []).map((card) => card.code),
    ...activeScoreSeats(table).flatMap((seat) => [
      ...seat.hand.map((card) => card.code),
      ...seat.discarded.map((card) => card.code),
      ...seat.played.map((card) => card.code)
    ])
  ]);
  const candidates = scoreBattle.createDeck().filter((card) => !blocked.has(card.code));
  if (candidates.length < count) throw new Error("Not enough unique cards left for the community board.");
  return scoreBattle.shuffle(candidates).slice(0, count);
}

function findScoreHandCard(seat, code) {
  const index = seat.hand.findIndex((card) => card.code === code);
  return index >= 0 ? { card: seat.hand[index], index } : null;
}

function findScoreCommunityCard(table, code) {
  const index = table.community.findIndex((card) => card.code === code);
  return index >= 0 ? { card: table.community[index], index } : null;
}

function mirrorScoreCard(card) {
  card.rank = scoreBattle.mirrorRankValue(card.rank);
}

function scoreCardChipValue(card) {
  return card.rank === 14 ? 15 : Number(card.rank) || 0;
}

function applyGoeliaEffect(seat) {
  const highRanks = scoreBattle.shuffle([8, 9, 10, 11, 12, 13]);
  seat.hand.forEach((card, index) => {
    card.rank = highRanks[index % highRanks.length];
  });
}

function scoreEffectLogName(effect) {
  const names = {
    "pattern-reproduction": "Pattern Reproduction",
    "shadow-swap": "Shadow Swap",
    "void-erosion": "Void Erosion",
    "world-mirror": "World in Mirror",
    "man-mirror": "Man in Mirror",
    draven: "Draven's League",
    goelia: "GOELIA",
    "shadow-targeting": "Shadow Targeting",
    "chaos-dice": "Chaos Dice",
    rambo: "Rambo",
    "tomato-king": "King of the Tomato",
    "tomato-shooter": "Tomato Shooter",
    "bite-me": "Bite me",
    "straight-flush-boost": "Straight Flush",
    "change-straight": "Change: Straight",
    protoceratops: "Protoceratops",
    "bread-butter": "Bread and butter",
    "bread-cheese": "Bread and cheese",
    "bread-jam": "Bread and Jam",
    "astral-body": "Astral Body",
    "tempered-tomato": "Tempered Tomato",
    "returning-fundamentals": "Returning to the fundamentals",
    "draw-sword": "Draw your sword",
    "critical-hit": "Critical Hit",
    "infinity-edge": "Infinity Edge",
    "brutal-force": "Brutal Force",
    vigorous: "Vigorous",
    "refresher-orb": "Refresher Orb",
    "giant-killer": "Giant Killer",
    "matthew-effect": "Matthew effect",
    "critical-switch-hand": "Critical Switch Hand"
  };
  if (effect.kind === "void-suit") return `${effect.suit} Void Seal`;
  return names[effect.kind] || effect.kind;
}

function chooseScoreEffect(table, userId, effectId, payload = {}) {
  if (table.phase !== "play-select") return { ok: false, error: "Effects can only be selected while choosing a play." };
  const seat = activeScoreSeats(table).find((entry) => entry.userId === userId);
  if (!seat) return { ok: false, error: "You are watching this score battle." };
  if (!isCurrentScoreTurn(table, seat)) return { ok: false, error: "Wait for your turn to choose an effect." };
  if (seat.submitted) return { ok: false, error: "You already submitted your play this round." };
  if (seat.effectChosen) return { ok: false, error: "You already chose an effect this round." };
  const effect = seat.effectOptions.find((entry) => entry.id === String(effectId || ""));
  if (!effect) return { ok: false, error: "Choose one of your available effect cards." };
  const applied = applyScoreEffect(table, seat, effect, payload);
  if (!applied.ok) return applied;
  seat.selectedEffect = applied.effect || effect;
  seat.effectChosen = true;
  if (SCORE_BATTLE_ONCE_PER_GAME_EFFECTS.has(effect.kind)) {
    seat.usedEffectKinds = Array.from(new Set([...(seat.usedEffectKinds || []), effect.kind]));
  }
  table.messages.unshift(`${seat.displayName} used ${scoreEffectLogName(effect)}.`);
  return { ok: true };
}

function scoreEffectForSeat(table, seat) {
  if (!seat?.selectedEffect) return seat?.selectedEffect || null;
  const effect = { ...seat.selectedEffect };
  const counts = scoreTomatoCountsForSeat(table, seat);
  if (effect.kind === "tomato-king") {
    effect.tomatoHits = counts.hitsBeforeRound;
  }
  if (effect.kind === "tomato-shooter") {
    effect.tomatoThrows = counts.throwsBeforeRound;
  }
  if (effect.kind === "bite-me") {
    effect.discardMultiplier = Math.max(0, Number(seat.discardUsesLeft) || 0);
  }
  return effect;
}

function scoreContextForSeat(table, seat, options = {}) {
  const roundStartTotals = table.roundStartTotals || {};
  const seatStartTotal = Number(roundStartTotals[seat.seatId]) || 0;
  const highestStartTotal = Math.max(
    ...activeScoreSeats(table).map((entry) => Number(roundStartTotals[entry.seatId]) || 0),
    0
  );
  return {
    roundEffects: table.roundEffects || [],
    seatId: seat.seatId,
    round: table.round,
    totalRounds: SCORE_BATTLE_ROUNDS,
    persistentEffects: seat.persistentEffects || {},
    tomatoCounts: scoreTomatoCountsForSeat(table, seat),
    totalScoreBeforeRound: seatStartTotal,
    highestTotalScoreBeforeRound: highestStartTotal,
    turnElapsedMs: options.turnElapsedMs ?? (Date.now() - (table.turnStartedAt || Date.now())),
    criticalExpected: Boolean(options.criticalExpected),
    criticalRolls: Array.isArray(options.criticalRolls) ? options.criticalRolls : []
  };
}

function scoreTomatoCountsForSeat(table, seat) {
  const multiplier = seat.persistentEffects?.protoceratops ? 3 : 1;
  const rawHitsBeforeRound = countScoreTomatoHits(table, seat, "toSeatId", true);
  const rawThrowsBeforeRound = countScoreTomatoHits(table, seat, "fromSeatId", true);
  const rawHitsTotal = countScoreTomatoHits(table, seat, "toSeatId", false);
  const rawThrowsTotal = countScoreTomatoHits(table, seat, "fromSeatId", false);
  return {
    rawHitsBeforeRound,
    rawThrowsBeforeRound,
    rawHitsTotal,
    rawThrowsTotal,
    hitsBeforeRound: rawHitsBeforeRound * multiplier,
    throwsBeforeRound: rawThrowsBeforeRound * multiplier,
    hitsTotal: rawHitsTotal * multiplier,
    throwsTotal: rawThrowsTotal * multiplier,
    multiplier
  };
}

function countScoreTomatoHits(table, seat, seatField, beforeRoundOnly) {
  const currentRound = Number(table.round) || 0;
  return (table.scoreTomatoHits || []).filter((hit) => (
    Number(hit.gameNumber) === Number(table.gameNumber) &&
    Number(hit.round) > 0 &&
    (beforeRoundOnly ? Number(hit.round) < currentRound : Number(hit.round) <= currentRound) &&
    hit[seatField] === seat.seatId
  )).length;
}

function applyScoreEffect(table, seat, effect, payload) {
  const cardCodes = normalizeScoreCardCodes(payload.targetCardCodes);
  seat.persistentEffects = seat.persistentEffects || {};
  if (effect.kind === "void-suit") {
    table.roundEffects.push({
      kind: "void-suit",
      suit: effect.suit,
      amount: effect.amount || 3,
      sourceSeatId: seat.seatId,
      sourceName: seat.displayName
    });
    return { ok: true, effect };
  }
  if (effect.kind === "pattern-reproduction") {
    if (cardCodes.length !== 2) return { ok: false, error: "Choose two hand cards for Pattern Reproduction." };
    const first = findScoreHandCard(seat, cardCodes[0]);
    const second = findScoreHandCard(seat, cardCodes[1]);
    if (!first || !second || first.card.code === second.card.code) return { ok: false, error: "Choose two different hand cards." };
    first.card.suit = second.card.suit;
    return { ok: true, effect: { ...effect, targetCodes: cardCodes } };
  }
  if (effect.kind === "shadow-swap") {
    if (cardCodes.length !== 2) return { ok: false, error: "Choose one hand card and one community card." };
    const firstHand = findScoreHandCard(seat, cardCodes[0]);
    const secondHand = findScoreHandCard(seat, cardCodes[1]);
    const firstCommunity = findScoreCommunityCard(table, cardCodes[0]);
    const secondCommunity = findScoreCommunityCard(table, cardCodes[1]);
    const hand = firstHand || secondHand;
    const community = firstCommunity || secondCommunity;
    if (!hand || !community) return { ok: false, error: "Choose one hand card and one community card." };
    const handCard = hand.card;
    seat.hand[hand.index] = community.card;
    table.community[community.index] = handCard;
    table.messages.unshift(`${seat.displayName} swapped a hand card with the community board.`);
    return { ok: true, effect: { ...effect, targetCodes: [hand.card.code, community.card.code] } };
  }
  if (effect.kind === "void-erosion") {
    if (cardCodes.length !== 1) return { ok: false, error: "Choose one community card for Void Erosion." };
    const community = findScoreCommunityCard(table, cardCodes[0]);
    if (!community) return { ok: false, error: "Choose a community card." };
    table.burnedCards.push(community.card);
    const [replacement] = drawScoreCommunityCards(table, 1);
    table.community[community.index] = replacement;
    table.messages.unshift(`${seat.displayName} eroded a community card.`);
    return { ok: true, effect: { ...effect, targetCodes: cardCodes } };
  }
  if (effect.kind === "world-mirror") {
    for (const card of table.community) mirrorScoreCard(card);
    table.messages.unshift(`${seat.displayName} mirrored the community board.`);
    return { ok: true, effect };
  }
  if (effect.kind === "man-mirror") {
    for (const card of seat.hand) mirrorScoreCard(card);
    return { ok: true, effect };
  }
  if (effect.kind === "goelia") {
    applyGoeliaEffect(seat);
    return { ok: true, effect };
  }
  if (effect.kind === "shadow-targeting") {
    if (cardCodes.length !== 2) return { ok: false, error: "Choose two of your hand cards." };
    const selected = cardCodes.map((code) => findScoreHandCard(seat, code));
    if (selected.some((entry) => !entry) || new Set(selected.map((entry) => entry.card.code)).size !== 2) {
      return { ok: false, error: "Choose two different hand cards." };
    }
    const target = activeScoreSeats(table).find((entry) => entry.seatId === String(payload.targetSeatId || ""));
    if (!target || target.seatId === seat.seatId || target.submitted || target.hand.length < 2) {
      return { ok: false, error: "Choose another player who has not played this round." };
    }
    const targetSlots = scoreBattle.shuffle(target.hand.map((card, index) => ({ card, index }))).slice(0, 2);
    const gainedChipBonus = targetSlots.reduce((sum, entry) => sum + scoreCardChipValue(entry.card), 0);
    selected.forEach((entry, index) => {
      const ownCard = entry.card;
      seat.hand[entry.index] = targetSlots[index].card;
      target.hand[targetSlots[index].index] = ownCard;
    });
    table.messages.unshift(`${seat.displayName} exchanged two random cards with ${target.displayName}.`);
    return { ok: true, effect: { ...effect, targetSeatId: target.seatId, targetName: target.displayName, targetCodes: cardCodes, gainedChipBonus } };
  }
  if (effect.kind === "chaos-dice") {
    let rerolledCardCount = 0;
    for (const activeSeat of activeScoreSeats(table).filter((entry) => !entry.submitted)) {
      const count = activeSeat.hand.length;
      rerolledCardCount += count;
      activeSeat.discarded.push(...activeSeat.hand);
      activeSeat.hand = [];
      activeSeat.hand.push(...drawScoreCards(table, activeSeat, count));
    }
    table.messages.unshift(`${seat.displayName} rerolled ${rerolledCardCount} unplayed hand cards.`);
    return { ok: true, effect: { ...effect, rerolledCardCount, chaosChipBonus: rerolledCardCount * 0.5 } };
  }
  if (effect.kind === "protoceratops") {
    seat.persistentEffects.protoceratops = true;
    return { ok: true, effect };
  }
  if (effect.kind === "bread-butter") {
    seat.persistentEffects.breadButter = true;
    return { ok: true, effect };
  }
  if (effect.kind === "bread-cheese") {
    seat.persistentEffects.breadCheese = true;
    return { ok: true, effect };
  }
  if (effect.kind === "bread-jam") {
    seat.persistentEffects.breadJam = true;
    return { ok: true, effect };
  }
  if (effect.kind === "astral-body") {
    seat.persistentEffects.astralBody = true;
    return { ok: true, effect };
  }
  if (effect.kind === "tempered-tomato") {
    seat.persistentEffects.temperedTomato = true;
    return { ok: true, effect };
  }
  if (effect.kind === "returning-fundamentals") {
    seat.persistentEffects.returningFundamentals = true;
    seat.effectOptions = [];
    return { ok: true, effect };
  }
  if (effect.kind === "draw-sword") {
    seat.persistentEffects.drawSword = true;
    seat.persistentEffects.drawSwordDiscardBlocked = true;
    return { ok: true, effect };
  }
  if (effect.kind === "critical-hit") {
    seat.persistentEffects.criticalHit = true;
    return { ok: true, effect };
  }
  if (effect.kind === "infinity-edge") {
    seat.persistentEffects.infinityEdge = true;
    return { ok: true, effect };
  }
  if (effect.kind === "refresher-orb") {
    seat.discardUsesLeft = Math.max(0, Number(seat.discardUsesLeft) || 0) + 4;
    seat.persistentEffects.drawSwordDiscardBlocked = false;
    return { ok: true, effect };
  }
  if (effect.kind === "giant-killer") {
    seat.persistentEffects.giantKiller = true;
    return { ok: true, effect };
  }
  if (effect.kind === "matthew-effect") {
    seat.persistentEffects.matthewEffect = true;
    return { ok: true, effect };
  }
  if (effect.kind === "critical-switch-hand") {
    seat.persistentEffects.criticalSwitchHand = true;
    return { ok: true, effect };
  }
  return { ok: true, effect };
}

function activateScorePlayPhase(table) {
  table.phase = "play-select";
  const first = nextScoreTurnSeat(table);
  if (first) startScoreTurn(table, first);
  else table.phaseDeadline = null;
}

function scoreTurnOrderSeatIds(table) {
  const active = activeScoreSeats(table);
  if (!active.length) return [];
  const startIndex = ((table.gameNumber - 1) + (table.round - 1)) % active.length;
  return active.slice(startIndex).concat(active.slice(0, startIndex)).map((seat) => seat.seatId);
}

function currentScoreTurnSeat(table) {
  return activeScoreSeats(table).find((seat) => seat.seatId === table.currentTurnSeatId && !seat.submitted) || null;
}

function isCurrentScoreTurn(table, seat) {
  return Boolean(seat && table.phase === "play-select" && seat.seatId === table.currentTurnSeatId && !seat.submitted);
}

function nextScoreTurnSeat(table) {
  const active = activeScoreSeats(table);
  if (!active.length) return null;
  const order = (table.turnOrderSeatIds || []).filter((seatId) => active.some((seat) => seat.seatId === seatId));
  const orderedIds = order.length ? order : active.map((seat) => seat.seatId);
  const currentIndex = orderedIds.indexOf(table.currentTurnSeatId);
  const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
  for (let offset = 0; offset < orderedIds.length; offset += 1) {
    const seatId = orderedIds[(startIndex + offset) % orderedIds.length];
    const seat = active.find((entry) => entry.seatId === seatId);
    if (seat && !seat.submitted) return seat;
  }
  return null;
}

function startScoreTurn(table, seat) {
  table.currentTurnSeatId = seat.seatId;
  table.turnStartedAt = Date.now();
  table.phaseDeadline = Date.now() + SCORE_BATTLE_PLAY_SECONDS * 1000;
  table.messages.unshift(`Round ${table.round}: ${seat.displayName}'s turn.`);
}

function discardScoreCards(table, userId, rawCodes) {
  if (table.phase !== "play-select") return { ok: false, error: "Cards can only be discarded while choosing a play." };
  const seat = activeScoreSeats(table).find((entry) => entry.userId === userId);
  if (!seat) return { ok: false, error: "You are watching this score battle." };
  if (!isCurrentScoreTurn(table, seat)) return { ok: false, error: "Wait for your turn to discard cards." };
  if (seat.submitted) return { ok: false, error: "You already submitted your play this round." };
  if (scoreDiscardsBlocked(seat)) return { ok: false, error: "Draw your sword prevents discards for the rest of this game." };
  if (seat.discardUsesLeft <= 0) return { ok: false, error: "You have no discard uses left this game." };

  const codes = normalizeScoreCardCodes(rawCodes);
  if (codes.length < 1) {
    return { ok: false, error: "Discard at least one hand card." };
  }
  const codeSet = new Set(codes);
  const discardSlots = seat.hand
    .map((card, index) => ({ card, index }))
    .filter((entry) => codeSet.has(entry.card.code));
  if (discardSlots.length !== codes.length) return { ok: false, error: "You can only discard cards from your hand." };
  const cards = discardSlots.map((entry) => entry.card);
  if (cards.some((card) => !card)) return { ok: false, error: "You can only discard cards from your hand." };

  seat.discarded.push(...cards);
  seat.discardUsesLeft -= 1;
  const replacements = drawScoreCards(table, seat, cards.length);
  const nextHand = seat.hand.slice();
  discardSlots.forEach((entry, index) => {
    nextHand[entry.index] = replacements[index];
  });
  seat.hand = nextHand;
  table.messages.unshift(`${seat.displayName} exchanged ${cards.length} hand card${cards.length === 1 ? "" : "s"}.`);
  return { ok: true };
}

function submitScorePlay(table, userId, rawCodes) {
  if (table.phase !== "play-select") return { ok: false, error: "Plays are not being selected now." };
  const seat = activeScoreSeats(table).find((entry) => entry.userId === userId);
  if (!seat) return { ok: false, error: "You are watching this score battle." };
  if (!isCurrentScoreTurn(table, seat)) return { ok: false, error: "Wait for your turn to play cards." };
  if (seat.submitted) return { ok: false, error: "You already submitted this round." };
  const codes = normalizeScoreCardCodes(rawCodes);
  if (codes.length !== 5) return { ok: false, error: "Choose exactly five cards to play." };
  const available = seat.hand.concat(table.community);
  const cards = codes.map((code) => available.find((card) => card.code === code));
  if (cards.some((card) => !card)) return { ok: false, error: "Choose cards from your hand or the current community." };
  const communityCodes = new Set(table.community.map((card) => card.code));
  if (!codes.some((code) => communityCodes.has(code))) {
    return { ok: false, error: "Your play must include at least one community card." };
  }
  recordScorePlay(table, seat, cards, false);
  maybeAdvanceScoreBattle(table);
  return { ok: true };
}

function previewScorePlay(table, userId, rawCodes) {
  if (table.phase !== "play-select") return { ok: false, error: "Plays are not being selected now." };
  const seat = activeScoreSeats(table).find((entry) => entry.userId === userId);
  if (!seat) return { ok: false, error: "You are watching this score battle." };
  if (!isCurrentScoreTurn(table, seat)) return { ok: false, error: "Wait for your turn to preview cards." };
  if (seat.submitted) return { ok: false, error: "You already submitted this round." };
  const cardsResult = selectedScoreCards(table, seat, rawCodes);
  if (!cardsResult.ok) return cardsResult;
  const scoringEffect = scoreEffectForSeat(table, seat);
  const result = scoreBattle.scorePlay(cardsResult.cards, scoringEffect, scoreContextForSeat(table, seat, { criticalExpected: true }));
  return {
    ok: true,
    preview: scoreResultForClient(table, seat, cardsResult.cards, result, false, scoringEffect)
  };
}

function selectedScoreCards(table, seat, rawCodes) {
  const codes = normalizeScoreCardCodes(rawCodes);
  if (codes.length !== 5) return { ok: false, error: "Choose exactly five cards to play." };
  const available = seat.hand.concat(table.community);
  const cards = codes.map((code) => available.find((card) => card.code === code));
  if (cards.some((card) => !card)) return { ok: false, error: "Choose cards from your hand or the current community." };
  const communityCodes = new Set(table.community.map((card) => card.code));
  if (!codes.some((code) => communityCodes.has(code))) {
    return { ok: false, error: "Your play must include at least one community card." };
  }
  return { ok: true, codes, cards };
}

function normalizeScoreCardCodes(rawCodes) {
  if (!Array.isArray(rawCodes)) return [];
  const codes = rawCodes.map((code) => String(code || "").toUpperCase());
  return Array.from(new Set(codes));
}

function recordScorePlay(table, seat, cards, automatic) {
  const scoringEffect = scoreEffectForSeat(table, seat);
  const result = scoreBattle.scorePlay(cards, scoringEffect, scoreContextForSeat(table, seat, {
    criticalRolls: scoreCriticalRollsForSeat(seat, cards.length)
  }));
  const handCodes = new Set(seat.hand.map((card) => card.code));
  const playedHandCards = cards.filter((card) => handCodes.has(card.code));
  seat.hand = seat.hand.filter((card) => !handCodes.has(card.code) || !playedHandCards.some((played) => played.code === card.code));
  seat.played.push(...playedHandCards);
  seat.roundScore = result.score;
  seat.totalScore += result.score;
  seat.lastResult = scoreResultForClient(table, seat, cards, result, automatic, scoringEffect);
  applyScorePlayResourceBonuses(table, seat, result);
  seat.submitted = true;
  table.currentRoundLeaderSeatIds = scoreRoundLeaderSeatIds(table);
  table.messages.unshift(`${seat.displayName} scored ${result.score} with ${result.handName}${automatic ? " automatically" : ""}.`);
}

function scoreCriticalRollsForSeat(seat, count) {
  const profile = scoreBattle.criticalProfileForEffects(seat.persistentEffects || {});
  if (profile.chance <= 0) return [];
  const threshold = Math.floor(profile.chance * 1000000);
  return Array.from({ length: count }, () => crypto.randomInt(1000000) < threshold);
}

function applyScorePlayResourceBonuses(table, seat, result) {
  if (!seat.persistentEffects?.criticalSwitchHand) return;
  const critTriggered = (result.cardValues || []).some((entry) => (
    (entry.bonuses || []).some((bonus) => bonus.kind === "critical-hit" && bonus.critical)
  ));
  if (!critTriggered) return;
  seat.discardUsesLeft = Math.max(0, Number(seat.discardUsesLeft) || 0) + 1;
  table.messages.unshift(`${seat.displayName} gained 1 discard use from Critical Switch Hand.`);
}

function scoreResultForClient(table, seat, cards, result, automatic, scoringEffect = seat.selectedEffect) {
  const communityCodes = new Set(table.community.map((card) => card.code));
  return {
    handId: result.handId,
    handName: result.handName,
    chips: result.chips,
    baseMultiplier: result.baseMultiplier,
    bonusMultiplier: result.bonusMultiplier,
    additiveMultiplierTotal: result.additiveMultiplierTotal,
    multiplierFactors: result.multiplierFactors || [],
    multiplier: result.multiplier,
    score: result.score,
    chipTotalBeforeFactors: result.chipTotalBeforeFactors,
    chipFactors: result.chipFactors || [],
    cards: cards.map((card) => ({
      ...cardForClient(card),
      source: communityCodes.has(card.code) ? "community" : "hand"
    })),
    cardValues: result.cardValues,
    globalChipBonuses: result.globalChipBonuses || [],
    multiplierBonuses: result.multiplierBonuses,
    scoreBonuses: result.scoreBonuses || [],
    scoreFactors: result.scoreFactors || [],
    effect: scoringEffect,
    postRoundBonuses: [],
    automatic: Boolean(automatic)
  };
}

function maybeAdvanceScoreBattle(table) {
  const active = activeScoreSeats(table);
  if (active.length < SCORE_BATTLE_MIN_PLAYERS && !["waiting", "finished"].includes(table.phase)) {
    finishScoreBattle(table, true);
    return;
  }
  if (table.phase === "play-select") {
    table.currentRoundLeaderSeatIds = scoreRoundLeaderSeatIds(table);
    if (active.every((seat) => seat.submitted)) {
      completeScoreBattleRound(table);
      return;
    }
    if (!currentScoreTurnSeat(table)) {
      const next = nextScoreTurnSeat(table);
      if (next) startScoreTurn(table, next);
    }
  }
}

function completeScoreBattleRound(table) {
  applyScorePostRoundBonuses(table);
  table.phase = "round-result";
  table.phaseDeadline = Date.now() + SCORE_BATTLE_RESULT_SECONDS * 1000;
  table.currentTurnSeatId = null;
  table.currentRoundLeaderSeatIds = scoreRoundLeaderSeatIds(table);
  table.results = activeScoreSeats(table)
    .slice()
    .sort((left, right) => right.roundScore - left.roundScore || right.totalScore - left.totalScore)
    .map((seat) => `${seat.displayName}: ${seat.lastResult.handName}, ${seat.roundScore} points.`);
  table.messages.unshift(`Round ${table.round} settled.`);
}

function applyScorePostRoundBonuses(table) {
  const leaders = scoreRoundLeaderSeatIds(table);
  if (leaders.length) {
    const maxTotal = Math.max(...activeScoreSeats(table).map((seat) => Number(seat.totalScore) || 0), 0);
    for (const seat of activeScoreSeats(table)) {
      if (seat.selectedEffect?.kind !== "draven" || !leaders.includes(seat.seatId)) continue;
      const bonus = Math.floor(maxTotal * (seat.selectedEffect.amount || 0.2));
      if (bonus <= 0) continue;
      seat.roundScore += bonus;
      seat.totalScore += bonus;
      if (seat.lastResult) {
        seat.lastResult.score += bonus;
        seat.lastResult.postRoundBonuses = seat.lastResult.postRoundBonuses || [];
        seat.lastResult.postRoundBonuses.push({ kind: "draven", amount: bonus });
      }
      table.messages.unshift(`${seat.displayName} cashed in Draven's League for ${bonus} points.`);
    }
  }

  const finalLeaders = scoreRoundLeaderSeatIds(table);
  for (const seat of activeScoreSeats(table)) {
    if (!seat.persistentEffects?.matthewEffect || !finalLeaders.includes(seat.seatId)) continue;
    seat.discardUsesLeft = Math.max(0, Number(seat.discardUsesLeft) || 0) + 3;
    table.messages.unshift(`${seat.displayName} gained 3 discard uses from Matthew effect.`);
  }
}

function scoreDiscardsBlocked(seat) {
  return Boolean(seat?.persistentEffects?.drawSword && seat.persistentEffects.drawSwordDiscardBlocked !== false);
}

function processScoreBattleTimeouts() {
  const now = Date.now();
  for (const table of scoreTables.values()) {
    if (!table.phaseDeadline || now < table.phaseDeadline) continue;
    if (table.phase === "play-select") {
      const seat = currentScoreTurnSeat(table);
      if (seat) {
        const scoringEffect = scoreEffectForSeat(table, seat);
        const best = scoreBattle.findBestPlay(seat.hand, table.community, scoringEffect, {
          ...scoreContextForSeat(table, seat, { criticalExpected: true }),
          requireCommunity: true,
        });
        recordScorePlay(table, seat, best.cards, true);
      }
      maybeAdvanceScoreBattle(table);
      continue;
    }
    if (table.phase === "round-result") {
      if (table.round >= SCORE_BATTLE_ROUNDS) finishScoreBattle(table, false);
      else {
        table.round += 1;
        beginScoreBattleRound(table);
      }
    }
  }
}

function finishScoreBattle(table, abandoned) {
  const active = activeScoreSeats(table);
  table.phase = "finished";
  table.phaseDeadline = null;
  table.idleSince = Date.now();
  table.currentTurnSeatId = null;
  table.rosterLocked = false;
  for (const seat of table.seats) seat.inGame = false;
  if (abandoned) {
    table.lastWinnerSeatIds = [];
    table.lastVictoryGameNumber = 0;
    table.currentRoundLeaderSeatIds = [];
    table.previousRoundLeaderSeatIds = [];
    table.results = ["The score battle ended because fewer than two players remained."];
    return;
  }
  table.standings = scoreStandings(active);
  recordScoreBattleWinners(table);
  awardScoreBattleCoins(table);
  recordScoreBattleHistory(table);
  table.results = table.standings.map((standing) => `${standing.rank}. ${standing.displayName} - ${standing.totalScore} total (+${standing.coins} coins)`);
  table.messages.unshift(`Score battle ${table.gameNumber} finished.`);
}

function recordScoreBattleWinners(table) {
  const winners = table.standings.filter((standing) => standing.rank === 1);
  table.lastWinnerSeatIds = winners.map((standing) => standing.seatId);
  table.lastVictoryGameNumber = winners.length ? table.gameNumber : 0;
  for (const winner of winners) {
    const seat = table.seats.find((entry) => entry.seatId === winner.seatId);
    if (seat) seat.winCount = (Number(seat.winCount) || 0) + 1;
  }
}

function scoreStandings(seats) {
  const sorted = seats.slice().sort((left, right) => right.totalScore - left.totalScore || right.roundScore - left.roundScore || left.displayName.localeCompare(right.displayName));
  let previous = null;
  return sorted.map((seat, index) => {
    const tied = previous && previous.totalScore === seat.totalScore && previous.roundScore === seat.roundScore;
    const rank = tied ? previous.rank : index + 1;
    const standing = {
      seatId: seat.seatId,
      userId: seat.userId,
      displayName: seat.displayName,
      totalScore: seat.totalScore,
      roundScore: seat.roundScore,
      rank,
      coins: scoreCoinReward(rank)
    };
    previous = standing;
    return standing;
  });
}

function scoreCoinReward(rank) {
  if (rank === 1) return 8;
  if (rank === 2) return 4;
  if (rank === 3) return 2;
  return 1;
}

function scoreRoundLeaderSeatIds(table) {
  const submitted = activeScoreSeats(table).filter((seat) => seat.submitted && seat.lastResult);
  if (!submitted.length) return [];
  const topScore = Math.max(...submitted.map((seat) => Number(seat.roundScore) || 0));
  return submitted.filter((seat) => (Number(seat.roundScore) || 0) === topScore).map((seat) => seat.seatId);
}

function awardScoreBattleCoins(table) {
  for (const standing of table.standings) {
    const user = userDb.users.find((entry) => entry.id === standing.userId);
    if (!user) continue;
    ensureUserProfile(user);
    user.coins += standing.coins;
  }
  writeUsers();
}

function recordScoreBattleHistory(table) {
  if (table.historyRecorded || !Array.isArray(table.standings) || !table.standings.length) return;
  const standings = table.standings.map((standing) => ({
    rank: standing.rank,
    displayName: standing.displayName,
    totalScore: standing.totalScore
  }));
  for (const standing of table.standings) {
    const user = userDb.users.find((entry) => entry.id === standing.userId);
    if (!user) continue;
    ensureUserProfile(user);
    user.history.unshift({
      id: crypto.randomBytes(8).toString("hex"),
      type: "score-battle",
      tableId: table.id,
      tableName: table.name,
      gameNumber: table.gameNumber,
      leftAt: new Date().toISOString(),
      rank: standing.rank,
      totalScore: standing.totalScore,
      standings
    });
    user.history = user.history.slice(0, MAX_HISTORY_ENTRIES);
    user.stats.sessionsPlayed = (Number(user.stats.sessionsPlayed) || 0) + 1;
  }
  table.historyRecorded = true;
  writeUsers();
}

function recordTomatoThrow(table, userId, targetSeatId) {
  pruneTomatoEvents(table);
  const from = table.seats.find((seat) => seat.userId === userId && !seat.left);
  if (!from) return { ok: false, status: 403, error: "You must be seated at this table to throw tomatoes." };
  const target = table.seats.find((seat) => seat.seatId === String(targetSeatId || "") && !seat.left);
  if (!target) return { ok: false, status: 404, error: "Target player was not found." };
  if (target.seatId === from.seatId) return { ok: false, status: 400, error: "Choose another player." };

  const now = Date.now();
  table.tomatoBuckets = table.tomatoBuckets || Object.create(null);
  const key = from.userId || from.seatId;
  const bucket = table.tomatoBuckets[key] || { times: [], cooldownUntil: 0 };
  bucket.times = bucket.times.filter((time) => now - Number(time) < TOMATO_WINDOW_MS);
  if (Number(bucket.cooldownUntil) > now) {
    table.tomatoBuckets[key] = bucket;
    const seconds = Math.max(1, Math.ceil((bucket.cooldownUntil - now) / 1000));
    return { ok: false, status: 429, error: `Tomato cooldown: ${seconds}s.` };
  }
  if (bucket.times.length >= TOMATO_LIMIT) {
    bucket.cooldownUntil = now + TOMATO_COOLDOWN_MS;
    table.tomatoBuckets[key] = bucket;
    return { ok: false, status: 429, error: "Tomato cooldown: 5s." };
  }

  bucket.times.push(now);
  if (bucket.times.length >= TOMATO_LIMIT) bucket.cooldownUntil = now + TOMATO_COOLDOWN_MS;
  table.tomatoBuckets[key] = bucket;

  const event = {
    id: crypto.randomBytes(8).toString("hex"),
    fromSeatId: from.seatId,
    toSeatId: target.seatId,
    fromName: from.displayName,
    toName: target.displayName,
    createdAt: now
  };
  table.tomatoEvents = (table.tomatoEvents || []).concat(event).slice(-80);
  recordScoreTomatoHit(table, from, target, now);
  return { ok: true, event };
}

function recordScoreTomatoHit(table, from, target, now) {
  if (!String(table.id || "").startsWith("score-")) return;
  if (!table.gameNumber || !table.round || ["waiting", "finished"].includes(table.phase)) return;
  table.scoreTomatoHits = (table.scoreTomatoHits || []).filter((hit) => Number(hit.gameNumber) === Number(table.gameNumber));
  table.scoreTomatoHits.push({
    gameNumber: table.gameNumber,
    round: table.round,
    fromSeatId: from.seatId,
    toSeatId: target.seatId,
    createdAt: now
  });
}

function pruneTomatoEvents(table, now = Date.now()) {
  table.tomatoEvents = (table.tomatoEvents || []).filter((event) => now - Number(event.createdAt || 0) < TOMATO_EVENT_TTL_MS);
}

function tomatoEventsForClient(table) {
  pruneTomatoEvents(table);
  return (table.tomatoEvents || []).map((event) => ({
    id: event.id,
    fromSeatId: event.fromSeatId,
    toSeatId: event.toSeatId,
    fromName: event.fromName,
    toName: event.toName,
    createdAt: event.createdAt
  }));
}

function activeScoreSeats(table) {
  return table.seats.filter((seat) => seat.inGame && seat.userId && !seat.left);
}

function scoreVisibleSeats(table) {
  return table.seats.filter((seat) => !seat.left);
}

function pruneStaleScoreTables(now = Date.now()) {
  for (const [id, table] of scoreTables.entries()) {
    if (!["waiting", "finished"].includes(table.phase)) continue;
    const createdAt = Date.parse(table.createdAt);
    const idleSince = Number.isFinite(Number(table.idleSince))
      ? Number(table.idleSince)
      : (Number.isFinite(createdAt) ? createdAt : now);
    if (now - idleSince >= SCORE_TABLE_IDLE_TTL_MS) scoreTables.delete(id);
  }
}

function scoreTableSummary(table, user) {
  const seats = scoreVisibleSeats(table);
  const youSeat = seats.find((seat) => seat.userId === user.id);
  return {
    id: table.id,
    name: table.name,
    phase: table.phase,
    round: table.round,
    seats: seats.length,
    readySeats: seats.filter((seat) => seat.ready).length,
    maxSeats: SCORE_BATTLE_MAX_SEATS,
    youAreSeated: Boolean(youSeat),
    canJoin: table.phase === "waiting" && !youSeat && seats.length < SCORE_BATTLE_MAX_SEATS
  };
}

function scoreTableView(table, user) {
  const youSeat = table.seats.find((seat) => seat.userId === user.id && !seat.left);
  const readySeats = table.seats.filter((seat) => seat.ready && seat.userId && !seat.left).length;
  const preGame = ["waiting", "finished"].includes(table.phase);
  return {
    id: table.id,
    name: table.name,
    isHost: table.createdBy === user.id,
    phase: table.phase,
    round: table.round,
    rounds: SCORE_BATTLE_ROUNDS,
    gameNumber: table.gameNumber,
    winnerSeatIds: table.lastWinnerSeatIds || [],
    victoryGameNumber: table.lastVictoryGameNumber || 0,
    victoryImage: "/assets/victory-special-effect.gif",
    currentTurnSeatId: table.currentTurnSeatId || null,
    currentTurnName: table.currentTurnSeatId ? table.seats.find((seat) => seat.seatId === table.currentTurnSeatId)?.displayName || "" : "",
    currentRoundLeaderSeatIds: table.currentRoundLeaderSeatIds || [],
    previousRoundLeaderSeatIds: table.previousRoundLeaderSeatIds || [],
    roundEffects: (table.roundEffects || []).map((effect) => ({
      kind: effect.kind,
      suit: effect.suit,
      amount: effect.amount,
      sourceName: effect.sourceName
    })),
    maxSeats: SCORE_BATTLE_MAX_SEATS,
    minPlayers: SCORE_BATTLE_MIN_PLAYERS,
    discardUses: SCORE_BATTLE_DISCARD_USES,
    phaseDeadline: table.phaseDeadline,
    serverNow: Date.now(),
    community: table.community.map(cardForClient),
    youSeatId: youSeat?.seatId || null,
    readySeats,
    canJoin: table.phase === "waiting" && !youSeat && scoreVisibleSeats(table).length < SCORE_BATTLE_MAX_SEATS,
    canLeave: Boolean(youSeat),
    canReady: Boolean(youSeat && preGame),
    canStart: Boolean(table.createdBy === user.id && preGame && readySeats >= SCORE_BATTLE_MIN_PLAYERS),
    seats: table.seats.map((seat) => scoreSeatForClient(table, seat, youSeat)),
    standings: table.standings,
    tomatoEvents: tomatoEventsForClient(table),
    results: table.results,
    messages: table.messages.slice(0, 8)
  };
}

function scoreSeatForClient(table, seat, youSeat) {
  const isYou = seat.seatId === youSeat?.seatId;
  const isScoreTurn = isCurrentScoreTurn(table, seat);
  const tomatoCounts = scoreTomatoCountsForSeat(table, seat);
  const result = seat.lastResult ? {
    handId: seat.lastResult.handId,
    handName: seat.lastResult.handName,
    chips: seat.lastResult.chips,
    baseMultiplier: seat.lastResult.baseMultiplier,
    bonusMultiplier: seat.lastResult.bonusMultiplier,
    additiveMultiplierTotal: seat.lastResult.additiveMultiplierTotal,
    multiplierFactors: seat.lastResult.multiplierFactors || [],
    multiplier: seat.lastResult.multiplier,
    score: seat.lastResult.score,
    chipTotalBeforeFactors: seat.lastResult.chipTotalBeforeFactors,
    chipFactors: seat.lastResult.chipFactors || [],
    automatic: seat.lastResult.automatic,
    effect: seat.lastResult.effect,
    cardValues: seat.lastResult.cardValues || [],
    multiplierBonuses: seat.lastResult.multiplierBonuses || [],
    globalChipBonuses: seat.lastResult.globalChipBonuses || [],
    scoreBonuses: seat.lastResult.scoreBonuses || [],
    scoreFactors: seat.lastResult.scoreFactors || [],
    postRoundBonuses: seat.lastResult.postRoundBonuses || [],
    cards: (seat.lastResult.cards || []).map((entry) => ({
      ...entry,
      source: entry.source
    }))
  } : null;
  return {
    seatId: seat.seatId,
    displayName: seat.displayName,
    avatar: seat.userId ? getUserAvatar(seat.userId) : seat.avatar || "",
    ready: seat.ready,
    inGame: seat.inGame,
    left: seat.left,
    submitted: seat.submitted,
    roundScore: seat.roundScore,
    totalScore: seat.totalScore,
    tomatoCounts,
    winCount: Number(seat.winCount) || 0,
    wonLastGame: Boolean((table.lastWinnerSeatIds || []).includes(seat.seatId) && table.lastVictoryGameNumber === table.gameNumber),
    isScoreTurn,
    isCurrentRoundLeader: Boolean((table.currentRoundLeaderSeatIds || []).includes(seat.seatId)),
    isPreviousRoundLeader: Boolean((table.previousRoundLeaderSeatIds || []).includes(seat.seatId)),
    isYou,
    isHost: seat.userId === table.createdBy,
    hand: isYou && seat.inGame ? seat.hand.map(cardForClient) : [],
    discardUsesLeft: isYou ? seat.discardUsesLeft : null,
    canDiscardThisRound: Boolean(isYou && isScoreTurn && seat.inGame && !seat.submitted && seat.discardUsesLeft > 0 && !scoreDiscardsBlocked(seat)),
    effectOptions: isYou && isScoreTurn && seat.inGame && !seat.submitted && !seat.effectChosen ? seat.effectOptions : [],
    selectedEffect: seat.effectChosen ? seat.selectedEffect : (isYou ? seat.selectedEffect : null),
    effectChosen: isYou ? seat.effectChosen : false,
    lastResult: result
  };
}

function scoreCardFromCode(code) {
  return scoreBattle.createDeck().find((card) => card.code === code);
}

function tableSummary(table, user) {
  const visibleSeats = table.seats.filter((seat) => !seat.left);
  const humanSeats = visibleSeats.filter((seat) => seat.kind === "human").length;
  const activeSeats = visibleSeats.filter((seat) => !seat.eliminated && seat.stack > 0).length;
  const readySeats = eligibleSeats(table).length;
  const youSeat = table.seats.find((seat) => seat.userId === user.id && !seat.left);
  return {
    id: table.id,
    name: table.name,
    phase: table.phase,
    handNumber: table.handNumber,
    seats: visibleSeats.length,
    humanSeats,
    activeSeats,
    readySeats,
    maxSeats: MAX_SEATS,
    youAreSeated: Boolean(youSeat),
    isHost: table.createdBy === user.id,
    canJoin: Boolean(!youSeat && visibleSeats.length < MAX_SEATS)
  };
}

function tableView(table, user) {
  const youSeat = table.seats.find((seat) => seat.userId === user.id && !seat.left);
  const legal = legalActionsFor(table, youSeat);
  const readySeats = eligibleSeats(table).length;
  const readyHumanSeats = table.seats.filter((seat) => seat.kind === "human" && seat.ready && seat.userId && !seat.left && !seat.eliminated && seat.stack > 0).length;
  const isHost = table.createdBy === user.id;
  const preHand = ["waiting", "showdown", "finished"].includes(table.phase);
  return {
    id: table.id,
    name: table.name,
    hostUserId: table.createdBy,
    isHost,
    phase: table.phase,
    handNumber: table.handNumber,
    smallBlind: SMALL_BLIND,
    bigBlind: BIG_BLIND,
    actionSeconds: ACTION_SECONDS,
    actionDeadline: table.actionDeadline,
    serverNow: Date.now(),
    maxSeats: MAX_SEATS,
    startingStack: STARTING_STACK,
    currentBet: table.currentBet,
    minRaise: table.minRaise,
    pot: totalPot(table),
    community: table.community.map(cardForClient),
    showAll: table.showAll,
    buttonSeatId: table.buttonSeatId,
    actionSeatId: table.actionSeatId,
    youSeatId: youSeat?.seatId || null,
    winnerSeatIds: table.lastWinnerSeatIds || [],
    victoryHandNumber: table.lastVictoryHandNumber || 0,
    seatDeltas: table.lastSeatDeltas || [],
    victoryImage: "/assets/victory-special-effect.gif",
    readySeats,
    readyHumanSeats,
    canLeave: Boolean(youSeat),
    canReady: Boolean(youSeat && !youSeat.eliminated && youSeat.stack > 0 && !(youSeat.inHand && isLivePhase(table.phase))),
    canRebuy: Boolean(youSeat && youSeat.eliminated),
    canAddBot: Boolean(isHost && preHand && table.seats.filter((seat) => !seat.left).length < MAX_SEATS),
    canStart: Boolean(isHost && preHand && readyHumanSeats >= 1 && youSeat && !youSeat.eliminated && youSeat.stack > 0),
    legalActions: legal,
    seats: table.seats.map((seat) => seatForClient(table, seat, youSeat)),
    tomatoEvents: tomatoEventsForClient(table),
    results: table.results,
    messages: table.messages.slice(0, 8)
  };
}

function seatForClient(table, seat, youSeat) {
  const youAreSpectating = !youSeat || !youSeat.inHand || youSeat.folded || youSeat.eliminated || youSeat.sittingOut;
  const visible = seat.inHand && (table.showAll || youAreSpectating || seat.seatId === youSeat?.seatId);
  const avatar = seat.kind === "human" ? (seat.userId ? getUserAvatar(seat.userId) : seat.avatar || "") : "";
  return {
    seatId: seat.seatId,
    kind: seat.kind,
    displayName: seat.displayName,
    avatar,
    stack: seat.stack,
    eliminated: seat.eliminated,
    sittingOut: seat.sittingOut,
    ready: seat.ready,
    left: seat.left,
    inHand: seat.inHand,
    folded: seat.folded,
    allIn: seat.allIn,
    betThisRound: seat.betThisRound,
    handContribution: seat.handContribution,
    winCount: Number(seat.winCount) || 0,
    wonLastHand: Boolean((table.lastWinnerSeatIds || []).includes(seat.seatId) && table.lastVictoryHandNumber === table.handNumber),
    lastDelta: seat.lastResultHandNumber === table.handNumber ? Number(seat.lastDelta) || 0 : 0,
    lastWinAmount: seat.lastResultHandNumber === table.handNumber ? Number(seat.lastWinAmount) || 0 : 0,
    lastResultHandNumber: Number(seat.lastResultHandNumber) || 0,
    isYou: seat.seatId === youSeat?.seatId,
    isHost: seat.userId === table.createdBy,
    isDealer: seat.seatId === table.buttonSeatId,
    isAction: seat.seatId === table.actionSeatId,
    hole: seat.inHand ? (visible ? seat.hole.map(cardForClient) : [cardBack(), cardBack()]) : [],
    bestHand: table.showAll && seat.bestHand ? seat.bestHand.name : null
  };
}

function legalActionsFor(table, seat) {
  if (!seat || seat.seatId !== table.actionSeatId || !isLivePhase(table.phase)) {
    return { active: false };
  }
  const toCall = Math.max(0, table.currentBet - seat.betThisRound);
  const maxTarget = seat.betThisRound + seat.stack;
  const minTarget = table.currentBet === 0 ? Math.min(1, maxTarget) : Math.min(table.currentBet + 1, maxTarget);
  return {
    active: true,
    toCall,
    canCheck: toCall === 0,
    canCall: toCall > 0,
    canRaise: maxTarget > table.currentBet,
    canAllIn: seat.stack > 0,
    minTarget,
    maxTarget,
    currentTarget: Math.max(minTarget, table.currentBet)
  };
}

function cardForClient(card) {
  const displayCode = scoreBattle.displayCode(card);
  return {
    code: card.code,
    displayCode,
    rank: scoreBattle.rankSymbol(card),
    suit: card.suit,
    image: `/cards/${displayCode}.svg`
  };
}

function cardBack() {
  return { code: "BACK", rank: "", suit: "", image: "/cards/BACK.svg" };
}

function sendCardImage(res, fileName) {
  const safeName = path.basename(fileName);
  const ext = path.extname(safeName).toLowerCase();
  if (ext === ".svg") {
    const cardPath = path.join(CARD_DIR, safeName);
    const relative = path.relative(CARD_DIR, cardPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      sendText(res, 403, "text/plain", "Forbidden");
      return;
    }
    fs.readFile(cardPath, (error, data) => {
      if (error) {
        if (ext === ".svg") {
          sendGeneratedCardSvg(res, safeName);
          return;
        }
        sendText(res, 404, "text/plain", "Card not found");
        return;
      }
      sendRaw(res, 200, contentType(cardPath), data, {
        "Cache-Control": "public, max-age=86400"
      });
    });
    return;
  }

  sendGeneratedCardSvg(res, safeName);
}

function sendGeneratedCardSvg(res, safeName) {
  const code = safeName.replace(/\.svg$/i, "");
  const svg = code.toUpperCase() === "BACK" ? cardBackSvg() : cardSvg(code.toUpperCase());
  if (!svg) {
    sendText(res, 404, "image/svg+xml", "");
    return;
  }
  sendText(res, 200, "image/svg+xml; charset=utf-8", svg, {
    "Cache-Control": "public, max-age=86400"
  });
}

function cardSvg(code) {
  if (!/^(?:[2-9TJQKA][SHDC])$/.test(code)) return null;
  const rank = code[0];
  const suit = code[1];
  const red = suit === "H" || suit === "D";
  const color = red ? "#c62828" : "#161a1d";
  const rankMark = rank === "T" ? "10" : rank;
  const suitMark = { S: "&#9824;", H: "&#9829;", D: "&#9830;", C: "&#9827;" }[suit];
  const suitName = { S: "Spades", H: "Hearts", D: "Diamonds", C: "Clubs" }[suit];
  const suitShape = suit === "H"
    ? '<path d="M45 71 C20 48 17 25 35 19 C44 16 52 22 55 29 C58 22 66 16 75 19 C93 25 90 48 65 71 L55 81 Z" />'
    : suit === "D"
      ? '<path d="M55 14 L86 54 L55 94 L24 54 Z" />'
      : suit === "S"
        ? '<path d="M55 15 C28 38 20 52 28 66 C34 77 48 75 53 66 C51 78 47 85 39 93 L71 93 C63 85 59 78 57 66 C62 75 76 77 82 66 C90 52 82 38 55 15 Z" />'
        : '<path d="M45 44 C30 48 20 39 22 26 C25 12 43 11 50 25 C54 8 76 10 79 26 C81 39 70 48 56 44 C60 60 66 73 76 88 L34 88 C44 73 50 60 45 44 Z" />';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 154" role="img" aria-label="${rankMark} of ${suitName}">
  <rect x="2" y="2" width="106" height="150" rx="10" fill="#fffdf7" stroke="#d6d2c8" stroke-width="3"/>
  <text x="12" y="31" font-family="Georgia, serif" font-size="${rankMark === "10" ? 21 : 24}" font-weight="700" fill="${color}">${rankMark}</text>
  <text x="14" y="54" font-family="Georgia, serif" font-size="19" font-weight="700" fill="${color}">${suitMark}</text>
  <g fill="${color}" transform="translate(0 25) scale(1 1)">${suitShape}</g>
  <g transform="translate(110 154) rotate(180)">
    <text x="12" y="31" font-family="Georgia, serif" font-size="${rankMark === "10" ? 21 : 24}" font-weight="700" fill="${color}">${rankMark}</text>
    <text x="14" y="54" font-family="Georgia, serif" font-size="19" font-weight="700" fill="${color}">${suitMark}</text>
  </g>
</svg>`;
}

function cardBackSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 154" role="img" aria-label="Hidden card">
  <rect x="2" y="2" width="106" height="150" rx="10" fill="#f9f5e8" stroke="#d6d2c8" stroke-width="3"/>
  <rect x="12" y="12" width="86" height="130" rx="7" fill="#155c67"/>
  <path d="M24 26 H86 V128 H24 Z" fill="none" stroke="#f2cf63" stroke-width="4"/>
  <path d="M31 37 L79 117 M79 37 L31 117 M55 32 V122 M28 77 H82" stroke="#f9f5e8" stroke-width="3" opacity="0.8"/>
</svg>`;
}

async function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const unsafePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  const relative = path.relative(PUBLIC_DIR, unsafePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    sendText(res, 403, "text/plain", "Forbidden");
    return;
  }

  fs.readFile(unsafePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (indexError, indexData) => {
        if (indexError) sendText(res, 404, "text/plain", "Not found");
        else sendRaw(res, 200, "text/html; charset=utf-8", indexData);
      });
      return;
    }
    sendRaw(res, 200, contentType(unsafePath), data);
  });
}

function sendJson(res, status, data) {
  sendText(res, status, "application/json; charset=utf-8", JSON.stringify(data));
}

function sendText(res, status, type, text, extraHeaders = {}) {
  sendRaw(res, status, type, Buffer.from(text), extraHeaders);
}

function sendRaw(res, status, type, data, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": type,
    "Content-Length": data.length,
    ...extraHeaders
  });
  res.end(data);
}

function setCookie(res, cookie) {
  const existing = res.getHeader("Set-Cookie");
  if (existing) {
    res.setHeader("Set-Cookie", Array.isArray(existing) ? existing.concat(cookie) : [existing, cookie]);
  } else {
    res.setHeader("Set-Cookie", cookie);
  }
}

function getCookie(req, name) {
  const cookies = String(req.headers.cookie || "").split(";").map((item) => item.trim());
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split("=");
    if (key === name) return valueParts.join("=");
  }
  return "";
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > MAX_JSON_BODY_BYTES) {
        const error = new Error("Request body too large");
        error.status = 413;
        reject(error);
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

function ensureDataFiles() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: [] }, null, 2));
  }
}

function writeControlFile() {
  const control = {
    pid: process.pid,
    port: PORT,
    host: HOST,
    root: ROOT,
    shutdownToken,
    startedAt: new Date().toISOString(),
    localUrl: `http://127.0.0.1:${PORT}`
  };
  fs.writeFileSync(CONTROL_FILE, JSON.stringify(control, null, 2));
}

function cleanupControlFile() {
  try {
    if (!fs.existsSync(CONTROL_FILE)) return;
    const control = JSON.parse(fs.readFileSync(CONTROL_FILE, "utf8"));
    if (control.pid === process.pid && control.shutdownToken === shutdownToken) {
      fs.unlinkSync(CONTROL_FILE);
    }
  } catch {
    // Best effort cleanup only.
  }
}

function readUsers() {
  try {
    const parsed = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    if (Array.isArray(parsed.users)) {
      parsed.users.forEach(ensureUserProfile);
      return parsed;
    }
  } catch {
    // Recreate below.
  }
  return { users: [] };
}

function writeUsers() {
  fs.writeFileSync(`${USERS_FILE}.tmp`, JSON.stringify(userDb, null, 2));
  fs.renameSync(`${USERS_FILE}.tmp`, USERS_FILE);
}

function normalizeUsername(raw) {
  const value = String(raw || "").trim().replace(/\s+/g, " ");
  if (!/^[A-Za-z0-9 _-]{2,20}$/.test(value)) return "";
  return value;
}

function compactUsername(value) {
  return String(value || "").toLowerCase().replace(/[\s_-]+/g, "");
}

function containsBlockedUsernameTerm(username) {
  const compact = compactUsername(username);
  return USERNAME_BLOCKLIST.some((term) => compact.includes(term));
}

function blankUserStats() {
  return {
    sessionsPlayed: 0,
    bestPoints: STARTING_STACK,
    bestStars: 0,
    lastPoints: STARTING_STACK,
    lastStars: 0
  };
}

function ensureUserProfile(user) {
  if (!user || typeof user !== "object") return;
  if (typeof user.avatar !== "string") user.avatar = "";
  user.coins = Math.max(0, Number(user.coins) || 0);
  if (typeof user.seenUpdateVersion !== "string") user.seenUpdateVersion = "";
  if (!Array.isArray(user.history)) user.history = [];
  user.history = user.history.slice(0, MAX_HISTORY_ENTRIES);
  if (!user.stats || typeof user.stats !== "object") user.stats = blankUserStats();
  user.stats.sessionsPlayed = Number(user.stats.sessionsPlayed) || 0;
  user.stats.bestPoints = Number.isFinite(Number(user.stats.bestPoints)) ? Number(user.stats.bestPoints) : STARTING_STACK;
  user.stats.bestStars = Number(user.stats.bestStars) || 0;
  user.stats.lastPoints = Number.isFinite(Number(user.stats.lastPoints)) ? Number(user.stats.lastPoints) : STARTING_STACK;
  user.stats.lastStars = Number(user.stats.lastStars) || 0;
}

function isSupportedAvatar(avatar) {
  return /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(avatar);
}

function avatarPresetsForClient() {
  try {
    if (!fs.existsSync(AVATAR_PRESET_DIR)) return [];
    return fs.readdirSync(AVATAR_PRESET_DIR)
      .filter((fileName) => /\.(?:png|jpe?g|webp|gif)$/i.test(fileName))
      .sort((a, b) => a.localeCompare(b))
      .map((fileName) => ({
        name: path.basename(fileName, path.extname(fileName)),
        url: `/avatars/${encodeURIComponent(fileName)}`
      }));
  } catch {
    return [];
  }
}

function getUserAvatar(userId) {
  const user = userDb.users.find((entry) => entry.id === userId);
  if (!user) return "";
  ensureUserProfile(user);
  return user.avatar || "";
}

function recordPlayerExitStats(table, seat) {
  if (!seat || seat.kind !== "human" || !seat.userId || seat.historyRecorded) return;
  if ((Number(seat.recordableSettledHands) || 0) <= 0) return;
  const user = userDb.users.find((entry) => entry.id === seat.userId);
  if (!user) return;

  ensureUserProfile(user);
  const points = Math.max(0, Number(seat.stack) || 0);
  const stars = Math.max(0, Number(seat.winCount) || 0);
  const entry = {
    id: crypto.randomBytes(8).toString("hex"),
    tableId: table.id,
    tableName: table.name,
    handNumber: table.handNumber,
    leftAt: new Date().toISOString(),
    points,
    stars
  };

  user.history.unshift(entry);
  user.history = user.history.slice(0, MAX_HISTORY_ENTRIES);
  user.stats.sessionsPlayed = (Number(user.stats.sessionsPlayed) || 0) + 1;
  user.stats.lastPoints = points;
  user.stats.lastStars = stars;
  user.stats.bestPoints = Math.max(Number(user.stats.bestPoints) || 0, points);
  user.stats.bestStars = Math.max(Number(user.stats.bestStars) || 0, stars);
  seat.historyRecorded = true;
  writeUsers();
}

function cleanTableName(raw) {
  const value = String(raw || "").trim().replace(/\s+/g, " ");
  if (!value) return "";
  return value.slice(0, 32);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getLanAddresses() {
  const addresses = [];
  const nets = os.networkInterfaces();
  for (const details of Object.values(nets)) {
    for (const net of details || []) {
      if (net.family === "IPv4" && !net.internal) addresses.push(net.address);
    }
  }
  return addresses;
}

function isSeatedHuman(table, userId) {
  return table.seats.some((seat) => seat.kind === "human" && seat.userId === userId);
}

function throwHttp(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
