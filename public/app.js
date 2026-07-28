const app = document.querySelector("#app");
const LANG_KEY = "cardgame_point_lang";
const APP_VERSION = "0.0.8";
const UPDATE_NOTICE_KEY = "cardgame_point_seen_update";
const BGM_STORAGE_KEY = "cardgame_point_bgm_enabled";
const BGM_SRC = "/music/Are-you-lost-park-bird.mp3";
const AVATAR_EXPORT_SIZE = 384;
const AVATAR_MAX_DATA_URL_LENGTH = 220 * 1024;
const SCORE_CALC_TOTAL_MS = 7000;
const POLL_INTERVAL_MS = 1200;
const SCORE_TABLE_TRANSIENT_FAILURE_LIMIT = 6;

const zhText = {
  "CardGame Point": "积分卡牌",
  "Mode": "模式",
  "Online": "联机模式",
  "Ready": "准备",
  "Single Player": "单人模式",
  "Later": "稍后开放",
  "Login": "登录",
  "Register": "注册",
  "Name": "用户名",
  "Password": "密码",
  "Remember me": "记住登录状态",
  "Create account": "创建账号",
  "Logout": "退出登录",
  "Tables": "牌桌",
  "Refresh": "刷新",
  "Table name": "牌桌名称",
  "Create": "创建",
  "No tables yet.": "暂无牌桌",
  "Open": "打开",
  "Join": "加入",
  "Watch": "观看",
  "Choose or create a table": "选择或创建一个牌桌",
  "Pot": "底池",
  "Host": "房主",
  "D": "庄",
  "You": "你",
  "CPU": "电脑",
  "Next": "下局",
  "Fold": "弃牌",
  "All in": "全下",
  "Out": "淘汰",
  "Left": "已离开",
  "Stack": "点数",
  "Bet": "下注",
  "Room": "房间",
  "No table selected.": "未选择牌桌",
  "Leave": "退出牌桌",
  "Result": "结算",
  "Status": "状态",
  "Hand": "手牌",
  "Blinds": "盲注",
  "Current bet": "当前下注",
  "Ready seats": "已准备",
  "Log": "记录",
  "Action": "操作",
  "Cancel ready": "取消准备",
  "Add CPU": "添加电脑",
  "Start": "开始",
  "Next hand": "下一手",
  "Waiting": "等待中",
  "Your turn": "轮到你",
  "Check": "过牌",
  "Call": "跟注",
  "Raise": "加注",
  "Playing hand": "牌局中",
  "Watching": "观战中",
  "Watching (ready next hand)": "观战中（已准备下局）",
  "Watching (next hand)": "观战中（下局加入）",
  "Watching (folded)": "观战中（已弃牌）",
  "Watching (eliminated)": "观战中（已淘汰）",
  "Left table": "已离开牌桌"
};

Object.assign(zhText, {
  "Profile": "个人资料",
  "Hide profile": "隐藏资料",
  "Avatar": "头像",
  "Upload avatar": "上传头像",
  "Clear avatar": "清除头像",
  "Change password": "修改密码",
  "Current password": "原密码",
  "New password": "新密码",
  "Confirm new password": "再次输入新密码",
  "Update password": "确认修改",
  "Password updated.": "密码已更新。",
  "Message admin": "给管理员留言",
  "Feedback to admin": "给管理员留言",
  "Do not include personal information.": "请不要留下个人信息。",
  "Feedback is limited to 200 characters.": "留言限制 200 字。",
  "Submit feedback": "提交留言",
  "Feedback sent. Thank you.": "留言已提交，谢谢。",
  "Write a message before submitting feedback.": "请先填写留言内容。",
  "Feedback must be 200 characters or fewer.": "留言不能超过 200 字。",
  "Current password is incorrect.": "原密码不正确。",
  "New passwords do not match.": "两次输入的新密码不一致。",
  "New password must be 4-72 characters.": "新密码长度需为 4-72 个字符。",
  "History": "历史战绩",
  "No history yet.": "暂无历史战绩。",
  "Times left": "退出记录",
  "Best points": "最高点数",
  "Best stars": "最多星星",
  "Latest points": "最近点数",
  "Latest stars": "最近星星",
  "Points": "点数",
  "Stars": "星星",
  "That name contains a blocked word.": "用户名包含禁用词。",
  "That account name is not allowed.": "该账号名不允许登录。",
  "Use PNG, JPEG, WebP, or GIF for the avatar.": "请使用 PNG、JPEG、WebP 或 GIF 头像。",
  "Avatar image is too large.": "头像图片过大。",
  "Version": "版本",
  "Update 0.0.1": "0.0.1 更新内容",
  "Update history": "历史更新",
  "Password changes and admin feedback are available from Profile.": "个人资料中已加入修改密码和给管理员留言功能。",
  "Account popups now keep typed text while the table refreshes.": "修改密码和留言窗口在牌桌刷新时会保留正在输入的内容。",
  "Score Battle hosts can now add CPU players.": "积分对战房主现在可以添加 CPU 玩家。",
  "Got it": "知道了",
  "Tables that stay unstarted for 5 minutes now close automatically.": "创建后 5 分钟仍未开始牌局的牌桌会自动关闭。",
  "History now records only hands where you joined betting and reached settlement.": "历史记录现在只记录已参与下注且已完成结算的牌局结果。",
  "The update notice appears once for each account after a new version is released.": "版本更新提示会在每个账号更新后首次登录时显示一次。"
});

Object.assign(zhText, {
  "Update 0.0.2": "0.0.2 更新内容",
  "Last hand winners now have gold stars.": "上一局获胜者的星星会显示为金色。",
  "Seat result markers show Victory plus won points, or red lost points, after settlement.": "每局结算后，座位上会显示 Victory 与赢得点数，或红色扣除点数。",
  "Eliminated players can use Try again to restore 100 points for the next hand.": "被淘汰玩家可以点击再来一次，恢复 100 点并等待下一局。",
  "Avatar uploads are compressed locally before being saved.": "头像上传会先在本地压缩后保存。",
  "Try again": "再来一次",
  "You still have points.": "你仍有点数。",
  "Victory": "Victory"
});

Object.assign(zhText, {
  "Point tables": "积分牌桌",
  "Score Battle": "\u79ef\u5206\u5bf9\u6218",
  "Three rounds. Build the highest total.": "\u4e09\u4e2a\u56de\u5408\uff0c\u79ef\u7d2f\u6700\u9ad8\u603b\u5206\u3002",
  "Five rounds. Build the highest total.": "\u4e94\u4e2a\u56de\u5408\uff0c\u79ef\u7d2f\u6700\u9ad8\u603b\u5206\u3002",
  "Score tables": "\u79ef\u5206\u5bf9\u6218\u724c\u684c",
  "Score table name": "\u79ef\u5206\u724c\u684c\u540d\u79f0",
  "Start score battle": "\u5f00\u59cb\u79ef\u5206\u5bf9\u6218",
  "Next score battle": "\u4e0b\u4e00\u5c40\u79ef\u5206\u5bf9\u6218",
  "Ready for score battle": "\u51c6\u5907\u53c2\u52a0",
  "Cancel score battle ready": "\u53d6\u6d88\u51c6\u5907",
  "Choose or create a score battle table": "\u9009\u62e9\u6216\u521b\u5efa\u79ef\u5206\u5bf9\u6218\u724c\u684c",
  "Watch score battle": "\u89c2\u6218\u79ef\u5206\u5bf9\u6218",
  "Join score battle": "\u52a0\u5165\u79ef\u5206\u5bf9\u6218",
  "Round": "\u56de\u5408",
  "Total": "\u603b\u5206",
  "Score": "\u5206\u6570",
  "Coins": "\u91d1\u5e01",
  "Effect selection": "\u7279\u6548\u9009\u62e9",
  "Choose one effect": "\u9009\u62e9\u4e00\u5f20\u7279\u6548\u724c",
  "Effect locked": "\u5df2\u9009\u5b9a\u7279\u6548",
  "Discard": "\u5f03\u724c",
  "Discard selected": "\u5f03\u7f6e\u5df2\u9009\u724c",
  "Discard uses left": "\u5269\u4f59\u5f03\u724c\u6b21\u6570",
  "Play cards": "\u51fa\u724c",
  "Submit play": "\u786e\u8ba4\u51fa\u724c",
  "One-click play": "一键出牌",
  "Choosing best play": "正在计算最佳出牌",
  "Choose one FATE before playing.": "出牌前必须选择一个 FATE。",
  "Choose one of two FATE cards": "从两个 FATE 中选择一个",
  "FATE is required in round 1.": "第一回合必须选择一个 FATE。",
  "Roll dice": "掷骰子",
  "Rolls left": "剩余投掷",
  "Dice": "骰子",
  "Misfortune": "厄运",
  "Short successes": "\u505a\u7a7a\u6210\u529f\u6b21\u6570",
  "Long successes": "\u505a\u591a\u6210\u529f\u6b21\u6570",
  "Choose prediction target": "选择预测目标",
  "Collected hands": "已收藏牌型",
  "FATE locked": "已选择 FATE",
  "Choose exactly 5 cards": "\u8bf7\u9009\u62e9\u6b63\u597d 5 \u5f20\u724c",
  "Selected for discard": "\u5df2\u9009\u5f03\u724c",
  "Selected to play": "\u5df2\u9009\u51fa\u724c",
  "Waiting for other players": "\u7b49\u5f85\u5176\u4ed6\u73a9\u5bb6",
  "Playing": "\u51fa\u724c\u4e2d",
  "Submitted": "\u5df2\u51fa\u724c",
  "Spectating": "\u89c2\u6218\u4e2d",
  "Round result": "\u672c\u56de\u5408\u7ed3\u7b97",
  "Final standings": "\u6700\u7ec8\u6392\u540d",
  "Automatic": "\u8d85\u65f6\u81ea\u52a8\u51fa\u724c",
  "High Card": "\u9ad8\u724c",
  "One Pair": "\u4e00\u5bf9",
  "Two Pair": "\u4e24\u5bf9",
  "Three of a Kind": "\u4e09\u6761",
  "Straight": "\u987a\u5b50",
  "Flush": "\u540c\u82b1",
  "Full House": "\u846b\u82a6",
  "Four of a Kind": "\u56db\u6761",
  "Straight Flush": "\u540c\u82b1\u987a",
  "effect-select": "\u9009\u62e9\u7279\u6548",
  "play-select": "\u9009\u62e9\u51fa\u724c",
  "round-result": "\u56de\u5408\u7ed3\u7b97"
});

Object.assign(zhText, {
  "Update 0.0.3": "0.0.3 \u66f4\u65b0\u5185\u5bb9",
  "Update 0.0.4": "0.0.4 \u66f4\u65b0\u5185\u5bb9",
  "Update 0.0.5": "0.0.5 \u66f4\u65b0\u5185\u5bb9",
  "Update 0.0.6": "0.0.6 更新内容",
  "Round 1 now uses the required two-choice FATE build system.": "第一回合加入必须二选一的 FATE 构筑系统。",
  "One-click play automatically submits the highest-scoring valid hand with your selected effect.": "新增一键出牌，会根据已选择特效自动打出预计得分最高的有效五张牌。",
  "Score Battle now shows every player's played cards, with community cards highlighted.": "\u79ef\u5206\u5bf9\u6218\u73b0\u5728\u4f1a\u5c55\u793a\u6bcf\u4f4d\u73a9\u5bb6\u6253\u51fa\u7684\u5177\u4f53\u724c\uff0c\u5e76\u9ad8\u4eae\u5176\u4e2d\u7684\u516c\u5171\u724c\u3002",
  "Score plays must include at least one community card, and hand sizes are now 3 / 4 / 5.": "\u51fa\u724c\u5fc5\u987b\u81f3\u5c11\u5305\u542b\u4e00\u5f20\u516c\u5171\u724c\uff0c\u4e09\u56de\u5408\u624b\u724c\u6570\u6539\u4e3a 3 / 4 / 5\u3002",
  "Score Battle choices now have two-minute timers and clearer scoring animations.": "\u79ef\u5206\u5bf9\u6218\u7684\u9009\u7279\u6548\u548c\u51fa\u724c\u65f6\u95f4\u6539\u4e3a 2 \u5206\u949f\uff0c\u5e76\u52a0\u5165\u66f4\u6e05\u6670\u7684\u8ba1\u5206\u52a8\u753b\u3002",
  "Scoring rules can be opened from the table side panel.": "\u53f3\u4fa7\u9762\u677f\u73b0\u5728\u53ef\u4ee5\u6253\u5f00\u724c\u578b\u8ba1\u5206\u89c4\u5219\u3002",
  "Score Battle now previews your selected five-card score before submission.": "\u79ef\u5206\u5bf9\u6218\u73b0\u5728\u4f1a\u5728\u51fa\u724c\u524d\u9884\u89c8\u5df2\u9009 5 \u5f20\u724c\u7684\u5f97\u5206\u3002",
  "Score Battle results are now saved into profile history with full standings.": "\u79ef\u5206\u5bf9\u6218\u7ed3\u679c\u73b0\u5728\u4f1a\u5199\u5165\u4e2a\u4eba\u6218\u7ee9\uff0c\u5e76\u5305\u542b\u5168\u5458\u6392\u540d\u548c\u603b\u5206\u3002",
  "Version 0.0.4 keeps the five-round effect mode and records each player's total score.": "0.0.4 \u4fdd\u7559\u4e94\u56de\u5408\u7279\u6548\u6a21\u5f0f\uff0c\u5e76\u8bb0\u5f55\u6bcf\u4f4d\u73a9\u5bb6\u7684\u603b\u5206\u3002",
  "Tomato throws are now available at tables, with shared flight and splat animations.": "\u73b0\u5728\u53ef\u4ee5\u5728\u724c\u684c\u4e2d\u5411\u5176\u4ed6\u73a9\u5bb6\u4e22\u756a\u8304\uff0c\u6240\u6709\u73a9\u5bb6\u90fd\u80fd\u770b\u5230\u98de\u884c\u548c\u7838\u4e2d\u52a8\u753b\u3002",
  "Score Battle effects received balance adjustments.": "\u79ef\u5206\u5bf9\u6218\u7279\u6548\u5df2\u8fdb\u884c\u5e73\u8861\u6027\u8c03\u6574\u3002",
  "Table polling is faster, so clicks and shared effects should feel more responsive.": "\u724c\u684c\u5237\u65b0\u9891\u7387\u5df2\u63d0\u9ad8\uff0c\u70b9\u51fb\u64cd\u4f5c\u548c\u591a\u4eba\u540c\u6b65\u6548\u679c\u4f1a\u66f4\u7075\u654f\u3002",
  "Traditional card-table mode has been removed; the app now focuses on Score Battle.": "已移除传统牌桌模式，应用现在专注于积分对战。",
  "New critical, discard, and comeback effects are available in Score Battle.": "积分对战加入新的暴击、弃牌与追分特效。",
  "This build is prepared for GitHub backup and future internet deployment.": "本版本已为 GitHub 备份和后续互联网部署做准备。",
  "Selected cards": "\u5df2\u9009\u724c",
  "Must include community card": "\u5fc5\u987b\u5305\u542b\u516c\u5171\u724c",
  "Community card": "\u516c\u5171\u724c",
  "Played cards": "\u5df2\u51fa\u724c",
  "Scoring detail": "\u8ba1\u5206\u660e\u7ec6",
  "Score preview": "\u5f97\u5206\u9884\u89c8",
  "Estimated score": "\u9884\u8ba1\u5f97\u5206",
  "Preview unavailable": "\u6682\u65e0\u9884\u89c8",
  "Score Battle history": "\u79ef\u5206\u5bf9\u6218\u6218\u7ee9",
  "Rank": "\u6392\u540d",
  "Total score": "\u603b\u5206",
  "Standings": "\u6392\u540d",
  "Loading": "\u8ba1\u7b97\u4e2d",
  "Throw tomato": "\u4e22\u756a\u8304",
  "Card chips": "\u724c\u9762\u70b9\u6570",
  "Base chips": "\u57fa\u7840\u70b9\u6570",
  "Effect bonus": "\u7279\u6548\u52a0\u6210",
  "Chip total": "\u70b9\u6570\u5408\u8ba1",
  "Hand multiplier": "\u724c\u578b\u500d\u7387",
  "Final score": "\u6700\u7ec8\u5f97\u5206",
  "No effect": "\u65e0\u7279\u6548",
  "Scoring rules": "\u8ba1\u5206\u89c4\u5219",
  "Close": "\u5173\u95ed",
  "Hand type": "\u724c\u578b",
  "Multiplier": "\u500d\u7387",
  "Effect cards": "\u7279\u6548\u724c",
  "Rules note": "\u89c4\u5219\u8bf4\u660e",
  "Choose five cards from your hand and the community board. At least one card must be a community card.": "\u4ece\u81ea\u5df1\u7684\u624b\u724c\u548c\u516c\u5171\u724c\u4e2d\u9009\u62e9 5 \u5f20\uff0c\u5176\u4e2d\u5fc5\u987b\u81f3\u5c11\u5305\u542b 1 \u5f20\u516c\u5171\u724c\u3002",
  "Round hand sizes refill to 3, 4, and 5 cards. Unplayed hand cards stay for the next round.": "\u4e09\u4e2a\u56de\u5408\u4f1a\u5c06\u624b\u724c\u8865\u81f3 3\u30014\u30015 \u5f20\uff0c\u672a\u6253\u51fa\u7684\u624b\u724c\u4fdd\u7559\u5230\u4e0b\u4e00\u56de\u5408\u3002"
});

Object.assign(zhText, {
  "Optional effect": "\u53ef\u9009\u7279\u6548",
  "You may play without choosing an effect.": "\u53ef\u4ee5\u4e0d\u9009\u7279\u6548\u76f4\u63a5\u51fa\u724c\u3002",
  "Played hand cards are removed for the rest of the game. Each player has three discard uses per game.": "\u6253\u51fa\u7684\u624b\u724c\u5728\u672c\u5c40\u5185\u79fb\u9664\uff0c\u6bcf\u4f4d\u73a9\u5bb6\u6bcf\u5c40\u5171\u6709 3 \u6b21\u5f03\u724c\u673a\u4f1a\u3002",
  "Round hand sizes refill to 3, 4, 5, 5, and 5 cards. Unplayed hand cards stay for the next round.": "\u4e94\u4e2a\u56de\u5408\u4f1a\u5c06\u624b\u724c\u8865\u81f3 3\u30014\u30015\u30015\u30015 \u5f20\uff0c\u672a\u6253\u51fa\u7684\u624b\u724c\u4fdd\u7559\u5230\u4e0b\u4e00\u56de\u5408\u3002",
  "Played hand cards are removed for the rest of the game. Each player has four discard uses per game.": "\u6253\u51fa\u7684\u624b\u724c\u5728\u672c\u5c40\u5185\u79fb\u9664\uff0c\u6bcf\u4f4d\u73a9\u5bb6\u6bcf\u5c40\u5171\u6709 4 \u6b21\u5f03\u724c\u673a\u4f1a\u3002",
  "Current round leader": "\u672c\u56de\u5408\u6682\u65f6\u9886\u5148",
  "Previous round leader": "\u4e0a\u56de\u5408\u6700\u9ad8\u5206",
  "Score turn": "\u884c\u52a8\u4e2d",
  "Current turn": "\u5f53\u524d\u884c\u52a8",
  "Waiting for your turn": "\u7b49\u5f85\u8f6e\u5230\u4f60\u884c\u52a8",
  "Your score battle turn": "\u8f6e\u5230\u4f60\u884c\u52a8",
  "Discard any number of selected hand cards.": "\u53ef\u5f03\u7f6e\u4efb\u610f\u6570\u91cf\u7684\u5df2\u9009\u624b\u724c\u3002",
  "Countdown": "\u5012\u8ba1\u65f6",
  "Cancel": "\u53d6\u6d88",
  "Confirm effect": "\u786e\u8ba4\u7279\u6548",
  "Target": "\u76ee\u6807",
  "Choose two hand cards in order.": "\u6309\u987a\u5e8f\u9009\u62e9\u4e24\u5f20\u624b\u724c\u3002",
  "Choose one hand card and one community card.": "\u9009\u62e9\u4e00\u5f20\u624b\u724c\u548c\u4e00\u5f20\u516c\u5171\u724c\u3002",
  "Choose one community card.": "\u9009\u62e9\u4e00\u5f20\u516c\u5171\u724c\u3002",
  "Choose two hand cards and one target player.": "\u9009\u62e9\u4e24\u5f20\u624b\u724c\u548c\u4e00\u4f4d\u76ee\u6807\u73a9\u5bb6\u3002",
  "Choose effect targets.": "\u9009\u62e9\u7279\u6548\u76ee\u6807\u3002"
});

Object.assign(zhText, {
  "Only cards that make the scored hand contribute base chips; other played cards only score through specific effect bonuses.": "只有凑出当前牌型的牌会贡献基础点数；其他已出牌只有在特定特效加成时才会得分。",
  "Not part of scoring hand": "不参与牌型计分",
  "Bonus only": "仅特效加成",
  "Crit rate": "暴击率",
  "Table chat": "牌桌聊天",
  "No chat messages yet.": "暂无聊天消息。",
  "Message table": "在牌桌内聊天",
  "Send": "发送",
  "Only seated players can chat.": "只有入座玩家可以聊天。",
  "Player": "玩家",
  "Write a message before sending.": "请先输入聊天内容。",
  "Chat messages must be 200 characters or fewer.": "聊天内容不能超过 200 字。",
  "Score Battle table chat is now available from the right panel.": "积分对战牌桌右侧面板已加入聊天栏。",
  "Balance tuning and scoring logic now count only cards that form the made hand, unless an effect adds bonus chips.": "平衡性和计分逻辑已调整：只有凑出牌型的牌计入基础点数，除非特定特效提供额外加成。",
  "Persistent effects and each player's current crit rate are visible on the table.": "牌桌上现在会显示每位玩家的持续特效和当前暴击率。",
  "Tomatoes can now be thrown only during another player's turn in Score Battle.": "积分对战中，现在只能在其他玩家的出牌回合投掷番茄。"
});

Object.assign(zhText, {
  "Password changes are available from Profile, and admin feedback is available from the main page.": "\u4fee\u6539\u5bc6\u7801\u4ecd\u5728\u4e2a\u4eba\u8d44\u6599\u4e2d\uff0c\u7ed9\u7ba1\u7406\u5458\u7559\u8a00\u5df2\u79fb\u81f3\u4e3b\u9875\u9762\u3002",
  "Balance tuning and scoring logic update.": "\u5e73\u8861\u6027\u8c03\u6574\u4e0e\u8ba1\u5206\u903b\u8f91\u4fee\u6539",
  "Base scoring now only counts cards that form the made hand, unless a specific effect adds bonus chips.": "\u5e95\u5c42\u903b\u8f91\u4e2d\u76ee\u524d\u53ea\u6709\u51d1\u51fa\u7684\u724c\u578b\u7684\u724c\u624d\u8ba1\u5206\uff0c\u9664\u975e\u6709\u7279\u5b9a\u7279\u6548\u52a0\u6210\u3002",
  "Attack speed": "\u653b\u901f",
  "Crit bonus": "\u66b4\u51fb\u52a0\u6210",
  "Expected crit": "\u66b4\u51fb\u671f\u671b"
});

Object.assign(zhText, {
  "Update 0.0.8": "0.0.8 \u66f4\u65b0\u5185\u5bb9",
  "Music on": "\u97f3\u4e50\u5df2\u5f00\u542f",
  "Music off": "\u97f3\u4e50\u5df2\u5173\u95ed",
  "Music playback could not start.": "\u80cc\u666f\u97f3\u4e50\u65e0\u6cd5\u5f00\u59cb\u64ad\u653e\u3002",
  "Second deck": "\u7b2c\u4e8c\u5e45\u724c",
  "Hover or tap to view cards": "\u5c06\u9f20\u6807\u79fb\u5165\u6216\u70b9\u51fb\u67e5\u770b\u51fa\u724c",
  "Your rank": "\u4f60\u7684\u6392\u540d",
  "Try again?": "\u518d\u8bd5\u4e00\u6b21\uff1f",
  "Sealed": "\u5df2\u5c01\u5370",
  "Personal decks now refresh when exhausted, and replacement cards from a refreshed deck are marked as Second deck.": "\u4e2a\u4eba\u724c\u5e93\u8017\u5c3d\u540e\u4f1a\u81ea\u52a8\u5237\u65b0\uff0c\u5237\u65b0\u540e\u7684\u66ff\u6362\u724c\u4f1a\u6807\u8bb0\u4e3a\u7b2c\u4e8c\u5e45\u724c\u3002",
  "Turns now last 120 seconds, with updated FATE and Rambo balance.": "\u6bcf\u4f4d\u73a9\u5bb6\u7684\u51fa\u724c\u65f6\u95f4\u5ef6\u957f\u81f3 120 \u79d2\uff0c\u5e76\u8c03\u6574\u4e86 FATE \u4e0e\u7ea2\u6e29\u706b\u70e4\u3002",
  "Other players' cards are hidden until hovered or tapped, and table controls now share one row.": "\u5176\u4ed6\u73a9\u5bb6\u7684\u5177\u4f53\u51fa\u724c\u6539\u4e3a\u79fb\u5165\u6216\u70b9\u51fb\u540e\u67e5\u770b\uff0c\u4e09\u4e2a\u51fa\u724c\u6309\u94ae\u73b0\u5728\u540c\u884c\u663e\u793a\u3002",
  "Background music and a post-game rank prompt are now available.": "\u65b0\u589e\u5faa\u73af\u80cc\u666f\u97f3\u4e50\u5f00\u5173\u4e0e\u8d25\u65b9\u6392\u540d\u63d0\u793a\u3002",
  "Discard uses have no total cap. If a personal deck runs out, it refreshes without community or retained hand cards; replacements are marked Second deck.": "\u5f03\u724c\u603b\u6b21\u6570\u4e0d\u8bbe\u4e0a\u9650\u3002\u4e2a\u4eba\u724c\u5e93\u8017\u5c3d\u65f6\uff0c\u4f1a\u6392\u9664\u516c\u5171\u724c\u548c\u4fdd\u7559\u624b\u724c\u540e\u5237\u65b0\uff0c\u66ff\u6362\u724c\u6807\u8bb0\u4e3a\u7b2c\u4e8c\u5e45\u724c\u3002",
  "Each score-battle turn lasts 120 seconds.": "\u79ef\u5206\u5bf9\u6218\u6bcf\u4e2a\u51fa\u724c\u56de\u5408\u9650\u65f6 120 \u79d2\u3002",
  "The Giant uses a 1.3x/50% burden, while Defense Stance now shares the FATE row.": "\u5de8\u4eba\u8d1f\u62c5\u6539\u4e3a\u6700\u4f4e\u56de\u5408\u5206\u7684 1.3 \u500d\u6216\u6700\u9ad8\u56de\u5408\u5206\u7684 50%\uff0c\u9632\u5fa1\u59ff\u6001\u6309\u94ae\u73b0\u4e0e FATE \u540c\u884c\u663e\u793a\u3002",
  "One randomly selected Royal Flush suit wins instantly; its icon appears beside the round counter.": "\u6bcf\u5c40\u968f\u673a\u9009\u4e2d\u4e00\u79cd\u82b1\u8272\u7684\u7687\u5bb6\u540c\u82b1\u987a\u53ef\u7acb\u5373\u83b7\u80dc\uff0c\u5bf9\u5e94\u56fe\u6807\u663e\u793a\u5728\u56de\u5408\u6570\u65c1\u3002",
  "Winning Royal Flush suit": "\u53ef\u7acb\u5373\u83b7\u80dc\u7684\u7687\u5bb6\u540c\u82b1\u987a\u82b1\u8272",
  "Defense Stance": "\u9632\u5fa1\u59ff\u6001",
  "Use Defense Stance": "\u4f7f\u7528\u9632\u5fa1\u59ff\u6001",
  "Defense active": "\u9632\u5fa1\u59ff\u6001\u751f\u6548\u4e2d",
  "Defense used": "\u9632\u5fa1\u59ff\u6001\u5df2\u4f7f\u7528"
});

Object.assign(zhText, {
  "Collected hands": "\u5df2\u6536\u85cf\u724c\u578b",
  "None yet": "\u6682\u65e0",
  "Damage dealt": "\u9020\u6210\u4f24\u5bb3",
  "Ignore The Giant's burden this round.": "\u672c\u56de\u5408\u514d\u9664\u5de8\u4eba\u8d1f\u62c5\u3002"
});

const zhPhase = {
  waiting: "等待中",
  preflop: "翻牌前",
  flop: "翻牌圈",
  turn: "转牌圈",
  river: "河牌圈",
  showdown: "摊牌",
  finished: "已结束"
};

const zhRank = {
  Ace: "A",
  King: "K",
  Queen: "Q",
  Jack: "J",
  Ten: "10",
  Nine: "9",
  Eight: "8",
  Seven: "7",
  Six: "6",
  Five: "5",
  Four: "4",
  Three: "3",
  Two: "2",
  Aces: "A",
  Kings: "K",
  Queens: "Q",
  Jacks: "J",
  Tens: "10",
  Nines: "9",
  Eights: "8",
  Sevens: "7",
  Sixes: "6",
  Fives: "5",
  Fours: "4",
  Threes: "3",
  Twos: "2"
};

const state = {
  user: null,
  authMode: "login",
  lang: readSavedLanguage(),
  mode: "score",
  currentTableId: null,
  tables: [],
  table: null,
  currentScoreTableId: null,
  scoreTables: [],
  scoreTable: null,
  profile: null,
  showProfile: false,
  showPasswordModal: false,
  showFeedbackModal: false,
  passwordDraft: { oldPassword: "", newPassword: "", confirmPassword: "" },
  feedbackDraft: "",
  feedbackComposing: false,
  feedbackRenderQueued: false,
  error: "",
  busy: false,
  pollTimer: null,
  polling: false,
  createTableName: "",
  createScoreTableName: "",
  raiseTargets: {},
  rememberLogin: false,
  seenVictoryKey: "",
  victoryEffectUntil: 0,
  victoryEffectSrc: "",
  victoryEffectTimer: null,
  seenRoyalVictoryKey: "",
  royalVictoryAnimation: null,
  royalVictoryTimer: null,
  showUpdateNotice: false,
  showUpdateHistory: false,
  updateHistoryScroll: 0,
  showBattleRules: false,
  battleSelections: [],
  battleEffectTarget: null,
  battleScorePreview: null,
  battleScorePreviewKey: "",
  battleScorePreviewLoading: false,
  battleAutoPlayBusy: false,
  battleFateBusy: false,
  battleSelectionKey: "",
  battleCommunityKey: "",
  battleCommunityCards: [],
  battleCommunityAnimation: null,
  battleCommunityTimer: null,
  battleScoreSeenKeys: new Set(),
  tomatoSeenKeys: new Set(),
  battleScoreQueue: [],
  battleScoreOverlay: null,
  battleScoreOverlayTimer: null,
  scoreChatDrafts: {},
  scoreChatScrolls: {},
  scoreChatStickToBottom: {},
  backgroundMusicEnabled: readSavedBackgroundMusic(),
  seenScoreLossKeys: new Set(),
  scoreLossDialog: null,
  scoreTableRefreshFailures: 0
};

boot();

function readSavedLanguage() {
  try {
    return localStorage.getItem(LANG_KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function saveLanguage() {
  try {
    localStorage.setItem(LANG_KEY, state.lang);
  } catch {
    // Language persistence is a convenience only.
  }
}

function readSavedBackgroundMusic() {
  try {
    return localStorage.getItem(BGM_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function backgroundMusicPlayer() {
  let audio = document.querySelector("#background-music-player");
  if (audio) return audio;
  audio = document.createElement("audio");
  audio.id = "background-music-player";
  audio.src = BGM_SRC;
  audio.loop = true;
  audio.preload = "auto";
  document.body.appendChild(audio);
  return audio;
}

async function syncBackgroundMusic() {
  const audio = backgroundMusicPlayer();
  if (!state.backgroundMusicEnabled) {
    audio.pause();
    audio.currentTime = 0;
    return;
  }
  await audio.play();
}

async function toggleBackgroundMusic() {
  state.backgroundMusicEnabled = !state.backgroundMusicEnabled;
  try {
    localStorage.setItem(BGM_STORAGE_KEY, String(state.backgroundMusicEnabled));
  } catch {
    // Music preference persistence is optional.
  }
  try {
    await syncBackgroundMusic();
  } catch {
    state.backgroundMusicEnabled = false;
    state.error = t("Music playback could not start.");
    try {
      localStorage.setItem(BGM_STORAGE_KEY, "false");
    } catch {
      // Ignore storage failures.
    }
  }
  render();
}

function toggleLanguage() {
  state.lang = state.lang === "zh" ? "en" : "zh";
  saveLanguage();
  render();
}

function setGameMode(mode) {
  state.mode = "score";
  state.error = "";
  render();
}

function isZh() {
  return state.lang === "zh";
}

function t(text) {
  return isZh() ? (zhText[text] || text) : text;
}

function phaseText(phase) {
  return isZh() ? (zhPhase[phase] || phase) : phase;
}

function tableLabel(table) {
  if (table.youAreSeated) return t("Open");
  if (table.canJoin) return t("Join");
  return t("Watch");
}

function tableMeta(table) {
  if (!isZh()) {
    return `${table.phase} | hand ${table.handNumber} | ${table.seats}/${table.maxSeats} seats | ${table.readySeats} ready`;
  }
  return `${phaseText(table.phase)} | 第 ${table.handNumber} 手牌 | ${table.seats}/${table.maxSeats} 座位 | ${table.readySeats} 已准备`;
}

function seatStateText(seat) {
  if (seat.left) return t("Left table");
  if (seat.inHand && !seat.folded && !seat.eliminated) return t("Playing hand");
  if (seat.eliminated) return t("Watching (eliminated)");
  if (seat.folded) return t("Watching (folded)");
  if (seat.ready) return t("Watching (ready next hand)");
  if (seat.sittingOut) return t("Watching (next hand)");
  return t("Watching");
}

function seatStateClass(seat) {
  if (seat.left || seat.eliminated) return "seat-state out";
  if (seat.inHand && !seat.folded) return "seat-state playing";
  return "seat-state watching";
}

function displayError(message) {
  if (!message || !isZh()) return message || "";
  const direct = {
    "Please log in first.": "请先登录。",
    "Name or password is incorrect.": "用户名或密码不正确。",
    "That name is already registered.": "该用户名已经被注册。",
    "Only the table host can start the hand.": "只有房主可以开始牌局。",
    "Only the table host can add computer players.": "只有房主可以添加电脑玩家。",
    "It is not your turn.": "还没有轮到你行动。",
    "A hand is already running.": "当前牌局仍在进行中。",
    "At least one human player must be ready.": "至少需要一名真人玩家准备。",
    "The table is full.": "牌桌已满。"
  };
  return direct[message] || zhText[message] || translateLine(message);
}

function translateLine(line) {
  if (!isZh() || !line) return line;

  const patterns = [
    [/^(.+) opened the table\.$/, "$1 创建了牌桌。"],
    [/^(.+) joined the table\.$/, "$1 加入了牌桌。"],
    [/^(.+) joined and is waiting for the next hand\.$/, "$1 加入了牌桌，将从下一手开始。"],
    [/^(.+) took an empty seat\.$/, "$1 坐到了空座位。"],
    [/^Hand (\d+) started\. Blinds are (\d+)\/(\d+)\.$/, "第 $1 手牌开始。盲注为 $2/$3。"],
    [/^(.+) is ready\.$/, "$1 已准备。"],
    [/^(.+) is not ready\.$/, "$1 取消准备。"],
    [/^(.+) folded\.$/, "$1 弃牌。"],
    [/^(.+) checked\.$/, "$1 过牌。"],
    [/^(.+) called\.$/, "$1 跟注。"],
    [/^(.+) called (\d+)\.$/, "$1 跟注 $2。"],
    [/^(.+) bet (\d+)\.$/, "$1 下注 $2。"],
    [/^(.+) raised to (\d+)\.$/, "$1 加注到 $2。"],
    [/^(.+) timed out and checked\.$/, "$1 超时，自动过牌。"],
    [/^(.+) timed out and automatically called (\d+)\.$/, "$1 超时，自动跟注 $2。"],
    [/^(.+) left the table\.$/, "$1 退出了牌桌。"],
    [/^(.+) left the table and folded\.$/, "$1 退出牌桌并弃牌。"],
    [/^(.+) is now the table host\.$/, "$1 成为新的房主。"],
    [/^(.+) is out of points and is watching\.$/, "$1 点数归零，进入观战。"],
    [/^All human players are out of points at this table\.$/, "本桌所有真人玩家都已没有点数。"],
    [/^No human players have points left at this table\.$/, "本桌没有仍有点数的真人玩家。"]
  ];

  for (const [pattern, replacement] of patterns) {
    if (pattern.test(line)) return line.replace(pattern, replacement);
  }

  const dealt = {
    "Flop dealt.": "翻牌圈发牌。",
    "Turn dealt.": "转牌圈发牌。",
    "River dealt.": "河牌圈发牌。"
  };
  if (dealt[line]) return dealt[line];

  let match = line.match(/^(.+) wins (\d+) with (.+)\.$/);
  if (match) return `${match[1]} 赢得 ${match[2]} 点，牌型为${translateHand(match[3])}。`;
  match = line.match(/^(.+) wins (\d+) points after everyone else folded\.$/);
  if (match) return `其他玩家均已弃牌，${match[1]} 赢得 ${match[2]} 点。`;
  return line;
}

function translateHand(hand) {
  if (!isZh()) return hand;
  let match = hand.match(/^(.+)-high Straight Flush$/);
  if (match) return `${rankText(match[1])}高同花顺`;
  match = hand.match(/^(.+)-high Straight$/);
  if (match) return `${rankText(match[1])}高顺子`;
  match = hand.match(/^Flush, (.+)-high$/);
  if (match) return `同花（${rankText(match[1])}高）`;
  match = hand.match(/^High Card, (.+)-high$/);
  if (match) return `高牌（${rankText(match[1])}高）`;
  match = hand.match(/^One Pair, (.+)$/);
  if (match) return `一对${rankText(match[1])}`;
  match = hand.match(/^Two Pair, (.+) and (.+)$/);
  if (match) return `两对（${rankText(match[1])}和${rankText(match[2])}）`;
  match = hand.match(/^Three of a Kind, (.+)$/);
  if (match) return `三条${rankText(match[1])}`;
  match = hand.match(/^Full House, (.+) over (.+)$/);
  if (match) return `葫芦（${rankText(match[1])}带${rankText(match[2])}）`;
  match = hand.match(/^Four of a Kind, (.+)$/);
  if (match) return `四条${rankText(match[1])}`;
  return hand
    .replace("Straight Flush", "同花顺")
    .replace("Straight", "顺子")
    .replace("Flush", "同花")
    .replace("Full House", "葫芦")
    .replace("Four of a Kind", "四条")
    .replace("Three of a Kind", "三条")
    .replace("Two Pair", "两对")
    .replace("One Pair", "一对")
    .replace("High Card", "高牌");
}

function rankText(rank) {
  return zhRank[rank] || rank;
}

function starText(count) {
  return "\u2605".repeat(Math.max(0, Number(count) || 0));
}

function initials(name) {
  const clean = String(name || "?").trim();
  const match = clean.match(/[A-Za-z0-9]/);
  return (match ? match[0] : clean[0] || "?").toUpperCase();
}

function avatarNode(src, name, className) {
  const classes = `avatar ${className || ""}`.trim();
  if (src) {
    return el("img", {
      className: classes,
      src,
      alt: name || t("Avatar"),
      draggable: false
    });
  }
  return el("div", {
    className: `${classes} avatar-fallback`,
    "aria-label": name || t("Avatar")
  }, [initials(name)]);
}

function canThrowTomato(mode, seat) {
  const table = mode === "score" ? state.scoreTable : state.table;
  if (!state.user || !table || !seat || seat.isYou || seat.left) return false;
  if (mode === "score") {
    return table.phase === "play-select" && Boolean(table.currentTurnSeatId) && table.currentTurnSeatId !== table.youSeatId;
  }
  return Boolean(table.youSeatId);
}

function tomatoButton(mode, seat) {
  if (!canThrowTomato(mode, seat)) return "";
  return el("button", {
    className: "tomato-button",
    type: "button",
    title: t("Throw tomato"),
    "aria-label": `${t("Throw tomato")}: ${seat.displayName}`,
    onclick: (event) => {
      event.stopPropagation();
      throwTomato(mode, seat.seatId);
    }
  }, [el("span", { "aria-hidden": "true" })]);
}

async function throwTomato(mode, targetSeatId) {
  const table = mode === "score" ? state.scoreTable : state.table;
  if (!table || !targetSeatId) return;
  const base = mode === "score" ? "score-tables" : "tables";
  try {
    const response = await api(`/api/${base}/${table.id}/tomato`, {
      method: "POST",
      body: { targetSeatId }
    });
    if (mode === "score") setCurrentScoreTable(response.table);
    else setCurrentTable(response.table);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

function queueTomatoEvents(table, mode) {
  if (!table || !Array.isArray(table.tomatoEvents)) return;
  for (const event of table.tomatoEvents) {
    const key = `${mode}:${table.id}:${event.id}`;
    if (state.tomatoSeenKeys.has(key)) continue;
    state.tomatoSeenKeys.add(key);
    window.setTimeout(() => playTomatoEvent(event, mode), 0);
  }
}

function tomatoOverlayHost() {
  let host = document.querySelector("#tomato-overlay-host");
  if (!host) {
    host = el("div", { id: "tomato-overlay-host", "aria-hidden": "true" });
    document.body.appendChild(host);
  }
  return host;
}

function seatAvatarCenter(mode, seatId) {
  const selector = `[data-seat-mode="${mode}"][data-seat-id="${seatId}"] .seat-avatar`;
  const avatar = document.querySelector(selector);
  if (!avatar) return null;
  const rect = avatar.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    size: Math.max(rect.width, rect.height)
  };
}

function playTomatoEvent(event, mode) {
  const from = seatAvatarCenter(mode, event.fromSeatId);
  const to = seatAvatarCenter(mode, event.toSeatId);
  if (!from || !to) return;
  const host = tomatoOverlayHost();
  const size = Math.max(28, Math.min(72, to.size || 44));
  const node = el("div", {
    className: "tomato-animation",
    style: `--from-x:${from.x}px;--from-y:${from.y}px;--to-x:${to.x}px;--to-y:${to.y}px;--splat-size:${size}px;`
  }, [
    el("span", { className: "tomato-projectile" }),
    el("img", {
      className: "tomato-splat",
      src: "/assets/crushed-tomato.png",
      alt: "",
      draggable: false
    })
  ]);
  host.appendChild(node);
  window.setTimeout(() => node.remove(), 4100);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(isZh() ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function updateNoticeStorageKey() {
  return `${UPDATE_NOTICE_KEY}:${state.user?.id || "guest"}`;
}

function hasSeenCurrentUpdate() {
  if (!state.user) return true;
  if (Object.prototype.hasOwnProperty.call(state.user, "seenUpdateVersion")) {
    return state.user.seenUpdateVersion === APP_VERSION;
  }
  try {
    return localStorage.getItem(updateNoticeStorageKey()) === APP_VERSION;
  } catch {
    return false;
  }
}

function maybeShowUpdateNotice() {
  state.showUpdateNotice = Boolean(state.user && !hasSeenCurrentUpdate());
}

async function dismissUpdateNotice() {
  try {
    localStorage.setItem(updateNoticeStorageKey(), APP_VERSION);
  } catch {
    // The dialog can still be dismissed when localStorage is unavailable.
  }
  try {
    const response = await api("/api/profile/update-notice", {
      method: "POST",
      body: { version: APP_VERSION }
    });
    state.user = response.user;
  } catch {
    // A transient write failure should not trap the player in the dialog.
  }
  state.showUpdateNotice = false;
  render();
}

async function boot() {
  await refreshMe();
  maybeShowUpdateNotice();
  if (state.user) await refreshProfile(false);
  await refreshScoreTables();
  render();
  if (state.backgroundMusicEnabled) syncBackgroundMusic().catch(() => {});
  startPolling();
}

function startPolling() {
  if (state.pollTimer) clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    if (!state.user || state.polling) return;
    state.polling = true;
    try {
      if (state.currentScoreTableId) await refreshScoreTable(false);
      await refreshScoreTables(false);
      render();
    } finally {
      state.polling = false;
    }
  }, POLL_INTERVAL_MS);
}

async function refreshMe() {
  const response = await api("/api/me");
  state.user = response.user;
}

async function refreshProfile(showError = true) {
  if (!state.user) return;
  try {
    const response = await api("/api/profile");
    state.profile = response.profile;
  } catch (error) {
    if (showError) state.error = error.message;
  }
}

async function refreshTables(showError = true) {
  if (!state.user) return;
  try {
    const response = await api("/api/tables");
    state.tables = response.tables;
  } catch (error) {
    if (showError) state.error = error.message;
  }
}

async function refreshTable(showError = true) {
  if (!state.currentTableId) return;
  try {
    const response = await api(`/api/tables/${state.currentTableId}`);
    setCurrentTable(response.table);
  } catch (error) {
    if (showError) state.error = error.message;
    state.currentTableId = null;
    clearCurrentTable();
  }
}

function setCurrentTable(table) {
  state.table = table;
  queueTomatoEvents(table, "holdem");
  handleVictoryEffect(table);
}

async function refreshScoreTables(showError = true) {
  if (!state.user) return;
  try {
    const response = await api("/api/score-tables");
    state.scoreTables = response.tables;
  } catch (error) {
    if (showError) state.error = error.message;
  }
}

async function refreshScoreTable(showError = true) {
  if (!state.currentScoreTableId) return;
  try {
    const response = await api(`/api/score-tables/${state.currentScoreTableId}`);
    state.scoreTableRefreshFailures = 0;
    setCurrentScoreTable(response.table);
  } catch (error) {
    if (showError) state.error = error.message;
    if (isConfirmedMissingScoreTable(error) || showError) {
      state.currentScoreTableId = null;
      clearCurrentScoreTable();
      return;
    }
    state.scoreTableRefreshFailures += 1;
    if (state.scoreTableRefreshFailures >= SCORE_TABLE_TRANSIENT_FAILURE_LIMIT) {
      state.currentScoreTableId = null;
      clearCurrentScoreTable();
    }
  }
}

function isConfirmedMissingScoreTable(error) {
  return Number(error?.status) === 404 && error?.message === "Score battle table not found.";
}

function setCurrentScoreTable(table) {
  state.scoreTableRefreshFailures = 0;
  const previousCommunityKey = state.battleCommunityKey;
  const previousCommunityCards = state.battleCommunityCards;
  const communityKey = `${table.id}:${table.gameNumber}:${table.round}:${(table.community || []).map((card) => card.displayCode || card.code).join("-")}`;
  if (
    previousCommunityKey &&
    previousCommunityKey.startsWith(`${table.id}:`) &&
    previousCommunityKey !== communityKey &&
    previousCommunityCards.length === 5 &&
    (table.community || []).length === 5
  ) {
    startBattleCommunityAnimation(previousCommunityCards, table.community, table.id, table.round);
  }
  state.battleCommunityKey = communityKey;
  state.battleCommunityCards = table.community || [];
  state.scoreTable = table;
  const key = `${table.id}:${table.gameNumber}:${table.round}:${table.phase}:${table.currentTurnSeatId || ""}`;
  if (state.battleSelectionKey !== key) {
    state.battleSelectionKey = key;
    state.battleSelections = [];
    state.battleEffectTarget = null;
  }
  const you = table.seats.find((seat) => seat.isYou);
  const availableCodes = new Set([...(you?.hand || []), ...(table.community || [])].map((card) => card.code));
  state.battleSelections = state.battleSelections.filter((code) => availableCodes.has(code));
  if (state.battleEffectTarget) {
    state.battleEffectTarget.cardTargets = state.battleEffectTarget.cardTargets.filter((entry) => availableCodes.has(entry.code));
    const effectStillAvailable = (you?.effectOptions || []).some((effect) => effect.id === state.battleEffectTarget.effectId);
    if (!effectStillAvailable || !you?.isScoreTurn) state.battleEffectTarget = null;
  }
  queueBattleScoreOverlays(table);
  queueTomatoEvents(table, "score");
  handleRoyalVictoryAnimation(table);
  handleScoreVictoryEffect(table);
  handleScoreLossDialog(table);
  requestBattleScorePreview();
}

function clearCurrentScoreTable() {
  state.scoreTable = null;
  state.scoreTableRefreshFailures = 0;
  state.battleSelectionKey = "";
  state.battleSelections = [];
  state.battleEffectTarget = null;
  state.battleScorePreview = null;
  state.battleScorePreviewKey = "";
  state.battleScorePreviewLoading = false;
  state.battleAutoPlayBusy = false;
  state.battleFateBusy = false;
  state.battleCommunityKey = "";
  state.battleCommunityCards = [];
  state.battleCommunityAnimation = null;
  state.battleScoreSeenKeys.clear();
  state.battleScoreQueue = [];
  state.battleScoreOverlay = null;
  state.scoreLossDialog = null;
  state.victoryEffectUntil = 0;
  state.victoryEffectSrc = "";
  state.royalVictoryAnimation = null;
  if (state.battleCommunityTimer) {
    clearTimeout(state.battleCommunityTimer);
    state.battleCommunityTimer = null;
  }
  if (state.battleScoreOverlayTimer) {
    clearTimeout(state.battleScoreOverlayTimer);
    state.battleScoreOverlayTimer = null;
  }
  if (state.victoryEffectTimer) {
    clearTimeout(state.victoryEffectTimer);
    state.victoryEffectTimer = null;
  }
  if (state.royalVictoryTimer) {
    clearTimeout(state.royalVictoryTimer);
    state.royalVictoryTimer = null;
  }
  renderBattleScoreOverlayHost();
}

function startBattleCommunityAnimation(fromCards, toCards, tableId, round) {
  state.battleCommunityAnimation = {
    from: fromCards,
    to: toCards,
    tableId,
    round,
    startedAt: Date.now(),
    duration: 1700
  };
  window.setTimeout(render, 460);
  window.setTimeout(render, 900);
  if (state.battleCommunityTimer) clearTimeout(state.battleCommunityTimer);
  state.battleCommunityTimer = window.setTimeout(() => {
    state.battleCommunityAnimation = null;
    state.battleCommunityTimer = null;
    render();
  }, 1750);
}

function queueBattleScoreOverlays(table) {
  if (!table || !Array.isArray(table.seats)) return;
  for (const seat of table.seats) {
    if (!seat.isYou || !seat.lastResult) continue;
    const cardKey = (seat.lastResult.cards || []).map((card) => card.code).join("-");
    const key = `${table.id}:${table.gameNumber}:${table.round}:${seat.seatId}:${seat.lastResult.score}:${cardKey}`;
    if (state.battleScoreSeenKeys.has(key)) continue;
    state.battleScoreSeenKeys.add(key);
    state.battleScoreQueue.push({
      key,
      round: table.round,
      displayName: seat.displayName,
      result: seat.lastResult
    });
  }
  if (!state.battleScoreOverlay) showNextBattleScoreOverlay();
}

function handleScoreVictoryEffect(table) {
  if (!table || !table.victoryGameNumber || !Array.isArray(table.winnerSeatIds)) return;
  if (Number(table.royalVictory?.gameNumber) === Number(table.victoryGameNumber)) return;
  if (!table.youSeatId || !table.winnerSeatIds.includes(table.youSeatId)) return;
  const key = `score:${table.id}:${table.victoryGameNumber}:${table.winnerSeatIds.join(",")}`;
  if (state.seenVictoryKey === key) return;
  state.seenVictoryKey = key;
  state.victoryEffectSrc = table.victoryImage || "/assets/victory-special-effect.gif";
  state.victoryEffectUntil = Date.now() + 2600;
  if (state.victoryEffectTimer) clearTimeout(state.victoryEffectTimer);
  state.victoryEffectTimer = setTimeout(() => {
    state.victoryEffectUntil = 0;
    state.victoryEffectSrc = "";
    state.victoryEffectTimer = null;
    render();
  }, 2700);
}

function handleRoyalVictoryAnimation(table) {
  const victory = table?.royalVictory;
  if (!victory?.gameNumber || !victory.winnerSeatId || !Array.isArray(victory.cards) || victory.cards.length !== 5) return;
  const key = `royal:${table.id}:${victory.gameNumber}:${victory.winnerSeatId}`;
  if (state.seenRoyalVictoryKey === key) return;
  state.seenRoyalVictoryKey = key;
  if (state.royalVictoryTimer) clearTimeout(state.royalVictoryTimer);
  if (state.battleScoreOverlayTimer) clearTimeout(state.battleScoreOverlayTimer);
  state.battleScoreOverlayTimer = null;
  state.battleScoreQueue = [];
  state.battleScoreOverlay = null;
  state.royalVictoryAnimation = {
    key,
    tableId: table.id,
    winnerName: victory.winnerName || victory.winnerSeatId,
    cards: victory.cards.map((card) => ({ ...card })),
    startedAt: Date.now(),
    duration: 6200
  };
  renderBattleScoreOverlayHost();
  state.royalVictoryTimer = window.setTimeout(() => {
    if (state.royalVictoryAnimation?.key === key) state.royalVictoryAnimation = null;
    state.royalVictoryTimer = null;
    render();
  }, 6250);
}

function showNextBattleScoreOverlay() {
  if (state.battleScoreOverlayTimer) {
    clearTimeout(state.battleScoreOverlayTimer);
    state.battleScoreOverlayTimer = null;
  }
  state.battleScoreOverlay = state.battleScoreQueue.shift() || null;
  if (!state.battleScoreOverlay) {
    renderBattleScoreOverlayHost();
    return;
  }
  state.battleScoreOverlayTimer = window.setTimeout(() => {
    state.battleScoreOverlay = null;
    showNextBattleScoreOverlay();
  }, SCORE_CALC_TOTAL_MS);
  renderBattleScoreOverlayHost();
}

function clearCurrentTable() {
  state.table = null;
  state.victoryEffectUntil = 0;
  state.victoryEffectSrc = "";
  if (state.victoryEffectTimer) {
    clearTimeout(state.victoryEffectTimer);
    state.victoryEffectTimer = null;
  }
}

function handleVictoryEffect(table) {
  if (!table || !table.victoryHandNumber || !Array.isArray(table.winnerSeatIds)) return;
  if (!table.youSeatId || !table.winnerSeatIds.includes(table.youSeatId)) return;
  const key = `${table.id}:${table.victoryHandNumber}:${table.winnerSeatIds.join(",")}`;
  if (state.seenVictoryKey === key) return;
  state.seenVictoryKey = key;
  state.victoryEffectSrc = table.victoryImage || "/assets/victory-special-effect.gif";
  state.victoryEffectUntil = Date.now() + 2600;
  if (state.victoryEffectTimer) clearTimeout(state.victoryEffectTimer);
  state.victoryEffectTimer = setTimeout(() => {
    state.victoryEffectUntil = 0;
    state.victoryEffectSrc = "";
    state.victoryEffectTimer = null;
    render();
  }, 2700);
}

function snapshotFocus() {
  const active = document.activeElement;
  if (!active || !["INPUT", "TEXTAREA"].includes(active.tagName)) return null;
  const field = active.getAttribute("data-field");
  if (!field) return null;
  let start = null;
  let end = null;
  try {
    start = active.selectionStart;
    end = active.selectionEnd;
  } catch {
    // Number inputs do not always expose text selection.
  }
  return { field, start, end };
}

function restoreFocus(focus) {
  if (!focus) return;
  const input = app.querySelector(`[data-field="${focus.field}"]`);
  if (!input) return;
  input.focus({ preventScroll: true });
  if (focus.start !== null && focus.end !== null) {
    try {
      input.setSelectionRange(focus.start, focus.end);
    } catch {
      // Ignore selection restore for number inputs.
    }
  }
}

function render() {
  if (state.feedbackComposing) {
    state.feedbackRenderQueued = true;
    return;
  }
  const focus = snapshotFocus();
  app.innerHTML = "";
  if (!state.user) {
    app.appendChild(renderHome());
    appendVictoryEffect();
    appendUpdateNotice();
    appendUpdateHistoryModal();
    renderBattleRulesModalHost();
    restoreFocus(focus);
    return;
  }
  app.appendChild(renderApp());
  appendVictoryEffect();
  appendUpdateNotice();
  appendUpdateHistoryModal();
  appendAccountModals();
  appendScoreLossDialog();
  renderBattleRulesModalHost();
  restoreFocus(focus);
}

function appendVictoryEffect() {
  if (!state.victoryEffectSrc || Date.now() >= state.victoryEffectUntil) return;
  app.appendChild(el("div", { className: "victory-effect", "aria-hidden": "true" }, [
    el("img", {
      className: "victory-effect-img",
      src: state.victoryEffectSrc,
      alt: "",
      draggable: false
    })
  ]));
}

function handleScoreLossDialog(table) {
  if (!table || table.phase !== "finished" || !table.youSeatId || !Array.isArray(table.standings)) return;
  const standing = table.standings.find((entry) => entry.seatId === table.youSeatId);
  if (!standing || Number(standing.rank) <= 1) return;
  const key = `${table.id}:${table.gameNumber}:${table.youSeatId}:${standing.rank}`;
  if (state.seenScoreLossKeys.has(key)) return;
  state.seenScoreLossKeys.add(key);
  state.scoreLossDialog = {
    key,
    tableId: table.id,
    gameNumber: table.gameNumber,
    rank: Number(standing.rank) || "-"
  };
}

function appendScoreLossDialog() {
  const dialog = state.scoreLossDialog;
  if (!dialog || !state.user) return;
  app.appendChild(el("div", { className: "modal-backdrop score-loss-backdrop", role: "presentation" }, [
    el("section", { className: "update-modal score-loss-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "score-loss-title" }, [
      el("button", {
        className: "ghost modal-close",
        type: "button",
        onclick: dismissScoreLossDialog,
        "aria-label": t("Close")
      }, ["x"]),
      el("span", { className: "pill" }, [t("Final standings")]),
      el("h2", { id: "score-loss-title" }, [`${t("Your rank")}: ${dialog.rank}`]),
      el("button", { type: "button", onclick: tryScoreBattleAgain }, [t("Try again?")])
    ])
  ]));
}

function dismissScoreLossDialog() {
  state.scoreLossDialog = null;
  render();
}

async function tryScoreBattleAgain() {
  const dialog = state.scoreLossDialog;
  state.scoreLossDialog = null;
  if (dialog && state.scoreTable?.id === dialog.tableId && state.scoreTable?.canReady) {
    await setScoreReady(true);
    return;
  }
  render();
}

function appendUpdateNotice() {
  if (!state.user || !state.showUpdateNotice) return;
  app.appendChild(el("div", { className: "modal-backdrop", role: "presentation" }, [
    el("section", { className: "update-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "update-title" }, [
      el("div", { className: "modal-head" }, [
        el("div", {}, [
          el("span", { className: "pill" }, [`${t("Version")} ${APP_VERSION}`]),
          el("h2", { id: "update-title" }, [t(`Update ${APP_VERSION}`)])
        ]),
        el("button", { className: "ghost modal-close", type: "button", onclick: dismissUpdateNotice, "aria-label": t("Got it") }, ["x"])
      ]),
      el("ul", { className: "update-list" }, [
        el("li", {}, [t("Personal decks now refresh when exhausted, and replacement cards from a refreshed deck are marked as Second deck.")]),
        el("li", {}, [t("Turns now last 120 seconds, with updated FATE and Rambo balance.")]),
        el("li", {}, [t("Other players' cards are hidden until hovered or tapped, and table controls now share one row.")]),
        el("li", {}, [t("Background music and a post-game rank prompt are now available.")]),
        el("li", {}, [t("Round 1 now uses the required two-choice FATE build system.")]),
        el("li", {}, [t("One-click play automatically submits the highest-scoring valid hand with your selected effect.")]),
        el("li", {}, [t("Password changes are available from Profile, and admin feedback is available from the main page.")]),
        el("li", {}, [t("Account popups now keep typed text while the table refreshes.")]),
        el("li", {}, [t("Score Battle table chat is now available from the right panel.")]),
        el("li", {}, [t("Balance tuning and scoring logic update.")]),
        el("li", {}, [t("Base scoring now only counts cards that form the made hand, unless a specific effect adds bonus chips.")]),
        el("li", {}, [t("Tomatoes can now be thrown only during another player's turn in Score Battle.")]),
        el("li", {}, [t("Balance tuning and scoring logic now count only cards that form the made hand, unless an effect adds bonus chips.")]),
        el("li", {}, [t("Traditional card-table mode has been removed; the app now focuses on Score Battle.")]),
        el("li", {}, [t("New critical, discard, and comeback effects are available in Score Battle.")]),
        el("li", {}, [t("This build is prepared for GitHub backup and future internet deployment.")])
      ]),
      el("button", { type: "button", onclick: dismissUpdateNotice }, [t("Got it")])
    ])
  ]));
}

function updateHistoryEntries() {
  return [
    {
      version: "0.0.8",
      items: [
        "Personal decks now refresh when exhausted, and replacement cards from a refreshed deck are marked as Second deck.",
        "Turns now last 120 seconds, with updated FATE and Rambo balance.",
        "Other players' cards are hidden until hovered or tapped, and table controls now share one row.",
        "Background music and a post-game rank prompt are now available.",
        "The Giant uses a 1.3x/50% burden, while Defense Stance now shares the FATE row.",
        "One randomly selected Royal Flush suit wins instantly; its icon appears beside the round counter."
      ]
    },
    {
      version: "0.0.6",
      items: [
        "Round 1 now uses the required two-choice FATE build system.",
        "One-click play automatically submits the highest-scoring valid hand with your selected effect.",
        "Password changes are available from Profile, and admin feedback is available from the main page.",
        "Account popups now keep typed text while the table refreshes.",
        "Score Battle hosts can now add CPU players.",
        "Score Battle table chat is now available from the right panel.",
        "Balance tuning and scoring logic update.",
        "Base scoring now only counts cards that form the made hand, unless a specific effect adds bonus chips.",
        "Tomatoes can now be thrown only during another player's turn in Score Battle.",
        "Balance tuning and scoring logic now count only cards that form the made hand, unless an effect adds bonus chips.",
        "Persistent effects and each player's current crit rate are visible on the table.",
        "Traditional card-table mode has been removed; the app now focuses on Score Battle.",
        "New critical, discard, and comeback effects are available in Score Battle.",
        "This build is prepared for GitHub backup and future internet deployment."
      ]
    },
    {
      version: "0.0.5",
      items: [
        "Score Battle now previews your selected five-card score before submission.",
        "Score Battle results are now saved into profile history with full standings.",
        "Tomato throws are now available at tables, with shared flight and splat animations.",
        "Score Battle effects received balance adjustments.",
        "Table polling is faster, so clicks and shared effects should feel more responsive."
      ]
    },
    {
      version: "0.0.4",
      items: [
        "Version 0.0.4 keeps the five-round effect mode and records each player's total score.",
        "Scoring rules can be opened from the table side panel.",
        "Score Battle choices now have two-minute timers and clearer scoring animations."
      ]
    },
    {
      version: "0.0.3",
      items: [
        "Score Battle now shows every player's played cards, with community cards highlighted.",
        "Score plays must include at least one community card, and hand sizes are now 3 / 4 / 5."
      ]
    },
    {
      version: "0.0.2",
      items: [
        "Last hand winners now have gold stars.",
        "Seat result markers show Victory plus won points, or red lost points, after settlement.",
        "Eliminated players can use Try again to restore 100 points for the next hand.",
        "Avatar uploads are compressed locally before being saved."
      ]
    },
    {
      version: "0.0.1",
      items: [
        "Tables that stay unstarted for 5 minutes now close automatically.",
        "History now records only hands where you joined betting and reached settlement.",
        "The update notice appears once for each account after a new version is released."
      ]
    }
  ];
}

function openUpdateHistory() {
  state.showUpdateHistory = true;
  render();
}

function closeUpdateHistory() {
  state.showUpdateHistory = false;
  state.updateHistoryScroll = 0;
  render();
}

function appendUpdateHistoryModal() {
  if (!state.showUpdateHistory) return;
  const modal = el("section", {
    className: "update-modal update-history-modal",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "update-history-title",
    onscroll: (event) => {
      state.updateHistoryScroll = event.currentTarget.scrollTop;
    }
  }, [
    el("div", { className: "modal-head" }, [
      el("div", {}, [
        el("span", { className: "pill" }, [t("Version")]),
        el("h2", { id: "update-history-title" }, [t("Update history")])
      ]),
      el("button", { className: "ghost modal-close", type: "button", onclick: closeUpdateHistory, "aria-label": t("Close") }, ["x"])
    ]),
    ...updateHistoryEntries().map((entry) => el("section", { className: "update-history-section" }, [
      el("h3", {}, [t(`Update ${entry.version}`)]),
      el("ul", { className: "update-list" }, entry.items.map((item) => el("li", {}, [t(item)])))
    ])),
    el("button", { type: "button", onclick: closeUpdateHistory }, [t("Close")])
  ]);
  app.appendChild(el("div", { className: "modal-backdrop", role: "presentation" }, [modal]));
  requestAnimationFrame(() => {
    modal.scrollTop = state.updateHistoryScroll || 0;
  });
}

function appendAccountModals() {
  appendPasswordModal();
  appendFeedbackModal();
}

function closePasswordModal() {
  state.showPasswordModal = false;
  state.passwordDraft = { oldPassword: "", newPassword: "", confirmPassword: "" };
  render();
}

function closeFeedbackModal() {
  state.showFeedbackModal = false;
  state.feedbackDraft = "";
  state.feedbackComposing = false;
  state.feedbackRenderQueued = false;
  render();
}

function appendPasswordModal() {
  if (!state.user || !state.showPasswordModal) return;
  const draft = state.passwordDraft || { oldPassword: "", newPassword: "", confirmPassword: "" };
  const oldPasswordInput = el("input", {
    type: "password",
    value: draft.oldPassword,
    "data-field": "account-old-password",
    autocomplete: "current-password",
    required: true,
    oninput: () => {
      state.passwordDraft.oldPassword = oldPasswordInput.value;
    }
  });
  const newPasswordInput = el("input", {
    type: "password",
    value: draft.newPassword,
    "data-field": "account-new-password",
    autocomplete: "new-password",
    required: true,
    minlength: "4",
    maxlength: "72",
    oninput: () => {
      state.passwordDraft.newPassword = newPasswordInput.value;
    }
  });
  const confirmPasswordInput = el("input", {
    type: "password",
    value: draft.confirmPassword,
    "data-field": "account-confirm-password",
    autocomplete: "new-password",
    required: true,
    minlength: "4",
    maxlength: "72",
    oninput: () => {
      state.passwordDraft.confirmPassword = confirmPasswordInput.value;
    }
  });
  const submitButton = el("button", { type: "submit" }, [t("Update password")]);
  const form = el("form", {
    className: "form-grid",
    onsubmit: async (event) => {
      event.preventDefault();
      const oldPassword = oldPasswordInput.value;
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      if (newPassword !== confirmPassword) {
        alert(t("New passwords do not match."));
        return;
      }
      if (newPassword.length < 4 || newPassword.length > 72) {
        alert(t("New password must be 4-72 characters."));
        return;
      }
      submitButton.disabled = true;
      try {
        await api("/api/profile/password", {
          method: "POST",
          body: { oldPassword, newPassword, confirmPassword }
        });
        alert(t("Password updated."));
        closePasswordModal();
      } catch (error) {
        alert(displayError(error.message));
      } finally {
        submitButton.disabled = false;
      }
    }
  }, [
    el("label", {}, [el("span", {}, [t("Current password")]), oldPasswordInput]),
    el("label", {}, [el("span", {}, [t("New password")]), newPasswordInput]),
    el("label", {}, [el("span", {}, [t("Confirm new password")]), confirmPasswordInput]),
    submitButton
  ]);

  app.appendChild(el("div", { className: "modal-backdrop", role: "presentation" }, [
    el("section", { className: "update-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "password-title" }, [
      el("div", { className: "modal-head" }, [
        el("div", {}, [
          el("span", { className: "pill" }, [t("Profile")]),
          el("h2", { id: "password-title" }, [t("Change password")])
        ]),
        el("button", { className: "ghost modal-close", type: "button", onclick: closePasswordModal, "aria-label": t("Close") }, ["x"])
      ]),
      form
    ])
  ]));
}

function appendFeedbackModal() {
  if (!state.user || !state.showFeedbackModal) return;
  const feedbackText = state.feedbackDraft || "";
  const counter = el("span", { className: "meta" }, [`${feedbackText.length} / 200`]);
  const messageInput = el("textarea", {
    rows: "5",
    maxlength: "200",
    required: true,
    value: feedbackText,
    "data-field": "account-feedback-message",
    placeholder: t("Do not include personal information."),
    oninput: () => {
      state.feedbackDraft = messageInput.value;
      counter.textContent = `${messageInput.value.length} / 200`;
    },
    oncompositionstart: () => {
      state.feedbackComposing = true;
    },
    oncompositionend: () => {
      state.feedbackDraft = messageInput.value;
      counter.textContent = `${messageInput.value.length} / 200`;
      state.feedbackComposing = false;
      if (state.feedbackRenderQueued) {
        state.feedbackRenderQueued = false;
        render();
      }
    }
  });
  const submitButton = el("button", { type: "submit" }, [t("Submit feedback")]);
  const form = el("form", {
    className: "form-grid",
    onsubmit: async (event) => {
      event.preventDefault();
      const message = messageInput.value.trim();
      if (!message) {
        alert(t("Write a message before submitting feedback."));
        return;
      }
      if (message.length > 200) {
        alert(t("Feedback must be 200 characters or fewer."));
        return;
      }
      submitButton.disabled = true;
      try {
        await api("/api/feedback", {
          method: "POST",
          body: { message }
        });
        alert(t("Feedback sent. Thank you."));
        closeFeedbackModal();
      } catch (error) {
        alert(displayError(error.message));
      } finally {
        submitButton.disabled = false;
      }
    }
  }, [
    el("p", { className: "meta" }, [t("Do not include personal information.")]),
    el("label", {}, [el("span", {}, [t("Feedback is limited to 200 characters.")]), messageInput]),
    counter,
    submitButton
  ]);

  app.appendChild(el("div", { className: "modal-backdrop", role: "presentation" }, [
    el("section", { className: "update-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "feedback-title" }, [
      el("div", { className: "modal-head" }, [
        el("div", {}, [
          el("span", { className: "pill" }, [t("Message admin")]),
          el("h2", { id: "feedback-title" }, [t("Feedback to admin")])
        ]),
        el("button", { className: "ghost modal-close", type: "button", onclick: closeFeedbackModal, "aria-label": t("Close") }, ["x"])
      ]),
      form
    ])
  ]));
}

function scoreOverlayHost() {
  let host = document.querySelector("#score-overlay-host");
  if (!host) {
    host = el("div", { id: "score-overlay-host" });
    document.body.appendChild(host);
  }
  return host;
}

function renderBattleScoreOverlayHost() {
  const host = scoreOverlayHost();
  host.innerHTML = "";
  const overlayNode = buildBattleScoreOverlay();
  if (overlayNode) host.appendChild(overlayNode);
}

function renderScoreCalcCardValue(value = {}) {
  const bonuses = Array.isArray(value.bonuses) ? value.bonuses : [];
  const criticalBonus = bonuses.find((bonus) => bonus.kind === "critical-hit");
  const otherBonus = bonuses
    .filter((bonus) => bonus.kind !== "critical-hit")
    .reduce((sum, bonus) => sum + Number(bonus.amount || 0), 0);
  const bonusText = otherBonus === 0 ? "" : ` ${otherBonus > 0 ? "+" : "-"} ${formatCompactNumber(Math.abs(otherBonus))}`;
  const beforeCritical = (Number(value.finalChips) || 0) - Number(criticalBonus?.amount || 0);
  const subtotal = formatCompactNumber(beforeCritical);
  const detail = `${t("Base chips")} ${formatCompactNumber(value.baseChips ?? 0)}${bonusText} = ${subtotal}`;
  const kickerText = value.scoresHand === false
    ? (isZh() ? "踢脚牌贡献（点数 40%）" : "Kicker contribution (40%)")
    : "";
  return el("div", { className: "score-calc-card-notes" }, [
    el("span", { className: "score-calc-card-chip" }, [detail]),
    kickerText ? el("span", { className: "score-calc-card-chip is-muted" }, [kickerText]) : "",
    criticalBonus ? el("span", { className: `score-calc-card-chip ${criticalBonus.critical ? "is-crit" : "is-expected-crit"}` }, [
      `${t(criticalBonus.critical ? "Crit bonus" : "Expected crit")} +${formatCompactNumber(criticalBonus.amount)}`
    ]) : ""
  ]);
}

function buildBattleScoreOverlay() {
  const overlay = state.battleScoreOverlay;
  if (!overlay || !overlay.result) return null;
  const result = overlay.result;
  const valueByCode = new Map((result.cardValues || []).map((entry) => [entry.code, entry]));
  const cardSteps = (result.cards || []).map((card, index) => {
    const value = valueByCode.get(card.code) || {};
    const bonus = (value.bonuses || []).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const bonusText = bonus === 0 ? "" : ` ${bonus > 0 ? "+" : "-"} ${Math.abs(bonus)}`;
    const scoringText = value.scoresHand === false ? (isZh() ? "（踢脚牌贡献 40%）" : " (Kicker contribution 40%)") : "";
    return el("li", { className: "calc-step", style: `--step-index: ${index}` }, [
      el("span", {}, [card.displayCode || value.displayCode || card.code]),
      el("span", {}, [`${t("Base chips")} ${value.baseChips ?? 0}${bonusText} = ${value.finalChips ?? 0}${scoringText}`])
    ]);
  });
  const multiplierText = battleMultiplierFormula(result);
  const scoreBonusTotal = (result.scoreBonuses || []).reduce((sum, bonus) => sum + Number(bonus.amount || 0), 0);
  const scoreFactorText = (result.scoreFactors || []).length
    ? ` x ${(result.scoreFactors || []).map((entry) => entry.factor).join(" x ")}`
    : "";
  const finalScoreFactorText = (result.finalScoreFactors || []).length
    ? ` x ${(result.finalScoreFactors || []).map((entry) => entry.factor).join(" x ")}`
    : "";
  const chipFactorText = (result.chipFactors || []).length
    ? `${result.chipTotalBeforeFactors ?? result.chips} x ${(result.chipFactors || []).map((entry) => entry.factor).join(" x ")} = ${result.chips}`
    : `${result.chips}`;
  const scoreFormulaBeforeFinalFactors = scoreBonusTotal || scoreFactorText
    ? `${result.chips} x ${result.multiplier}${scoreFactorText}${scoreBonusTotal ? ` + ${scoreBonusTotal}` : ""} = ${result.score}`
    : `${result.chips} x ${result.multiplier} = ${result.score}`;
  const scoreFormula = finalScoreFactorText
    ? `(${result.chips} x ${result.multiplier}${scoreFactorText})${finalScoreFactorText}${scoreBonusTotal ? ` + ${scoreBonusTotal}` : ""} = ${result.score}`
    : scoreFormulaBeforeFinalFactors;

  return el("div", { className: "score-calc-backdrop", role: "presentation" }, [
    el("section", { className: "score-calc-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "score-calc-title" }, [
      el("div", { className: "score-calc-head" }, [
        el("span", { className: "pill" }, [`${t("Round")} ${overlay.round}`]),
        el("h2", { id: "score-calc-title" }, [`${overlay.displayName} - ${t("Scoring detail")}`]),
        el("span", { className: "pill" }, [result.automatic ? t("Automatic") : t("Submitted")])
      ]),
      el("div", { className: "score-calc-cards" }, (result.cards || []).map((card, index) => el("div", {
        className: "score-calc-card-wrap",
        style: `--card-index: ${index}`
      }, [
        renderBattleCard(card, "result", state.scoreTable, {
          extraClass: card.source === "community" ? "is-community-played" : ""
        }),
        renderScoreCalcCardValue(valueByCode.get(card.code) || {})
      ]))),
      el("div", { className: "score-calc-effect" }, [
        el("strong", {}, [result.effect ? battleEffectName(result.effect) : t("No effect")]),
        el("span", {}, [result.effect ? battleEffectDescription(result.effect) : ""])
      ]),
      el("ol", { className: "score-calc-steps" }, cardSteps),
      el("div", { className: "score-calc-total" }, [
        el("span", {}, [`${t("Chip total")}: ${chipFactorText}`]),
        ...(result.globalChipBonuses || []).map((bonus) => el("span", {}, [`${battleEffectName({ kind: bonus.kind })}: +${bonus.amount}`])),
        ...(result.chipFactors || []).map((factor) => el("span", {}, [`${battleEffectName({ kind: factor.kind })}: x${factor.factor} ${t("Chip total")}`])),
        ...(result.scoreBonuses || []).map((bonus) => el("span", {}, [`${battleEffectName({ kind: bonus.kind })}: +${bonus.amount} ${t("Final score")}`])),
        ...(result.postRoundBonuses || []).map((bonus) => el("span", {}, [
          `${battleEffectName({ kind: bonus.kind })}: ${Number(bonus.amount) >= 0 ? "+" : ""}${bonus.amount}`
        ])),
        el("span", {}, [`${t("Hand multiplier")}: ${translateBattleHand(result.handName)} x ${multiplierText}`]),
        ...(result.scoreFactors || []).map((factor) => el("span", {}, [`${battleEffectName({ kind: factor.kind })}: x${factor.factor}`])),
        ...(result.finalScoreFactors || []).map((factor) => el("span", {}, [`${battleEffectName({ kind: factor.kind })}: x${factor.factor} ${isZh() ? "手牌分" : "hand score"}`])),
        el("strong", {}, [`${t("Final score")}: ${scoreFormula}`])
      ])
    ])
  ]);
}

function battleMultiplierFormula(result) {
  const multiplierBonus = Number(result?.bonusMultiplier || 0);
  const baseMultiplier = Number(result?.baseMultiplier || 0);
  const additiveText = `${baseMultiplier}${multiplierBonus ? ` + ${multiplierBonus}` : ""}`;
  const factors = result?.multiplierFactors || [];
  const effectExpression = factors.length
    ? `(${additiveText}) x ${factors.map((entry) => entry.factor).join(" x ")}`
    : additiveText;
  const multiplierBeforeFateDice = Number(result?.multiplierBeforeFateDice ?? result?.multiplier) || 0;
  const fateDiceMultiplier = Number(result?.fateDiceMultiplier) || 0;
  if (fateDiceMultiplier > 0) {
    const diceAdditiveText = `${fateDiceMultiplier}${multiplierBonus ? ` + ${multiplierBonus}` : ""}`;
    const diceExpression = factors.length
      ? `(${diceAdditiveText}) x ${factors.map((entry) => entry.factor).join(" x ")}`
      : diceAdditiveText;
    return `${diceExpression} = ${result.multiplier}`;
  }
  if (factors.length || multiplierBonus || multiplierBeforeFateDice !== baseMultiplier) {
    return `${effectExpression} = ${result.multiplier}`;
  }
  return `${result?.multiplier ?? 0}`;
}

function battleRulesHost() {
  let host = document.querySelector("#battle-rules-host");
  if (!host) {
    host = el("div", { id: "battle-rules-host" });
    document.body.appendChild(host);
  }
  return host;
}

function renderBattleRulesModalHost() {
  const host = battleRulesHost();
  const renderKey = state.showBattleRules ? `${state.lang}:${APP_VERSION}` : "closed";
  if (host.dataset.renderKey === renderKey) return;
  host.dataset.renderKey = renderKey;
  host.innerHTML = "";
  if (state.showBattleRules) host.appendChild(buildBattleRulesModal());
}

function openBattleRules() {
  state.showBattleRules = true;
  renderBattleRulesModalHost();
}

function closeBattleRules() {
  state.showBattleRules = false;
  renderBattleRulesModalHost();
}

function buildBattleRulesModal() {
  return el("div", { className: "modal-backdrop rules-backdrop", role: "presentation" }, [
    el("section", { className: "update-modal rules-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "rules-title" }, [
      el("div", { className: "modal-head" }, [
        el("div", {}, [
          el("span", { className: "pill" }, [t("Score Battle")]),
          el("h2", { id: "rules-title" }, [t("Scoring rules")])
        ]),
        el("button", {
          className: "ghost modal-close",
          type: "button",
          onclick: closeBattleRules,
          "aria-label": t("Close")
        }, ["x"])
      ]),
      el("div", { className: "rules-grid" }, [
        el("section", {}, [
          el("h3", {}, [t("Hand type")]),
          el("div", { className: "rules-table" }, scoreRuleRows().map((rule) => el("div", { className: "rules-row" }, [
            el("span", {}, [translateBattleHand(rule.name)]),
            el("strong", {}, [`x${rule.multiplier}`])
          ])))
        ]),
        el("section", {}, [
          el("h3", {}, [t("Rules note")]),
          el("ul", { className: "update-list" }, [
            el("li", {}, [t("Choose five cards from your hand and the community board. At least one card must be a community card.")]),
            el("li", {}, [t("Only cards that make the scored hand contribute base chips; other played cards only score through specific effect bonuses.")]),
            el("li", {}, [t("Round hand sizes refill to 3, 4, 5, 5, and 5 cards. Unplayed hand cards stay for the next round.")]),
            el("li", {}, [t("Discard uses have no total cap. If a personal deck runs out, it refreshes without community or retained hand cards; replacements are marked Second deck.")]),
            el("li", {}, [t("Each score-battle turn lasts 120 seconds.")])
          ]),
          el("h3", {}, ["FATE"]),
          el("ul", { className: "update-list rules-effect-list" }, scoreFateRuleText().map((line) => el("li", {}, [line]))),
          el("h3", {}, [t("Effect cards")]),
          el("ul", { className: "update-list rules-effect-list" }, battleEffectRuleText().map((line) => el("li", {}, [line])))
        ])
      ]),
      el("button", {
        type: "button",
        onclick: closeBattleRules
      }, [t("Close")])
    ])
  ]);
}

function scoreFateRuleText() {
  return ["giant", "dice", "big-short", "going-long", "fate-collector", "clod"]
    .map((kind) => {
      const fate = { kind };
      return `${scoreFateName(fate)}: ${scoreFateDescription(fate)}`;
    });
}

function scoreRuleRows() {
  return [
    { name: "High Card", multiplier: 1 },
    { name: "One Pair", multiplier: 2 },
    { name: "Two Pair", multiplier: 3 },
    { name: "Three of a Kind", multiplier: 4 },
    { name: "Straight", multiplier: 5 },
    { name: "Flush", multiplier: 6 },
    { name: "Full House", multiplier: 8 },
    { name: "Four of a Kind", multiplier: 11 },
    { name: "Straight Flush", multiplier: 15 }
  ];
}

function battleEffectRuleText() {
  const balancedRules = battleBalanceRuleText();
  if (balancedRules.length) {
    const ramboName = battleEffectName({ kind: "rambo" });
    return balancedRules.map((line) => line.startsWith(`${ramboName}:`)
      ? `${ramboName}: ${battleEffectDescription({ kind: "rambo" })}`
      : line);
  }
  if (isZh()) {
    return [
      "同花色点数增强：指定花色的已出牌每张 +4 点。",
      "点数增强：指定点数的已出牌每张 +7 点。",
      "红色增幅：已出的红桃和方块每张 +3 点。",
      "对子引擎：只有牌型为一对或两对时，倍率 +2。",
      "同花引擎：只有牌型为同花或同花顺时，倍率 +1.5。",
      "虚无封印：从选择者开始，本回合之后顺序出牌玩家的指定花色点数 -3，最低降到 0；选择者本人打出的该花色牌不扣点，改为每张 +4 点，且只要打出的 5 张牌中包含该花色，倍率 +1。",
      "花色复制：按顺序选择两张自己的手牌，第一张手牌复制第二张手牌的花色；本回合倍率 +2.5。",
      "暗隐置换：选择一张自己的手牌与一张公共牌交换，交换后的公共牌会影响本回合之后顺序出牌的玩家；本回合总点数 +5，倍率 +1。",
      "虚空侵蚀：选择并移除一张公共牌，然后从牌库补发一张新的公共牌，新的公共牌会影响之后顺序出牌的玩家；本回合总点数 +5，倍率 +1。",
      "镜中世界：将 5 张公共牌全部变成点数互补的牌，A/K 互换，Q/2、J/3、10/4、9/5、8/6 互换，7 不变；变化后的公共牌会影响之后顺序出牌的玩家；本回合总点数 +6，倍率 +2。",
      "镜中人：将自己的全部手牌变成点数互补的牌，互补规则与镜中世界相同；本回合总点数 +6，倍率 +2。",
      "德莱联盟：本回合倍率 +3.5；若该玩家在本回合得分最高，回合结算后额外获得当前所有玩家中最高总分的 20%。",
      "歌莉娅：将自己的手牌在不改变花色的前提下，变为 8、9、10、J、Q、K 中不完全相同的点数。",
      "虚空索敌：选择自己的两张手牌，并指定一名本回合尚未出牌的玩家，与其随机两张手牌交换；本回合倍率 +1，且总点数额外加上换得两张手牌的点数和。",
      "混沌骰子：将本回合尚未出牌的所有玩家，包括自己在内，手牌全部随机重发；选择者本回合倍率 +1，且总点数额外加上本次所有被重发手牌总数 x0.5。",
      "番茄大王：本回合手牌按正常牌型倍率结算后，再在最终分额外加上本局此前被其他玩家投掷番茄命中的次数 ×1.5；本回合倍率 +1。每位玩家每局只能选择一次。",
      "番茄射手：本回合手牌按正常牌型倍率结算后，再在最终分额外加上本局此前向其他玩家投掷番茄的次数 ×1.5；本回合倍率 +1。每位玩家每局只能选择一次。",
      "同花大顺：当玩家打出同花顺时，最终分额外 +1000。",
      "质变：顺子：选择后若打出的牌型为顺子，该手牌按同花顺倍率计算。每位玩家每局只能选择一次。",
      "叠角龙：选择该特效的玩家本回合倍率 +3；本局内该玩家被番茄击中和向别人投掷番茄的有效计数变为 3 倍，包括选择前已有计数。每位玩家每局只能选择一次。",
      "面包和黄油：从本回合开始，本局之后所有顺子牌型倍率 +2。每位玩家每局只能选择一次。",
      "面包和奶酪：从本回合开始，本局之后所有三条牌型倍率 +3。每位玩家每局只能选择一次。",
      "面包和果酱：从本回合开始，本局之后所有两对牌型倍率 +4。每位玩家每局只能选择一次。",
      "星界躯体：选择时额外 +1000 最终分，该加分不受减益；从本回合起只降低手牌结算分，第 1/2/3/4 回合分别降为 70%/70%/60%/50%，第 5 回合不再减益。每位玩家每局只能选择一次。",
      "钢化番茄：从本回合开始持续判定；有效番茄命中次数超过 30 或有效投掷次数超过 50 后，每回合在手牌结算后额外加入（命中次数 ×0.5 + 投掷次数 ×0.2）×0.5，并保留一位小数。每位玩家每局只能选择一次。",
      "回归基本功：只会在第 2/3 回合出现；从本回合开始，本局之后不能再选择任何特效；第 2/3/4/5 回合分别获得 +15/+20/+20/+22 点数和 +1/+1.5/+1.5/+1.75 倍率。每位玩家每局只能选择一次。",
      "亮出你的剑：只会在第 2/3 回合出现；从本回合开始，本局之后不能再弃牌；第 2/3/4/5 回合分别获得 +10/+15/+15/+18 点数和 +2/+2.5/+2.5/+2.75 倍率。每位玩家每局只能选择一次。若之后选择刷新球，则重新允许弃牌但保留亮剑加成。",
      "关键暴击：从本回合开始，本局之后所有回合，每张打出的牌各有 50% 几率暴击；暴击牌在点数计算时乘以 1.75。预估分使用期望值显示，正式结算会逐牌随机。",
      "无尽之刃：从本回合开始，本局之后所有回合暴击率 +25%，并将暴击倍率提高到 2.25。暴击率与其他暴击特效加算，超过 100% 按 100% 计算。每位玩家每局只能选择一次。",
      "残暴之力：本回合总点数 +25，倍率 +1。",
      "大力：本回合计分点数之和 x1.5 后再乘以牌型倍率。",
      "刷新球：本回合倍率 +1，且本局额外获得 4 次弃牌机会；若此前被亮出你的剑禁止弃牌，则重新允许弃牌，且不取消亮剑的点数和倍率加成。",
      "巨人杀手：仅在选择回合和下一回合生效。按回合开始前与最高总分的差距 1~100/101~200/201~300/301~400/401 及以上，使手牌得分分别 x1.3/x1.45/x1.6/x1.75/x1.9；之后消失且本局不再进入该玩家特效池。",
      "马太效应：本回合倍率 +2；从本回合开始，本局之后每次单回合得分最高时，额外获得 3 次弃牌机会。每位玩家每局只能选择一次。",
      "暴击切牌：从本回合开始，本局之后所有回合暴击率 +25%；每当该玩家本回合计分时至少有一张牌触发暴击，额外获得 1 次弃牌机会。每位玩家每局只能选择一次。",
      "直接来吧：结算时将该玩家当前剩余的未使用弃牌次数额外加到倍率上；如果选中后继续弃牌，最终倍率加成会随剩余次数减少。",
      "红温火烤：如果在自己的回合开始后 15 秒内出牌，本回合总点数 +10 后再乘以倍率。"
    ];
  }
  return [
    "Suit chip boost: played cards of one suit each gain +4 chips.",
    "Rank boost: played cards of one rank each gain +7 chips.",
    "Red boost: played hearts and diamonds each gain +3 chips.",
    "Pair engine: One Pair or Two Pair gains +2 multiplier.",
    "Flush engine: Flush or Straight Flush gains +1.5 multiplier.",
    "Void seal: from the selector onward, one suit loses 3 chips this round, not below 0. The selector's played cards of that suit avoid the penalty, gain +4 chips each instead, and add +1 multiplier if their five-card play contains that suit.",
    "Pattern Reproduction: choose two hand cards in order; the first copies the second card's suit. This round gains +2.5 multiplier.",
    "Shadow Swap: swap one hand card with one community card. The changed community board affects later players this round. This round gains +5 chips and +1 multiplier.",
    "Void Erosion: remove one community card and deal a replacement. The changed community board affects later players this round. This round gains +5 chips and +1 multiplier.",
    "World in Mirror: mirror all five community card ranks: A/K, Q/2, J/3, 10/4, 9/5, and 8/6 swap, while 7 stays unchanged. The changed board affects later players. This round gains +6 chips and +2 multiplier.",
    "Man in Mirror: mirror all of your hand card ranks using the same mirror mapping as World in Mirror. This round gains +6 chips and +2 multiplier.",
    "Draven's League: this round gains +3.5 multiplier. If you lead the round, you also gain 20% of the current highest total score after round settlement.",
    "GOELIA: your hand cards become non-identical ranks from 8, 9, 10, J, Q, and K while keeping their suits.",
    "Shadow Targeting: choose two hand cards and one unplayed target player; swap them with two random cards from that target. This round gains +1 multiplier and extra chips equal to the gained cards' chip values.",
    "Chaos Dice: reroll every unplayed player's hand, including yours. The selector gains +1 multiplier and bonus chips equal to total rerolled hand cards x0.5.",
    "King of the Tomato: count how many tomatoes other players hit you with earlier in this game, before the current round. This round gains that count as chips and +1 multiplier. Each player can choose it only once per game; after use, it leaves that player's later effect pools.",
    "Tomato Shooter: count how many tomatoes you threw at other players earlier in this game, before the current round. This round gains that count as chips and +0.5 multiplier. Each player can choose it only once per game; after use, it leaves that player's later effect pools.",
    "Straight Flush: when you play a Straight Flush, gain +1000 final score.",
    "Change: Straight: if your played hand is a Straight, calculate its multiplier as a Straight Flush. Each player can choose it only once per game.",
    "Protoceratops: this round gains +3 multiplier. Your effective tomato hit and throw counts become three times their raw values for the whole game, including counts from before selection. Once per game.",
    "Bread and butter: from this round onward, your Straights gain +2 multiplier for the rest of this game. Once per game.",
    "Bread and cheese: from this round onward, your Three of a Kind gains +3 multiplier for the rest of this game. Once per game.",
    "Bread and Jam: from this round onward, your Two Pair gains +4 multiplier for the rest of this game. Once per game.",
    "Astral Body: gain +1000 final score when selected; that bonus is not reduced. Only hand score is reduced to 70%/70%/60%/50% in rounds 1/2/3/4, with no penalty in round 5. Once per game.",
    "Tempered Tomato: from this round onward, the threshold is checked continuously. If it is not active when selected, it activates in any later round once effective tomato hits exceed 30 or effective throws exceed 50, then each round adds hits x0.5 plus throws x0.2 chips, rounded to one decimal. Once per game.",
    "Returning to the fundamentals: only appears in rounds 2/3. From this round onward, you cannot choose more effects. In rounds 2/3/4/5, gain +15/+20/+20/+22 chips and +1/+1.5/+1.5/+1.75 multiplier. Once per game.",
    "Draw your sword: only appears in rounds 2/3. From this round onward, you cannot discard. In rounds 2/3/4/5, gain +10/+15/+15/+18 chips and +2/+2.5/+2.5/+2.75 multiplier. Once per game. Refresher Orb can re-enable discards without removing these bonuses.",
    "Critical Hit: from this round onward, each played card has an independent 50% chance to crit. Critical cards multiply their chip value by 1.75. Previews show expected value; settlement rolls each card.",
    "Infinity Edge: from this round onward, gain +25% additive crit chance and raise the crit multiplier to x2.25. Crit chance from crit effects stacks additively and caps at 100%. Once per game.",
    "Brutal Force: this round gains +25 chips and +1 multiplier.",
    "Vigorous: this round multiplies the chip total by x1.5 before applying hand multiplier.",
    "Refresher Orb: this round gains +1 multiplier and you gain 4 extra discard uses this game. If Draw your sword blocked discards, discards are re-enabled without removing Draw your sword's scoring bonuses.",
    "Giant Killer: active only this round and the next. A 1-100/101-200/201-300/301-400/401+ gap to the leader multiplies hand score by x1.3/x1.45/x1.6/x1.75/x1.9. It then expires and cannot return to your effect pool this game.",
    "Matthew effect: this round gains +2 multiplier. From this round onward, each time you have the highest single-round score, gain 3 extra discard uses. Once per game.",
    "Critical Switch Hand: from this round onward, gain +25% additive crit chance. Whenever at least one played card crits during your round scoring, gain 1 extra discard use. Once per game.",
    "Bite me: at scoring time, add your remaining unused discard uses to this round's multiplier. If you keep discarding after choosing it, the final multiplier bonus drops with the remaining count.",
    "Rambo: if you play within 15 seconds after your turn starts, gain +10 chips before multiplying."
  ];
}

function battleBalanceRuleText() {
  return battleCompleteRuleText();
  if (isZh()) {
    return [
      "\u5e7b\u5f71\u4e4b\u821e\uff1a\u66b4\u51fb\u7387 +25%\uff0c\u653b\u51fb\u901f\u5ea6 +65%\uff0c\u5e76\u8fdb\u5165\u5e7d\u7075\u72b6\u6001\uff1a\u5411\u8be5\u73a9\u5bb6\u6295\u63b7\u756a\u8304\u65f6\uff0c\u547d\u4e2d\u4e0d\u8ba1\u5165\u6295\u63b7\u8005\u7684\u6295\u63b7\u6b21\u6570\uff0c\u4f46\u4f1a\u8ba1\u5165\u8be5\u73a9\u5bb6\u88ab\u6295\u63b7\u7684\u6b21\u6570\u3002\u6bcf\u5c40\u4e00\u6b21\u3002",
      "基础计分：高牌只计入最高牌；一对只计入对子两张；两对只计入两对四张；三条只计入三张；四条只计入四张；顺子、同花、葫芦、同花顺计入全部五张。",
      "未参与牌型的牌基础点数为 0，但同花色点数增强、点数增强、红色增幅、虚无封印拥有者加成等逐牌加点特效仍可让这些牌获得额外点数。",
      "暴击只会在参与牌型计分的牌上判定；不参与牌型的牌即使通过特效获得额外点数，也不会因此触发暴击。",
      "同花色点数增强：指定花色的已出牌每张 +4 点。",
      "点数增强：指定点数的已出牌每张 +7 点。",
      "红色增幅：已出的红桃和方块每张 +3 点。",
      "对子引擎：牌型为一对或两对时，倍率 +2。",
      "同花引擎：牌型为同花或同花顺时，倍率 +1.5。",
      "虚无封印：从选择者开始，本回合之后顺序出牌玩家的指定花色点数 -3，最低 0；选择者自己的该花色牌改为每张 +4，并且只要打出的 5 张牌包含该花色，倍率 +1。",
      "花色复制：按顺序选择两张自己的手牌，第一张复制第二张花色；本回合倍率 +2.5。",
      "暗隐置换：选择一张手牌与一张公共牌交换；本回合点数 +5，倍率 +1。",
      "虚空侵蚀：移除一张公共牌并补发；本回合点数 +5，倍率 +1。",
      "镜中世界：将公共牌点数按 A/K、Q/2、J/3、10/4、9/5、8/6 互换，7 不变；本回合点数 +6，倍率 +2。",
      "镜中人：将自己的手牌按同样规则互换点数；本回合点数 +6，倍率 +2。",
      "德莱联盟：本回合倍率 +3.5；若本回合得分最高，结算后额外获得当前所有玩家最高总分的 20%。",
      "歌莉娅：自己的手牌在不改变花色的前提下变为 8、9、10、J、Q、K 中不完全相同的点数。",
      "虚空索敌：选择自己的两张手牌并指定一名尚未出牌的目标，与其随机两张手牌交换；本回合倍率 +1，并额外加上换得两张牌的点数和。",
      "混沌骰子：将所有尚未出牌玩家的手牌重发；选择者本回合倍率 +1，并额外加上重发手牌总数 x0.5 点。",
      "番茄大王：本回合倍率 +1；手牌按牌型倍率结算后，在最终分额外加上本局此前被其他玩家投掷番茄命中的次数 ×2。每局一次。",
      "番茄射手：本回合倍率 +1；手牌按牌型倍率结算后，在最终分额外加上本局此前向其他玩家投掷番茄的次数 ×2。每局一次。",
      "卢安娜的飓风：暴击率 +25%，攻击速度 +40%；每次投掷番茄额外发射 2 个不递归的分裂番茄至随机其他玩家，同一目标可重复。每局一次。",
      "往日番茄：只在第 5 回合出现；本局此前番茄命中数 ×0.5 加入手牌点数后再乘牌型倍率。",
      "多米尼克领主的致意：暴击率 +25%；从本回合起，高牌、一对、两对、三条、顺子的牌型倍率至少为 6。每局一次。",
      "收集者：暴击率 +25%，本回合点数 +10；之后若上一回合得分最高，额外获得 2 次弃牌和其他玩家总投掷次数之和的 10%（取整）作为投掷计数。每局一次。",
      "幻影之舞：暴击率 +25%，攻击速度 +65%，本回合点数 +5、倍率 +1.5；你的番茄只给自己增加命中计数，投向你的番茄不给对方投掷计数。每局一次。",
      "同花大顺：打出同花顺时，最终分 +1000。",
      "质变：顺子：若打出顺子，按同花顺倍率计算。每局一次。",
      "双角龙：本回合倍率 +3；本局番茄命中和投掷有效计数变为 3 倍，包括选择前已有计数。每局一次。",
      "面包和奶酪：本局之后所有三条牌型倍率 +1，基础点数 +12。每局一次。",
      "面包和黄油：本局之后所有两对牌型倍率 +2，基础点数 +5。每局一次。",
      "面包和果酱：本局之后所有顺子牌型倍率 +2，基础点数 +3。每局一次。",
      "星界身体：本回合最终分 +1000；从本回合开始，本局之后每回合最终得分降低至 50%。每局一次。",
      "钢化番茄：从本回合开始持续判定；若有效命中次数超过 30 或有效投掷次数超过 50，每回合在手牌结算后额外加入（命中×0.5 + 投掷×0.2）×0.75。每局一次。",
      "回归基本功：只在第 2/3 回合出现；之后不能再选特效，立即额外获得 4 次弃牌；第 2/3/4/5 回合均获得 +18 点数，倍率为 +1.5/+1.5/+1.5/+1.75。每局一次。",
      "亮出你的剑：只在第 2/3 回合出现；之后不能再弃牌；第 2/3/4/5 回合均获得 +15 点数和 +2.25 倍率。刷新球可重新允许弃牌但保留亮剑加成。每局一次。",
      "关键暴击：从本回合开始，参与牌型计分的牌有 50% 几率暴击，暴击点数 x1.75。每局一次。",
      "无尽之刃：从本回合开始，参与牌型计分的牌暴击率 +25%，暴击倍率提高到 x2.25。每局一次。",
      "暴击切牌：从本回合开始，参与牌型计分的牌暴击率 +25%；每回合若至少一张计分牌触发暴击，额外获得 1 次弃牌。每局一次。",
      "残暴之力：本回合点数 +25，倍率 +1。",
      "大力：本回合计分点数之和 x1.5 后再乘以牌型倍率。",
      "刷新球：本回合倍率 +1，并额外获得 4 次弃牌；若此前被亮剑禁止弃牌，则重新允许弃牌。",
      "巨人杀手：仅在选择回合和下一回合生效，按回合开始前与最高总分的差距提升得分：x1.3/x1.45/x1.6/x1.75/x1.9；之后消失且本局不再出现。",
      "马太效应：本回合倍率 +2；之后每次单回合得分最高时，额外获得 3 次弃牌。每局一次。",
      "直接来吧：结算时将当前剩余未使用弃牌次数额外加到倍率上。",
      "红温火烤：如果在自己的回合开始后 15 秒内出牌，本回合点数 +10 后再乘以倍率。"
    ];
  }
  return [
    "Base scoring: High Card scores only the highest card; One Pair scores the pair; Two Pair scores both pairs; Three/Four of a Kind score only the matching cards; Straight, Flush, Full House, and Straight Flush score all five cards.",
    "Cards outside the made hand have 0 base chips, but per-card chip effects such as suit boost, rank boost, red boost, and the Void Seal owner bonus can still add chips to them.",
    "Crits are checked only on cards that participate in the scored hand. Non-scoring cards do not crit even if an effect gives them bonus chips.",
    "Suit chip boost: played cards of one suit each gain +4 chips.",
    "Rank boost: played cards of one rank each gain +7 chips.",
    "Red boost: played hearts and diamonds each gain +3 chips.",
    "Pair engine: One Pair or Two Pair gains +2 multiplier.",
    "Flush engine: Flush or Straight Flush gains +1.5 multiplier.",
    "Void seal: from the selector onward, one suit loses 3 chips this round, not below 0. The selector's played cards of that suit gain +4 chips instead, and add +1 multiplier if the five-card play contains that suit.",
    "Pattern Reproduction: choose two hand cards in order; the first copies the second card's suit. This round gains +2.5 multiplier.",
    "Shadow Swap: swap one hand card with one community card. This round gains +5 chips and +1 multiplier.",
    "Void Erosion: remove one community card and deal a replacement. This round gains +5 chips and +1 multiplier.",
    "World in Mirror: mirror all five community card ranks. This round gains +6 chips and +2 multiplier.",
    "Man in Mirror: mirror all of your hand card ranks. This round gains +6 chips and +2 multiplier.",
    "Draven's League: this round gains +3.5 multiplier. If you lead the round, gain 20% of the current highest total score after settlement.",
    "GOELIA: your hand cards become non-identical ranks from 8, 9, 10, J, Q, and K while keeping suits.",
    "Shadow Targeting: swap two hand cards with two random cards from an unplayed target. This round gains +1 multiplier and extra chips equal to the gained cards' chip values.",
    "Chaos Dice: reroll every unplayed player's hand. The selector gains +1 multiplier and bonus chips equal to total rerolled hand cards x0.5.",
    "King of the Tomato: this round gains +1 multiplier; after hand scoring, earlier tomato hits against you this game add hits x2 to final score. Once per game.",
    "Tomato Shooter: this round gains +1 multiplier; after hand scoring, earlier tomatoes you threw this game add throws x2 to final score. Once per game.",
    "Runaan's Hurricane: gain +25% crit chance and +40% attack speed. Each tomato fires two non-recursive split tomatoes at random other players; the same target may be hit twice. Once per game.",
    "Old days' Tomatoes: only appears in round 5. Earlier tomato hits this game add hits x0.5 before hand multiplier.",
    "Lord Dominick's Regards: gain +25% crit chance. From this round onward, High Card through Straight use at least x6 hand multiplier. Once per game.",
    "The Collector: gain +25% crit chance and +10 chips this round. After any previous-round win, gain 2 discards and 10% of all other players' total throws, floored, as bonus throw count. Once per game.",
    "Dance of Illusions: gain +25% crit chance, +65% attack speed, +5 chips and +1.5 multiplier this round. Your tomatoes add hit count only to you; tomatoes thrown at you give the thrower no throw count. Once per game.",
    "Straight Flush: when you play a Straight Flush, gain +1000 final score.",
    "Change: Straight: if your played hand is a Straight, calculate its multiplier as a Straight Flush. Once per game.",
    "Protoceratops: this round gains +3 multiplier. Your effective tomato hit and throw counts become three times their raw values for the whole game. Once per game.",
    "Bread and cheese: for the rest of this game, your Three of a Kind gains +1 multiplier and +12 chips. Once per game.",
    "Bread and butter: for the rest of this game, your Two Pair gains +2 multiplier and +5 chips. Once per game.",
    "Bread and Jam: for the rest of this game, your Straights gain +2 multiplier and +3 chips. Once per game.",
    "Astral Body: gain +1000 final score outside its penalty; only hand score is reduced in rounds 1-4, and round 5 has no penalty. Once per game.",
    "Tempered Tomato: from this round onward, thresholds are checked continuously. Once effective hits exceed 30 or throws exceed 50, each round adds (hits x0.5 + throws x0.2) x0.75 to final score after hand scoring. Once per game.",
    "Returning to the fundamentals: only appears in rounds 2/3. You cannot choose more effects and immediately gain 4 discard uses. Rounds 2/3/4/5 gain +18 chips and +1.5/+1.5/+1.5/+1.75 multiplier. Once per game.",
    "Draw your sword: only appears in rounds 2/3. You cannot discard. Rounds 2/3/4/5 each gain +15 chips and +2.25 multiplier. Once per game. Refresher Orb can re-enable discards without removing these bonuses.",
    "Critical Hit: from this round onward, scoring-hand cards have 50% crit chance for x1.75 chips. Once per game.",
    "Infinity Edge: from this round onward, scoring-hand cards gain +25% crit chance and the crit multiplier rises to x2.25. Once per game.",
    "Critical Switch Hand: from this round onward, scoring-hand cards gain +25% crit chance; any scoring-card crit in a round grants 1 extra discard. Once per game.",
    "Dance of Illusions: gain +25% crit chance and +65% attack speed. Tomatoes thrown at this ghosted player still count as hits against them, but do not count as throws for the thrower. Once per game.",
    "Brutal Force: this round gains +25 chips and +1 multiplier.",
    "Vigorous: this round multiplies the chip total by x1.5 before applying hand multiplier.",
    "Refresher Orb: this round gains +1 multiplier and 4 extra discard uses. If Draw your sword blocked discards, discards are re-enabled without removing Draw your sword's scoring bonuses.",
    "Giant Killer: this round and the next, multiply hand score by x1.3/x1.45/x1.6/x1.75/x1.9 based on the gap to the leader. It then expires and cannot be selected again this game.",
    "Matthew effect: this round gains +2 multiplier. Later round wins grant 3 extra discard uses. Once per game.",
    "Bite me: at scoring time, add your remaining unused discard uses to this round's multiplier.",
    "Rambo: if you play within 15 seconds after your turn starts, gain +10 chips before multiplying."
  ];
}

function battleCompleteRuleText() {
  const baseRules = isZh()
    ? [
      "基础计分：高牌仅计最高牌；一对仅计对子；两对仅计两对；三条与四条仅计同点数牌；顺子、同花、葫芦、同花顺计全部五张。",
      "踢脚牌：未参与牌型的牌按自身点数 40%（向下取整）加入点数，合计最高 20；这些点数也可触发暴击。",
      "暴击：每张计分牌与有踢脚牌贡献的牌独立判定；仅当本回合暴击率大于 0% 且没有任何暴击时，最终得分额外 +100。",
      "皇家同花顺：每局随机选定一种胜利花色并显示在回合数旁；只有对应花色的 10、J、Q、K、A 同花顺会立即赢得整局，另外三种花色按普通同花顺计分。",
      "番茄投掷：积分对战中只能在其他玩家的出牌回合投掷番茄；自己的回合及回合结算阶段不能投掷。",
      "最终得分在完整计算后向下取整为整数。"
    ]
    : [
      "Base scoring: High Card scores only its highest card; One Pair, Two Pair, Three/Four of a Kind score only their made cards; Straight, Flush, Full House, and Straight Flush score all five.",
      "Kickers: cards outside the made hand add 40% of their chip value, rounded down, up to 20 total. Those contributions may crit.",
      "Crits: scoring cards and contributing kickers roll independently. Only a round with crit chance above 0% and no crit adds +100 final score.",
      "Royal Flush: one winning suit is chosen each game and shown beside the round counter. Only that suit wins instantly with 10-J-Q-K-A; the other three score as a normal Straight Flush.",
      "Tomato throws: in Score Battle, tomatoes can be thrown only during another player's active turn, not during your own turn or round settlement.",
      "Final scores are floored to integers after the full calculation."
    ];
  return baseRules.concat(battleRuleEffectSamples().map((effect) => `${battleEffectName(effect)}: ${battleEffectDescription(effect)}`));
}

function battleRuleEffectSamples() {
  return [
    { kind: "suit-chip", suit: "H" }, { kind: "rank-chip", rank: "A" }, { kind: "pair-mult" }, { kind: "flush-mult" }, { kind: "red-chip" },
    { kind: "void-suit", suit: "H", amount: 3 }, { kind: "pattern-reproduction" }, { kind: "shadow-swap" }, { kind: "void-erosion", followingUnplayedPlayers: 2 },
    { kind: "world-mirror" }, { kind: "man-mirror" }, { kind: "draven" }, { kind: "goelia" }, { kind: "shadow-targeting", gainedChipBonus: 0 },
    { kind: "chaos-dice", rerolledCardCount: 0 }, { kind: "rambo", amount: 10, seconds: 20 }, { kind: "tomato-king", tomatoHits: 0 },
    { kind: "tomato-shooter", tomatoThrows: 0 }, { kind: "runaans-hurricane" }, { kind: "old-days-tomatoes", tomatoThrows: 0 },
    { kind: "lord-dominicks-regards" }, { kind: "collector" }, { kind: "bite-me", discardMultiplier: 0 }, { kind: "straight-flush-boost" },
    { kind: "change-straight" }, { kind: "protoceratops" }, { kind: "bread-butter" }, { kind: "bread-cheese" }, { kind: "bread-jam" },
    { kind: "astral-body" }, { kind: "tempered-tomato" }, { kind: "returning-fundamentals" }, { kind: "draw-sword" },
    { kind: "critical-hit" }, { kind: "infinity-edge" }, { kind: "brutal-force" }, { kind: "vigorous" }, { kind: "refresher-orb" },
    { kind: "giant-killer" }, { kind: "matthew-effect" }, { kind: "critical-switch-hand" }, { kind: "dance-illusions" }
  ];
}

function battleBalanceRuleTextZh() {
  return [
    "基础计分：高牌仅计最高牌；一对仅计对子；两对仅计两对；三条与四条仅计同点数牌；顺子、同花、葫芦、同花顺计全部五张。",
    "踢脚牌：未参与牌型的牌按自身点数 40%（向下取整）加入点数，合计最高 20；这些点数也可触发暴击。",
    "暴击：每张计分牌与有踢脚牌贡献的牌独立判定；本回合没有任何暴击时，最终得分额外 +100。",
    "同花色点数增强：指定花色获得 max(8, 4×匹配张数) 点，最高 20，并且倍率 +1。",
    "点数增强：先从当前手牌或公共牌选一个实际存在的点数；获得 max(10, 6×匹配张数) 点，最高 24。",
    "红色增幅：红桃、方块每张 +4；黑桃、梅花每张 +2。",
    "对子引擎：点数增加 max(8, 8×对子数量)；若为一对或两对，倍率再 +2。",
    "同花引擎：无条件 +7 点；同花或同花顺时倍率再 +1.5。",
    "虚空侵蚀：重发一张公共牌；点数 +5、倍率 +1。按之后尚未出牌人数 n，再得 +max(1,n) 倍率与 +70n 最终分。",
    "虚空索敌：与未出牌玩家随机两张手牌交换；倍率 +2，最终分额外加换得两张牌点数和×10。",
    "混沌骰子：重发所有未出牌玩家手牌；倍率 +1、点数 +10 + 0.5m，最终分再 +10m（m 为重发手牌总数）。",
    "大力：手牌结算后，最终分额外增加 100 + 手牌得分×25%，最高增加 200。",
    "红温火烤：回合开始 20 秒内出牌时，点数 +10 后乘倍率，最终分再 +150。",
    "番茄大王与番茄射手：本回合倍率 +1；此前命中或投掷次数各按 ×5 加入最终分。",
    "钢化番茄：命中超过 30 或投掷超过 50 后，每回合最终分额外加入（命中×0.5 + 投掷×0.2）×5。",
    "往日番茄：仅第 5 回合出现；此前投掷次数×0.5 加入手牌点数后再乘牌型倍率。",
    "幻影之舞：暴击 +25%、攻速 +65%；选择回合 +5 点、+1.5 倍率。自己的番茄只增加自己的命中数；投向自己时只增加自己的被命中数，投掷方不增加投掷数。",
    "面包和奶酪：从本回合起每回合 +5 点；三条、葫芦、四条再 +7 点、+1 倍率。",
    "面包和黄油：从本回合起每回合 +4 点；一对、两对再 +5 点、+2 倍率。",
    "面包和果酱：从本回合起每回合 +4 点；顺子再 +5 点、+2 倍率。",
    "星界躯体：选择时额外 +1000 最终分，该加分不受减益；只降低手牌结算分，第 1/2/3/4 回合分别降为 70%/70%/60%/50%，第 5 回合不再减益。",
    "卢安娜的飓风、领主的致意、收集者、回归基本功、亮出你的剑等持续特效的详细数值会显示在对应特效卡与牌桌状态栏。",
    "所有最终得分在内部计算完成后向下取整为整数。"
  ];
}

function battleBalanceRuleTextEn() {
  return [
    "Base scoring: High Card scores only its highest card; One Pair, Two Pair, Three/Four of a Kind score only their made cards; Straight, Flush, Full House, and Straight Flush score all five.",
    "Kickers: cards outside the made hand add 40% of their chip value, rounded down, up to 20 total. Those contributions may crit.",
    "Crits: scoring cards and contributing kickers roll independently. A round with no crit adds +100 final score.",
    "Suit chip boost: gain max(8, 4 x matching cards) chips, capped at 20, and +1 mult.",
    "Rank boost: choose a current hand or community card to set an existing rank; gain max(10, 6 x matching cards) chips, capped at 24.",
    "Red boost: Hearts and Diamonds gain +4 chips each; Spades and Clubs gain +2 each.",
    "Pair engine: gain max(8, 8 x pair ranks) chips; One Pair and Two Pair gain another +2 mult.",
    "Flush engine: gain +7 chips; Flush and Straight Flush gain another +1.5 mult.",
    "Void Erosion: replace one community card; gain +5 chips and +1 mult. With n later unplayed players, also gain +max(1,n) mult and +70n final score.",
    "Shadow Targeting: swap for two random hand cards from an unplayed target; gain +2 mult and the gained-card chip total x10 as final score.",
    "Chaos Dice: reroll every unplayed hand; gain +1 mult, +10 + 0.5m chips, and +10m final score, where m is the rerolled card count.",
    "Vigorous: after hand scoring, add 100 + 25% of hand score to final score, capped at 200.",
    "Rambo: play within 20 seconds to gain +10 chips before multiplier and +150 final score.",
    "King of the Tomato and Tomato Shooter: gain +1 mult and add earlier hits or throws x5 to final score.",
    "Tempered Tomato: after its threshold, each round adds (hits x0.5 + throws x0.2) x5 final score.",
    "Old days' Tomatoes: only in round 5; earlier throws x0.5 are added before hand multiplier.",
    "Dance of Illusions: +25% crit and +65% attack speed; its selection round gains +5 chips and +1.5 mult, with its ghost tomato-count rules.",
    "Bread and cheese: +5 chips every round; Three of a Kind, Full House, and Four of a Kind also gain +7 chips and +1 mult.",
    "Bread and butter: +4 chips every round; One Pair and Two Pair also gain +5 chips and +2 mult.",
    "Bread and Jam: +4 chips every round; Straights also gain +5 chips and +2 mult.",
    "Astral Body: +1000 final score outside its penalty; only hand score becomes 70%/70%/60%/50% in rounds 1/2/3/4, and round 5 has no penalty.",
    "Persistent effects such as Runaan's Hurricane, Lord Dominick's Regards, The Collector, Returning to the Fundamentals, and Draw Your Sword show their detailed values on their effect cards and table status.",
    "Final scores are floored to integers after the full calculation."
  ];
}

function renderHome() {
  const root = el("div", { className: "app-shell" });
  root.appendChild(renderTopbar(false));

  const grid = el("section", { className: "home-grid" });
  const mode = el("section", { className: "mode-panel" }, [
    el("div", { className: "panel-head" }, [el("h2", {}, [t("Mode")])]),
    el("div", { className: "mode-grid" }, [
      el("button", {
        className: "mode-tile active",
        type: "button",
        onclick: () => setGameMode("score")
      }, [
        t("Score Battle"),
        el("span", {}, [t("Five rounds. Build the highest total.")])
      ]),
      el("button", { className: "mode-tile", type: "button", disabled: true }, [
        t("Single Player"),
        el("span", {}, [t("Later")])
      ])
    ])
  ]);

  const auth = el("section", { className: "auth-panel" }, [
    el("div", { className: "tabs" }, [
      el("button", {
        className: `tab ${state.authMode === "login" ? "active" : ""}`,
        type: "button",
        onclick: () => {
          state.authMode = "login";
          state.error = "";
          render();
        }
      }, [t("Login")]),
      el("button", {
        className: `tab ${state.authMode === "register" ? "active" : ""}`,
        type: "button",
        onclick: () => {
          state.authMode = "register";
          state.error = "";
          render();
        }
      }, [t("Register")])
    ]),
    renderAuthForm()
  ]);

  grid.append(mode, auth);
  root.appendChild(grid);
  return root;
}

function renderAuthForm() {
  const form = el("form", { className: "form-grid" });
  const name = el("input", {
    name: "username",
    autocomplete: "username",
    placeholder: t("Name"),
    maxlength: 20,
    required: true
  });
  const password = el("input", {
    name: "password",
    type: "password",
    autocomplete: state.authMode === "login" ? "current-password" : "new-password",
    placeholder: t("Password"),
    required: true
  });
  const remember = el("label", { className: "check-row" }, [
    el("input", {
      type: "checkbox",
      checked: state.rememberLogin,
      onchange: (event) => {
        state.rememberLogin = event.target.checked;
      }
    }),
    el("span", {}, [t("Remember me")])
  ]);

  form.append(
    name,
    password,
    state.authMode === "login" ? remember : "",
    el("button", { type: "submit", disabled: state.busy }, [state.authMode === "login" ? t("Login") : t("Create account")]),
    el("div", { className: "error-box" }, [displayError(state.error)])
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    state.busy = true;
    state.error = "";
    render();
    try {
      const response = await api(`/api/${state.authMode}`, {
        method: "POST",
        body: {
          username: name.value,
          password: password.value,
          remember: state.authMode === "login" ? state.rememberLogin : false
        }
      });
      state.user = response.user;
      maybeShowUpdateNotice();
      await refreshProfile(false);
      await refreshScoreTables();
    } catch (error) {
      state.error = error.message;
    } finally {
      state.busy = false;
      render();
    }
  });

  return form;
}

function renderApp() {
  const root = el("div", { className: "app-shell" });
  root.appendChild(renderTopbar(true));
  if (state.showProfile) root.appendChild(renderProfilePanel());
  root.appendChild(renderScoreBattleApp());
  return root;
}

function renderModeSwitcher() {
  return el("div", { className: "mode-switcher" }, [
    el("button", {
      className: "mode-switch active",
      type: "button",
      onclick: () => setGameMode("score")
    }, [t("Score Battle")])
  ]);
}

function renderTopbar(withUser) {
  const bar = el("header", { className: "topbar" });
  bar.appendChild(el("div", { className: "brand" }, [
    el("div", { className: "brand-mark" }, ["L202"]),
    el("h1", {}, [t("CardGame Point")])
  ]));

  const languageButton = el("button", {
    className: "ghost",
    type: "button",
    onclick: toggleLanguage
  }, [state.lang === "zh" ? "English" : "中文"]);
  const updateHistoryButton = el("button", {
    className: "ghost",
    type: "button",
    onclick: openUpdateHistory
  }, [t("Update history")]);
  const musicButton = el("button", {
    className: `ghost music-toggle ${state.backgroundMusicEnabled ? "is-playing" : ""}`,
    type: "button",
    "aria-pressed": state.backgroundMusicEnabled ? "true" : "false",
    onclick: toggleBackgroundMusic
  }, [state.backgroundMusicEnabled ? t("Music on") : t("Music off")]);

  if (withUser && state.user) {
    bar.appendChild(el("div", { className: "user-strip" }, [
      renderModeSwitcher(),
      el("div", { className: "user-identity" }, [
        avatarNode(state.user.avatar, state.user.username, "topbar-avatar"),
        el("span", {}, [state.user.username])
      ]),
      el("button", {
        className: "ghost",
        type: "button",
        onclick: async () => {
          state.showProfile = !state.showProfile;
          if (state.showProfile) await refreshProfile(false);
          render();
        }
      }, [state.showProfile ? t("Hide profile") : t("Profile")]),
      updateHistoryButton,
      musicButton,
      languageButton,
      el("button", {
        className: "ghost",
        type: "button",
        onclick: logout
      }, [t("Logout")])
    ]));
  } else {
    bar.appendChild(el("div", { className: "user-strip" }, [updateHistoryButton, musicButton, languageButton]));
  }
  return bar;
}

function renderProfilePanel() {
  const profile = state.profile || {
    username: state.user?.username || "",
    avatar: state.user?.avatar || "",
    stats: {},
    history: []
  };
  const stats = profile.stats || {};
  const history = Array.isArray(profile.history) ? profile.history : [];

  return el("section", { className: "profile-panel" }, [
    el("div", { className: "profile-head" }, [
      el("div", { className: "profile-identity" }, [
        avatarNode(profile.avatar || state.user?.avatar, profile.username || state.user?.username, "profile-avatar"),
        el("div", {}, [
          el("h2", {}, [profile.username || state.user?.username || t("Profile")]),
          el("span", { className: "meta" }, [`${t("Times left")} ${stats.sessionsPlayed || 0}`])
        ])
      ]),
      el("div", { className: "avatar-actions" }, [
        el("label", { className: "file-button" }, [
          t("Upload avatar"),
          el("input", {
            type: "file",
            accept: "image/*",
            onchange: (event) => handleAvatarFile(event.target.files?.[0])
          })
        ]),
        (profile.avatar || state.user?.avatar)
          ? el("button", { className: "ghost", type: "button", onclick: () => updateAvatar("") }, [t("Clear avatar")])
          : "",
        el("button", {
          className: "ghost",
          type: "button",
          onclick: () => {
            state.showPasswordModal = true;
            render();
          }
        }, [t("Change password")]),
      ])
    ]),
    el("div", { className: "profile-stats" }, [
      statTile(t("Coins"), profile.coins ?? state.user?.coins ?? 0),
      statTile(t("Best points"), stats.bestPoints ?? 0),
      statTile(t("Best stars"), starText(stats.bestStars) || "0"),
      statTile(t("Latest points"), stats.lastPoints ?? 0),
      statTile(t("Latest stars"), starText(stats.lastStars) || "0")
    ]),
    el("div", { className: "profile-section-head" }, [
      el("h3", {}, [t("History")])
    ]),
    history.length
      ? el("div", { className: "history-list" }, history.map(renderHistoryEntry))
      : el("div", { className: "empty-state" }, [t("No history yet.")])
  ]);
}

function statTile(label, value) {
  return el("div", { className: "stat-tile" }, [
    el("span", {}, [label]),
    el("strong", {}, [String(value)])
  ]);
}

function renderHistoryEntry(entry) {
  if (entry.type === "score-battle") return renderScoreBattleHistoryEntry(entry);
  return el("div", { className: "history-row" }, [
    el("div", { className: "history-main" }, [
      el("strong", {}, [entry.tableName || t("Table name")]),
      el("span", {}, [formatDateTime(entry.leftAt)])
    ]),
    el("div", { className: "history-values" }, [
      el("span", {}, [`${t("Points")} ${entry.points}`]),
      el("span", { className: "history-stars", title: `${entry.stars}` }, [
        `${t("Stars")} ${starText(entry.stars) || "0"}`
      ])
    ])
  ]);
}

function renderScoreBattleHistoryEntry(entry) {
  const standings = Array.isArray(entry.standings) ? entry.standings : [];
  return el("div", { className: "history-row score-history-row" }, [
    el("div", { className: "history-main" }, [
      el("strong", {}, [entry.tableName || t("Score Battle history")]),
      el("span", {}, [`${formatDateTime(entry.leftAt)} | ${t("Score Battle history")}`])
    ]),
    el("div", { className: "history-values" }, [
      el("span", {}, [`${t("Rank")} ${entry.rank || "-"}`]),
      el("span", {}, [`${t("Total score")} ${entry.totalScore || 0}`])
    ]),
    standings.length ? el("div", { className: "history-standings" }, standings.map((standing) => el("span", {}, [
      `${standing.rank}. ${standing.displayName}: ${standing.totalScore}`
    ]))) : ""
  ]);
}

function renderLobby() {
  const panel = el("aside", { className: "lobby-panel" });
  panel.appendChild(el("div", { className: "panel-head" }, [
    el("h2", {}, [t("Tables")]),
    el("button", { className: "ghost", type: "button", onclick: () => refreshTables().then(render) }, [t("Refresh")])
  ]));

  const tableName = el("input", {
    placeholder: t("Table name"),
    maxlength: 32,
    value: state.createTableName,
    "data-field": "create-table-name",
    oninput: (event) => {
      state.createTableName = event.target.value;
    }
  });
  panel.appendChild(el("div", { className: "create-row" }, [
    tableName,
    el("button", {
      type: "button",
      onclick: async () => {
        await createTable(state.createTableName);
      }
    }, [t("Create")])
  ]));

  const list = el("div", { className: "table-list" });
  if (state.tables.length === 0) {
    list.appendChild(el("div", { className: "empty-state" }, [t("No tables yet.")]));
  } else {
    for (const table of state.tables) {
      list.appendChild(renderTableRow(table));
    }
  }
  panel.appendChild(list);
  return panel;
}

function renderTableRow(table) {
  return el("button", {
    className: "table-row",
    type: "button",
    onclick: () => openTable(table.id, !table.youAreSeated && table.canJoin)
  }, [
    el("span", {}, [
      el("strong", {}, [table.name]),
      el("span", { className: "meta" }, [
        tableMeta(table)
      ])
    ]),
    el("span", { className: "pill" }, [tableLabel(table)])
  ]);
}

function renderRoomArea() {
  const area = el("section", { className: "table-layout" });
  const room = el("div", { className: "poker-room" });

  if (!state.table) {
    room.appendChild(el("div", { className: "room-placeholder" }, [
      el("div", {}, [
        el("h2", {}, [t("Choose or create a table")])
      ])
    ]));
    area.append(room, renderSidePanel(null));
    return area;
  }

  room.appendChild(renderPokerTable(state.table));
  area.append(room, renderSidePanel(state.table));
  return area;
}

function renderPokerTable(table) {
  const felt = el("section", { className: "felt" });
  const seatGrid = el("div", { className: "seat-grid" });
  const seatsForView = orderedSeatsForView(table);

  for (let i = 0; i < table.maxSeats; i += 1) {
    const seat = seatsForView[i];
    seatGrid.appendChild(seat ? renderSeat(seat, i) : el("div", { className: `seat seat-${i} empty` }));
  }

  const community = el("div", { className: "community" });
  const cards = table.community.length ? table.community : [];
  for (const card of cards) community.appendChild(cardImage(card));
  while (community.children.length < 5) {
    community.appendChild(el("div", { className: "card-slot" }));
  }

  felt.append(
    seatGrid,
    el("div", { className: "center-board" }, [
      el("div", { className: "pot" }, [`${t("Pot")} ${table.pot}`]),
      community
    ])
  );
  return felt;
}

function orderedSeatsForView(table) {
  const seats = table.seats.filter(Boolean);
  const youIndex = seats.findIndex((seat) => seat.seatId === table.youSeatId);
  if (youIndex < 0) return seats;
  return seats.slice(youIndex).concat(seats.slice(0, youIndex));
}

function renderSeat(seat, index) {
  const classes = [
    "seat",
    `seat-${index}`,
    seat.isAction ? "is-action" : "",
    seat.isYou ? "is-you" : "",
    seat.wonLastHand ? "won-last-hand" : ""
  ].filter(Boolean).join(" ");

  const badges = el("div", { className: "badges" });
  if (seat.isHost) badges.appendChild(el("span", { className: "badge gold" }, [t("Host")]));
  if (seat.isDealer) badges.appendChild(el("span", { className: "badge gold" }, [t("D")]));
  if (seat.isYou) badges.appendChild(el("span", { className: "badge" }, [t("You")]));
  if (seat.kind === "bot") badges.appendChild(el("span", { className: "badge" }, [t("CPU")]));
  if (seat.ready && !seat.inHand) badges.appendChild(el("span", { className: "badge" }, [t("Ready")]));
  if (seat.sittingOut && !seat.inHand && !seat.eliminated) badges.appendChild(el("span", { className: "badge" }, [t("Next")]));
  if (seat.folded) badges.appendChild(el("span", { className: "badge" }, [t("Fold")]));
  if (seat.allIn) badges.appendChild(el("span", { className: "badge red" }, [t("All in")]));
  if (seat.eliminated) badges.appendChild(el("span", { className: "badge red" }, [t("Out")]));
  if (seat.left) badges.appendChild(el("span", { className: "badge red" }, [t("Left")]));

  const hole = el("div", { className: "hole" });
  for (const card of seat.hole) hole.appendChild(cardImage(card));
  const winStars = seat.winCount > 0
    ? el("span", { className: "win-stars", title: `${seat.winCount}` }, [starText(seat.winCount)])
    : "";
  const resultMarker = renderSeatResultMarker(seat);

  return el("article", { className: classes, "data-seat-id": seat.seatId, "data-seat-mode": "holdem" }, [
    winStars,
    resultMarker,
    el("div", { className: "seat-head" }, [
      el("div", { className: "seat-identity" }, [
        el("div", { className: "seat-avatar-wrap" }, [
          avatarNode(seat.avatar, seat.displayName, "seat-avatar"),
          tomatoButton("holdem", seat)
        ]),
        el("div", { className: "seat-name", title: seat.displayName }, [seat.displayName])
      ]),
      badges
    ]),
    el("div", { className: seatStateClass(seat) }, [seatStateText(seat)]),
    el("div", { className: "stack-line" }, [
      el("span", {}, [`${t("Stack")} ${seat.stack}`]),
      el("span", {}, [seat.betThisRound ? `${t("Bet")} ${seat.betThisRound}` : ""])
    ]),
    hole,
    seat.isAction ? el("div", { className: "turn-timer" }, [actionTimerText(state.table)]) : "",
    seat.bestHand ? el("div", { className: "best-hand", title: seat.bestHand }, [translateHand(seat.bestHand)]) : ""
  ]);
}

function renderSeatResultMarker(seat) {
  if (!state.table || seat.lastResultHandNumber !== state.table.handNumber) return "";
  if (seat.wonLastHand && seat.lastWinAmount > 0) {
    return el("div", { className: "seat-result victory-result" }, [
      el("strong", {}, [t("Victory")]),
      el("span", {}, [`+${seat.lastWinAmount}`])
    ]);
  }
  if (seat.lastDelta < 0) {
    return el("div", { className: "seat-result loss-result" }, [
      el("span", {}, [`-${Math.abs(seat.lastDelta)}`])
    ]);
  }
  return "";
}

function cardImage(card) {
  return el("img", {
    className: "card-img",
    src: card.image,
    alt: card.displayCode || card.code,
    draggable: false
  });
}

function renderSidePanel(table) {
  const panel = el("aside", { className: "side-panel" });
  if (!table) {
    panel.appendChild(el("h3", {}, [t("Room")]));
    panel.appendChild(el("div", { className: "empty-state" }, [t("No table selected.")]));
    return panel;
  }

  const headActions = [];
  if (table.canLeave) {
    headActions.push(el("button", {
      className: "ghost danger-text",
      type: "button",
      onclick: leaveTable
    }, [t("Leave")]));
  }

  panel.appendChild(el("div", { className: "panel-head" }, [
    el("h2", {}, [table.name]),
    el("div", { className: "head-actions" }, [
      el("span", { className: "pill" }, [phaseText(table.phase)]),
      ...headActions
    ])
  ]));

  panel.appendChild(renderActionPanel(table));

  if (table.results.length) {
    panel.appendChild(el("section", { className: "action-panel" }, [
      el("h3", {}, [t("Result")]),
      el("ul", { className: "status-lines" }, table.results.map((line) => el("li", {}, [translateLine(line)])))
    ]));
  }

  panel.appendChild(el("section", { className: "action-panel" }, [
    el("h3", {}, [t("Status")]),
    el("ul", { className: "status-lines" }, [
      el("li", {}, [el("strong", {}, [isZh() ? "第 " : `${t("Hand")} `]), String(table.handNumber), isZh() ? ` ${t("Hand")}` : ""]),
      el("li", {}, [el("strong", {}, [`${t("Blinds")} `]), `${table.smallBlind}/${table.bigBlind}`]),
      el("li", {}, [el("strong", {}, [`${t("Current bet")} `]), String(table.currentBet)]),
      el("li", {}, [el("strong", {}, [`${t("Ready seats")} `]), String(table.readySeats)])
    ])
  ]));

  panel.appendChild(el("section", { className: "action-panel" }, [
    el("h3", {}, [t("Log")]),
    el("ul", { className: "message-list" }, table.messages.map((line) => el("li", {}, [translateLine(line)])))
  ]));

  return panel;
}

function renderActionPanel(table) {
  const panel = el("section", { className: "action-panel" });
  panel.appendChild(el("h3", {}, [t("Action")]));
  const you = table.seats.find((seat) => seat.isYou);

  if (you) {
    panel.appendChild(el("div", { className: seatStateClass(you) }, [seatStateText(you)]));
  }

  const tableControls = [];
  if (table.canRebuy && you && you.eliminated) {
    tableControls.push(el("button", {
      type: "button",
      onclick: rebuy
    }, [t("Try again")]));
  }
  if (table.canReady && you && !(you.inHand && isLivePhase(table.phase))) {
    tableControls.push(el("button", {
      className: you.ready ? "secondary" : "",
      type: "button",
      onclick: () => setReady(!you.ready)
    }, [you.ready ? t("Cancel ready") : t("Ready")]));
  }
  if (table.isHost && table.canAddBot) {
    tableControls.push(el("button", {
      className: "secondary",
      type: "button",
      onclick: addBot
    }, [t("Add CPU")]));
  }
  if (table.isHost && ["waiting", "showdown", "finished"].includes(table.phase)) {
    tableControls.push(el("button", {
      type: "button",
      disabled: !table.canStart,
      onclick: startHand
    }, [table.phase === "waiting" ? t("Start") : t("Next hand")]));
  }

  if (tableControls.length) {
    panel.appendChild(el("div", { className: "control-grid" }, tableControls));
    panel.appendChild(el("div", { className: "hint-line" }, [
      isZh() ? `${table.readySeats} 个已准备席位` : `${table.readySeats} ready seat${table.readySeats === 1 ? "" : "s"}`
    ]));
  }

  const legal = table.legalActions;
  if (!legal.active) {
    const actionSeat = table.seats.find((seat) => seat.seatId === table.actionSeatId);
    panel.appendChild(el("div", { className: "empty-state" }, [
      actionSeat ? (isZh() ? `轮到 ${actionSeat.displayName} ${actionTimerText(table)}` : `${actionSeat.displayName}'s turn ${actionTimerText(table)}`) : t("Waiting")
    ]));
    return panel;
  }

  const targetKey = `${table.id}:${table.actionSeatId}`;
  if (state.raiseTargets[targetKey] === undefined) {
    state.raiseTargets[targetKey] = String(legal.minTarget);
  }
  const raiseInput = el("input", {
    type: "number",
    min: legal.minTarget,
    max: legal.maxTarget,
    step: 1,
    value: state.raiseTargets[targetKey],
    "data-field": `raise-${targetKey}`,
    oninput: (event) => {
      state.raiseTargets[targetKey] = event.target.value;
    }
  });

  panel.appendChild(el("div", { className: "actions" }, [
    el("div", { className: "hint-line strong" }, [`${t("Your turn")} ${actionTimerText(table)}`]),
    el("div", { className: "action-row" }, [
      el("button", {
        className: "danger",
        type: "button",
        onclick: () => act("fold")
      }, [t("Fold")]),
      legal.canCheck
        ? el("button", { type: "button", onclick: () => act("check") }, [t("Check")])
        : el("button", { type: "button", onclick: () => act("call") }, [`${t("Call")} ${legal.toCall}`])
    ]),
    el("div", { className: "raise-row" }, [
      raiseInput,
      el("button", {
        type: "button",
        disabled: !legal.canRaise,
        onclick: () => act("raise", Number(state.raiseTargets[targetKey]))
      }, [table.currentBet === 0 ? t("Bet") : t("Raise")])
    ]),
    el("button", {
      className: "secondary",
      type: "button",
      disabled: !legal.canAllIn,
      onclick: () => act("allin")
    }, [t("All in")])
  ]));

  return panel;
}

function renderScoreBattleApp() {
  const layout = el("section", { className: `lobby-layout score-lobby-layout ${state.scoreTable ? "has-table" : ""}` });
  layout.append(renderScoreLobby(), renderScoreRoomArea());
  return layout;
}

function renderScoreLobby() {
  const panel = el("aside", { className: "lobby-panel" });
  panel.appendChild(el("div", { className: "panel-head" }, [
    el("h2", {}, [t("Score tables")]),
    el("button", { className: "ghost", type: "button", onclick: () => refreshScoreTables().then(render) }, [t("Refresh")])
  ]));

  const tableName = el("input", {
    placeholder: t("Score table name"),
    maxlength: 32,
    value: state.createScoreTableName,
    "data-field": "create-score-table-name",
    oninput: (event) => {
      state.createScoreTableName = event.target.value;
    }
  });
  panel.appendChild(el("div", { className: "create-row" }, [
    tableName,
    el("button", { type: "button", onclick: () => createScoreTable(state.createScoreTableName) }, [t("Create")])
  ]));
  panel.appendChild(el("button", {
    className: "ghost full-width",
    type: "button",
    onclick: openBattleRules
  }, [t("Scoring rules")]));
  panel.appendChild(el("button", {
    className: "secondary full-width",
    type: "button",
    onclick: () => {
      state.showFeedbackModal = true;
      render();
    }
  }, [t("Message admin")]));

  const list = el("div", { className: "table-list" });
  if (state.scoreTables.length === 0) {
    list.appendChild(el("div", { className: "empty-state" }, [t("No tables yet.")]));
  } else {
    for (const table of state.scoreTables) list.appendChild(renderScoreTableRow(table));
  }
  panel.appendChild(list);
  return panel;
}

function renderScoreTableRow(table) {
  const label = table.youAreSeated ? t("Open") : table.canJoin ? t("Join score battle") : t("Watch score battle");
  const phase = scorePhaseText(table.phase);
  const meta = isZh()
    ? `${phase} | ${t("Round")} ${table.round || "-"} | ${table.seats}/${table.maxSeats} | ${table.readySeats} ${t("Ready")}`
    : `${phase} | round ${table.round || "-"} | ${table.seats}/${table.maxSeats} | ${table.readySeats} ready`;
  return el("button", {
    className: "table-row",
    type: "button",
    onclick: () => openScoreTable(table.id, !table.youAreSeated && table.canJoin)
  }, [
    el("span", {}, [el("strong", {}, [table.name]), el("span", { className: "meta" }, [meta])]),
    el("span", { className: "pill" }, [label])
  ]);
}

function renderScoreRoomArea() {
  const area = el("section", { className: "table-layout score-table-layout" });
  const room = el("div", { className: "poker-room" });
  if (!state.scoreTable) {
    room.appendChild(el("div", { className: "room-placeholder" }, [
      el("div", {}, [el("h2", {}, [t("Choose or create a score battle table")])])
    ]));
    area.append(room, renderScoreSidePanel(null));
    return area;
  }
  room.appendChild(renderScoreTable(state.scoreTable));
  area.append(room, renderScoreSidePanel(state.scoreTable));
  return area;
}

function renderScoreTable(table) {
  const seats = orderedScoreSeats(table);
  const felt = el("section", { className: `felt score-felt seats-${seats.length}` });
  const seatGrid = el("div", { className: `score-seat-grid seats-${seats.length}` });
  for (let index = 0; index < seats.length; index += 1) {
    seatGrid.appendChild(renderScoreSeat(seats[index], index));
  }

  const community = renderScoreCommunity(table);

  const title = table.phase === "waiting"
    ? t("Score Battle")
    : `${t("Round")} ${table.round}/${table.rounds || 5}`;
  felt.append(
    el("div", { className: "center-board score-center-board" }, [
      el("div", { className: "score-title" }, [
        el("span", { className: "score-title-text" }, [title]),
        renderRoyalVictorySuits(table)
      ]),
      el("div", { className: "score-community-area" }, [
        community,
        renderScoreRoundEffects(table)
      ])
    ]),
    seatGrid,
    renderScoreFateOverlay(table),
    renderRoyalVictoryOverlay(table)
  );
  return felt;
}

function renderRoyalVictorySuits(table) {
  const suits = Array.isArray(table.royalVictorySuits) ? table.royalVictorySuits.slice(0, 1) : [];
  if (table.phase === "waiting" || !suits.length) return "";
  const symbols = { S: "\u2660", H: "\u2665", D: "\u2666", C: "\u2663" };
  return el("span", { className: "royal-victory-suits", title: t("Winning Royal Flush suit") }, suits.map((suit) => el("span", {
    className: `royal-suit-icon ${["H", "D"].includes(suit) ? "is-red" : "is-black"}`,
    "aria-label": battleSuitName(suit)
  }, [symbols[suit] || suit])));
}

function renderScoreFateOverlay(table) {
  const you = (table.seats || []).find((seat) => seat.isYou);
  if (!you?.requiresFateChoice || !(you.fateOptions || []).length) return "";
  return el("div", { className: "fate-overlay", role: "dialog", "aria-modal": "true", "aria-labelledby": "fate-title" }, [
    el("section", { className: "fate-choice-panel" }, [
      el("div", { className: "fate-choice-head" }, [
        el("span", { className: "fate-label" }, ["FATE"]),
        el("h2", { id: "fate-title" }, [t("Choose one of two FATE cards")]),
        el("p", {}, [t("FATE is required in round 1.")])
      ]),
      el("div", { className: "fate-choice-grid" }, (you.fateOptions || []).map((fate) => el("button", {
        className: "fate-choice-card",
        type: "button",
        disabled: state.battleFateBusy,
        onclick: () => chooseBattleFate(fate.id)
      }, [
        el("span", { className: "fate-card-label" }, ["FATE"]),
        el("strong", {}, [scoreFateName(fate)]),
        el("span", {}, [scoreFateDescription(fate)])
      ])))
    ])
  ]);
}

function renderScoreRoundEffects(table) {
  const effects = table.roundEffects || [];
  if (!effects.length) return "";
  return el("div", { className: "round-effect-strip" }, effects.map((effect) => el("span", {
    className: "round-effect-pill",
    tabindex: effect.kind === "void-suit" ? "0" : "-1",
    title: battleEffectDescription(effect)
  }, [
    effect.kind === "void-suit"
      ? `${battleSuitName(effect.suit)} ${t("Sealed")}`
      : `${battleEffectName(effect)}: ${battleEffectDescription(effect)}`
  ])));
}

function renderRoyalVictoryOverlay(table) {
  const animation = state.royalVictoryAnimation;
  if (!animation || animation.tableId !== table.id) return "";
  const elapsedSeconds = Math.max(0, (Date.now() - animation.startedAt) / 1000);
  if (elapsedSeconds * 1000 >= animation.duration) return "";
  const positions = [
    ["50%", "12%"],
    ["79%", "34%"],
    ["68%", "72%"],
    ["32%", "72%"],
    ["21%", "34%"]
  ];
  const cards = animation.cards.map((card, index) => {
    const [x, y] = positions[index];
    const flipDelay = 0.45 + index * 0.62 - elapsedSeconds;
    return el("div", {
      className: "royal-victory-card-slot",
      style: `--royal-x:${x};--royal-y:${y};--royal-flip-delay:${flipDelay.toFixed(3)}s`
    }, [
      el("div", { className: "royal-victory-card-flipper" }, [
        el("img", { className: "royal-victory-card-face is-back", src: "/cards/BACK.svg", alt: "", draggable: false }),
        el("img", {
          className: "royal-victory-card-face is-front",
          src: card.image,
          alt: card.displayCode || card.code,
          draggable: false
        })
      ])
    ]);
  });
  const textDelay = 3.75 - elapsedSeconds;
  return el("div", {
    className: "royal-victory-overlay",
    role: "status",
    "aria-live": "assertive"
  }, [
    el("div", { className: "royal-victory-cards" }, cards),
    el("div", { className: "royal-victory-message", style: `--royal-text-delay:${textDelay.toFixed(3)}s` }, [
      el("strong", {}, [animation.winnerName]),
      el("span", {}, [isZh() ? "通过皇家同花顺获胜！" : "Wins with a Royal Flush!"])
    ])
  ]);
}

function renderScoreCommunity(table) {
  const animation = activeCommunityAnimation(table);
  const community = el("div", { className: `community score-community ${animation ? "is-refreshing" : ""}` });
  const cards = animation ? animation.cards : table.community;
  for (let index = 0; index < cards.length; index += 1) {
    community.appendChild(renderBattleCard(cards[index], "community", table, {
      extraClass: animation ? animation.className : "",
      style: animation ? `--card-index: ${index}` : ""
    }));
  }
  while (community.children.length < 5) community.appendChild(el("div", { className: "card-slot" }));
  return community;
}

function activeCommunityAnimation(table) {
  const animation = state.battleCommunityAnimation;
  if (!animation || animation.tableId !== table.id || animation.round !== table.round) return null;
  const elapsed = Date.now() - animation.startedAt;
  if (elapsed >= animation.duration) return null;
  if (elapsed < 460) return { cards: animation.from, className: "is-flipping-out" };
  if (elapsed < 900) return { cards: Array.from({ length: 5 }, () => ({ code: "BACK", image: "/cards/BACK.svg" })), className: "is-card-back" };
  return { cards: animation.to, className: "is-flipping-in" };
}

function orderedScoreSeats(table) {
  const seats = table.seats.filter((seat) => !seat.left);
  const youIndex = seats.findIndex((seat) => seat.isYou);
  if (youIndex < 0) return seats;
  return seats.slice(youIndex).concat(seats.slice(0, youIndex));
}

function renderScoreSeat(seat, index) {
  const classes = [
    "score-seat",
    `score-seat-${index}`,
    seat.isYou ? "is-you" : "",
    seat.isYou && (seat.hand || []).length > 5 ? "has-wide-hand" : "",
    seat.submitted ? "is-submitted" : "",
    seat.wonLastGame ? "won-last-game" : "",
    seat.isScoreTurn ? "is-score-turn" : "",
    seat.isCurrentRoundLeader ? "is-current-round-leader" : "",
    seat.isPreviousRoundLeader ? "is-previous-round-leader" : "",
    isBattleEffectTargetSeat(seat) ? "is-effect-target-candidate" : "",
    state.battleEffectTarget?.targetSeatId === seat.seatId ? "is-effect-target-selected" : ""
  ].filter(Boolean).join(" ");
  const props = { className: classes, "data-seat-id": seat.seatId, "data-seat-mode": "score" };
  if (isBattleEffectTargetSeat(seat)) {
    props.onclick = () => chooseBattleEffectTargetSeat(seat.seatId);
  }
  const badges = el("div", { className: "badges" });
  if (seat.isHost) badges.appendChild(el("span", { className: "badge gold" }, [t("Host")]));
  if (seat.kind === "bot") badges.appendChild(el("span", { className: "badge" }, [t("CPU")]));
  if (seat.isYou) badges.appendChild(el("span", { className: "badge" }, [t("You")]));
  if (seat.isScoreTurn) badges.appendChild(el("span", { className: "badge gold" }, [t("Score turn")]));
  if (seat.isScoreTurn && state.scoreTable?.phase === "play-select") {
    badges.appendChild(el("span", { className: "badge score-clock-badge" }, [
      el("span", {}, [t("Countdown")]),
      el("strong", {}, [scoreTimerText(state.scoreTable)])
    ]));
  }

  const status = seat.left
    ? t("Left")
    : seat.inGame
      ? (seat.submitted ? t("Submitted") : t("Playing"))
      : (seat.ready ? t("Ready") : t("Spectating"));
  const statusClass = seat.left
    ? "red"
    : seat.inGame
      ? (seat.submitted ? "submitted" : "playing")
      : (seat.ready ? "ready" : "watching");
  badges.appendChild(el("span", { className: `badge score-status-badge ${statusClass}` }, [status]));
  badges.appendChild(renderScoreTomatoBadge(seat));
  const hand = el("div", { className: "battle-hand" });
  if (seat.isYou && seat.inGame) {
    for (const card of seat.hand) hand.appendChild(renderBattleCard(card, "hand", state.scoreTable));
  }

  const actions = seat.isYou ? renderScoreSeatActions(seat) : "";
  const winStars = seat.winCount > 0
    ? el("span", { className: "score-win-stars", title: `${seat.winCount}` }, [starText(seat.winCount)])
    : "";
  const leaderTags = (seat.isCurrentRoundLeader || seat.isPreviousRoundLeader)
    ? el("div", { className: "score-leader-tags" }, [
      seat.isCurrentRoundLeader ? el("span", { className: "leader-tag current" }, [t("Current round leader")]) : "",
      seat.isPreviousRoundLeader ? el("span", { className: "leader-tag previous" }, [t("Previous round leader")]) : ""
    ])
    : "";
  const selectedEffect = seat.selectedEffect
    ? el("div", { className: "selected-effect-line", title: battleEffectDescription(seat.selectedEffect) }, [
      battleEffectName(seat.selectedEffect)
    ])
    : "";
  const fate = renderScoreFateLine(seat);
  const persistentEffects = renderScorePersistentEffects(seat);
  const scorePreview = seat.isYou ? renderScorePreview() : "";
  const result = renderScoreSeatResult(seat);
  const giantDeductionRound = Math.max(0, Number(seat.lastGiantDeductionRound) || 0);
  const giantDeduction = giantDeductionRound
    ? el("div", { className: "score-giant-deduction-line" }, [
      isZh()
        ? `上一回合巨人扣分（第${giantDeductionRound}回合）：-${seat.lastGiantDeduction || 0}`
        : `Last Giant deduction (round ${giantDeductionRound}): -${seat.lastGiantDeduction || 0}`
    ])
    : "";

  return el("article", props, [
    winStars,
    scorePreview,
    leaderTags,
    el("div", { className: "seat-head" }, [
      el("div", { className: "seat-identity" }, [
        el("div", { className: "seat-avatar-wrap" }, [
          avatarNode(seat.avatar, seat.displayName, "seat-avatar"),
          tomatoButton("score", seat)
        ]),
        el("div", { className: "seat-name", title: seat.displayName }, [seat.displayName])
      ]),
      badges
    ]),
    el("div", { className: "score-line" }, [
      el("span", {}, [`${t("Score")} ${seat.roundScore || 0}`]),
      el("strong", {}, [`${t("Total")} ${seat.totalScore || 0}`])
    ]),
    giantDeduction,
    fate,
    selectedEffect,
    persistentEffects,
    actions,
    result,
    hand
  ]);
}

function renderScoreSeatResult(seat) {
  if (!seat.lastResult) return "";
  if (seat.isYou) {
    return el("div", { className: "battle-result" }, [
      el("strong", {}, [translateBattleHand(seat.lastResult.handName)]),
      el("span", {}, [`${t("Score")} ${seat.lastResult.score}`]),
      seat.lastResult.automatic ? el("span", { className: "result-note" }, [
        seat.lastResult.automaticReason === "one-click" ? t("One-click play") : t("Automatic")
      ]) : "",
      renderScoreResultCards(seat.lastResult)
    ]);
  }
  return el("div", {
    className: "battle-result is-concealed",
    tabindex: "0",
    title: t("Hover or tap to view cards")
  }, [
    el("strong", {}, [`${t("Score")} ${seat.lastResult.score}`]),
    el("span", { className: "result-reveal-hint" }, [t("Played cards")]),
    el("div", { className: "battle-result-popover" }, [
      el("strong", {}, [translateBattleHand(seat.lastResult.handName)]),
      renderScoreResultCards(seat.lastResult)
    ])
  ]);
}

function renderScoreFateLine(seat) {
  const fate = seat.fate;
  if (!fate) return "";
  const details = [];
  let collection = "";
  if (fate.kind === "dice") {
    details.push(`x${fate.diceValue || "-"}`);
    details.push(`${t("Dice")} ${fate.diceCount || 1}`);
    details.push(`${t("Misfortune")} ${fate.misfortune || 0}/3`);
  }
  if (["big-short", "going-long"].includes(fate.kind)) {
    if (fate.targetName) details.push(`${t("Target")}: ${fate.targetName}`);
    const successLabel = fate.kind === "big-short" ? t("Short successes") : t("Long successes");
    details.push(`${successLabel} ${fate.predictionSuccessCount || 0}`);
  }
  if (fate.kind === "fate-collector") {
    const collectedHandIds = Array.isArray(fate.collectedHandIds) ? fate.collectedHandIds : [];
    details.push(`${t("Collected hands")} ${fate.collectedHandCount || 0}/5`);
    collection = el("span", { className: "score-fate-collection" }, collectedHandIds.length
      ? collectedHandIds.map((handId) => el("span", { className: "score-fate-collection-item" }, [translateBattleHandId(handId)]))
      : [t("None yet")]);
  }
  if (fate.kind === "giant") {
    if (fate.giantDefenseActive) details.push(`${t("Defense active")} ${Math.round((Number(fate.giantDefenseReduction) || 0) * 100)}%`);
    else if (fate.giantDefenseUsed) details.push(t("Defense used"));
    if (fate.lastGiantPenalty) details.push(`-${fate.lastGiantPenalty}`);
    details.push(`${t("Damage dealt")} ${fate.damageDealt || 0}`);
  }
  const defenseButton = fate.kind === "giant" && seat.isYou && seat.canUseGiantDefense && !fate.giantDefenseUsed
    ? el("button", {
      className: "giant-defense-button giant-defense-inline-button",
      type: "button",
      disabled: state.battleFateBusy,
      onclick: (event) => {
        event.stopPropagation();
        useBattleGiantDefense();
      }
    }, [t("Use Defense Stance")])
    : "";
  return el("div", {
    className: `score-fate-line ${defenseButton ? "has-defense-action" : ""}`.trim(),
    title: scoreFateDescription(fate)
  }, [
    el("span", { className: "fate-label compact" }, ["FATE"]),
    el("strong", {}, [scoreFateName(fate)]),
    details.length ? el("span", {}, [details.join(" | ")]) : "",
    collection,
    defenseButton
  ]);
}

function renderScoreTomatoBadge(seat) {
  const counts = seat.tomatoCounts || {};
  const hitBefore = Number(counts.hitsBeforeRound) || 0;
  const hitTotal = Number(counts.hitsTotal) || 0;
  const throwBefore = Number(counts.throwsBeforeRound) || 0;
  const throwTotal = Number(counts.throwsTotal) || 0;
  const label = isZh()
    ? `番茄中 ${hitBefore}/${hitTotal} | 投 ${throwBefore}/${throwTotal}`
    : `Hit ${hitBefore}/${hitTotal} | Throw ${throwBefore}/${throwTotal}`;
  const title = isZh()
    ? "格式：本回合前/当前本局累计；叠角龙激活后显示有效计数"
    : "Format: before this round/current game total; Protoceratops shows effective counts";
  return el("span", { className: "badge tomato-count-badge", title }, [label]);
}

function renderScorePersistentEffects(seat) {
  const effects = Array.isArray(seat.persistentEffects) ? seat.persistentEffects : [];
  const profile = seat.criticalProfile || {};
  const critChance = Number(profile.chance) || 0;
  const critMultiplier = Number(profile.multiplier) || 1;
  const attackProfile = seat.attackSpeedProfile || {};
  const attackSpeed = Number(attackProfile.speed) || 1;
  return el("div", { className: `persistent-effect-line ${effects.length ? "" : "is-empty"}` }, [
    el("span", { className: "persistent-effect-pill crit-rate-pill" }, [
      `${t("Crit rate")} ${formatPercent(critChance)}${critChance > 0 ? ` x${formatCompactNumber(critMultiplier)}` : ""}`
    ]),
    el("span", { className: "persistent-effect-pill attack-speed-pill" }, [
      `${t("Attack speed")} x${formatCompactNumber(attackSpeed)}`
    ]),
    ...effects.map((effect) => el("span", {
      className: "persistent-effect-pill",
      title: battleEffectDescription(effect)
    }, [battleEffectName(effect)]))
  ]);
}

function formatPercent(value) {
  const percent = Math.round((Number(value) || 0) * 1000) / 10;
  return `${Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(1)}%`;
}

function formatCompactNumber(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : String(Math.round(number * 100) / 100);
}

function renderScoreSeatActions(seat) {
  const table = state.scoreTable;
  if (!table || !seat.inGame || seat.submitted || table.phase !== "play-select" || !seat.isScoreTurn) return "";
  const selectedCount = state.battleSelections.length;
  const handCodes = new Set((seat.hand || []).map((card) => card.code));
  const selectedHandOnly = state.battleSelections.every((code) => handCodes.has(code));
  const selectedHasCommunity = state.battleSelections.some((code) => (table.community || []).some((card) => card.code === code));
  const canDiscard = seat.canDiscardThisRound && selectedCount >= 1 && selectedHandOnly;
  const fateReady = seat.fateChosen && (!["big-short", "going-long"].includes(seat.fate?.kind) || seat.fate?.targetSeatId);
  const canPlay = fateReady && selectedCount === 5 && selectedHasCommunity;
  return el("div", { className: "score-seat-actions" }, [
    renderScoreFateControls(seat, table),
    el("div", { className: "hint-line" }, [
      `${t("Selected cards")}: ${selectedCount}/5`,
      selectedCount === 5 && !selectedHasCommunity ? ` | ${t("Must include community card")}` : "",
      selectedCount > 5 ? ` | ${t("Discard any number of selected hand cards.")}` : ""
    ]),
    el("div", { className: "battle-action-row score-play-actions" }, [
      el("button", {
        className: "secondary",
        type: "button",
        disabled: !canDiscard,
        onclick: discardBattleCards
      }, [`${t("Discard selected")} (${seat.discardUsesLeft})`]),
      el("button", {
        type: "button",
        disabled: !canPlay,
        onclick: submitBattlePlay
      }, [`${t("Submit play")} ${selectedCount}/5`]),
      el("button", {
        className: "score-one-click-play",
        type: "button",
        disabled: Boolean(state.battleEffectTarget) || !seat.canAutoPlay || state.battleAutoPlayBusy,
        onclick: autoPlayBattleHand
      }, [state.battleAutoPlayBusy ? t("Choosing best play") : t("One-click play")])
    ])
  ]);
}

function renderScoreFateControls(seat, table) {
  const fate = seat.fate;
  if (!fate) return el("div", { className: "fate-required-note" }, [t("Choose one FATE before playing.")]);
  if (fate.kind === "giant") return "";
  if (fate.kind === "dice") {
    const rolls = (fate.diceRolls || []).map((roll) => `x${roll}`).join(", ") || "-";
    return el("div", { className: "fate-turn-controls" }, [
      el("div", { className: "fate-dice-status" }, [
        el("strong", {}, [`${scoreFateName(fate)}: x${fate.diceValue || "-"}`]),
        el("span", {}, [`${t("Rolls left")}: ${fate.diceRollsLeft || 0} | ${t("Misfortune")}: ${fate.misfortune || 0}/3 | ${rolls}`])
      ]),
      el("button", {
        className: "fate-roll-button",
        type: "button",
        disabled: !seat.canRollFateDice || state.battleFateBusy,
        onclick: rollBattleFateDice
      }, [t("Roll dice")])
    ]);
  }
  if (["big-short", "going-long"].includes(fate.kind)) {
    const targets = (table.seats || []).filter((entry) => (
      entry.inGame && !entry.left && (fate.kind === "going-long" || !entry.isYou)
    ));
    return el("div", { className: "fate-turn-controls fate-target-controls" }, [
      el("strong", {}, [t("Choose prediction target")]),
      el("div", { className: "fate-target-grid" }, targets.map((target) => el("button", {
        className: fate.targetSeatId === target.seatId ? "is-selected" : "secondary",
        type: "button",
        disabled: state.battleFateBusy,
        onclick: () => chooseBattleFateTarget(target.seatId)
      }, [`${target.displayName}${target.isYou ? ` (${t("You")})` : ""}`])))
    ]);
  }
  return "";
}

function renderScorePreview() {
  if (!state.battleScorePreviewKey) return "";
  const preview = state.battleScorePreview;
  if (state.battleScorePreviewLoading) {
    return el("div", { className: "score-preview" }, [
      el("strong", {}, [t("Score preview")]),
      el("span", {}, [t("Loading")])
    ]);
  }
  if (!preview || preview.error) {
    return el("div", { className: "score-preview muted" }, [
      el("strong", {}, [t("Score preview")]),
      el("span", {}, [t("Preview unavailable")])
    ]);
  }
  const multiplierText = battleMultiplierFormula(preview);
  const chipText = (preview.chipFactors || []).length
    ? `${preview.chipTotalBeforeFactors ?? preview.chips} x ${(preview.chipFactors || []).map((entry) => entry.factor).join(" x ")} = ${preview.chips}`
    : `${preview.chips}`;
  return el("div", { className: "score-preview" }, [
    el("strong", {}, [`${t("Estimated score")}: ${preview.score}`]),
    el("span", {}, [`${translateBattleHand(preview.handName)} | ${t("Chip total")} ${chipText} | x${multiplierText}`])
  ]);
}

function renderScoreResultCards(result) {
  if (!result || !Array.isArray(result.cards) || result.cards.length === 0) return "";
  return el("div", { className: "battle-result-cards" }, result.cards.map((card) => renderBattleCard(card, "result", state.scoreTable, {
    extraClass: card.source === "community" ? "is-community-played" : ""
  })));
}

function renderBattleCard(card, source, table, options = {}) {
  const you = table.seats.find((seat) => seat.isYou);
  const interactive = Boolean(you && you.inGame && you.isScoreTurn && !you.submitted && table.phase === "play-select");
  const selected = state.battleEffectTarget
    ? state.battleEffectTarget.cardTargets.some((entry) => entry.code === card.code)
    : state.battleSelections.includes(card.code);
  const communityPlayed = card.source === "community";
  const nonScoring = source === "result" && card.scoresHand === false;
  const classes = [
    "battle-card",
    selected ? "is-selected" : "",
    state.battleEffectTarget ? "is-effect-target-mode" : "",
    communityPlayed ? "is-community-played" : "",
    nonScoring ? "is-non-scoring-card" : "",
    options.extraClass || ""
  ].filter(Boolean).join(" ");
  const props = { className: classes };
  const secondDeckTag = Number(card.deckNumber) >= 2
    ? el("span", { className: "second-deck-tag" }, [t("Second deck")])
    : "";
  if (options.style) props.style = options.style;
  if (nonScoring) props.title = t("Not part of scoring hand");
  if (!interactive || source === "result" || card.code === "BACK") {
    return el("div", props, [
      cardImage(card),
      communityPlayed ? el("span", { className: "community-tag" }, [t("Community card")]) : "",
      nonScoring ? el("span", { className: "non-scoring-tag" }, [t("Bonus only")]) : "",
      secondDeckTag
    ]);
  }
  return el("button", {
    className: classes,
    type: "button",
    "aria-pressed": selected ? "true" : "false",
    style: options.style || "",
    onclick: () => toggleBattleCard(card.code, source)
  }, [cardImage(card), secondDeckTag]);
}

function renderScoreSidePanel(table) {
  const panel = el("aside", { className: "side-panel score-side-panel" });
  if (!table) {
    panel.appendChild(el("h3", {}, [t("Score Battle")]));
    panel.appendChild(el("div", { className: "empty-state" }, [t("Choose or create a score battle table")]));
    panel.appendChild(el("button", {
      className: "ghost full-width",
      type: "button",
      onclick: openBattleRules
    }, [t("Scoring rules")]));
    return panel;
  }
  const leave = table.canLeave
    ? el("button", { className: "ghost danger-text", type: "button", onclick: leaveScoreTable }, [t("Leave")])
    : "";
  const addCpu = canShowAddScoreBot(table)
    ? el("button", { className: "ghost", type: "button", onclick: addScoreBot }, [t("Add CPU")])
    : "";
  panel.appendChild(el("div", { className: "panel-head" }, [
    el("h2", {}, [table.name]),
    el("div", { className: "head-actions" }, [el("span", { className: "pill" }, [scorePhaseText(table.phase)]), addCpu, leave])
  ]));
  panel.appendChild(el("button", {
    className: "ghost full-width",
    type: "button",
    onclick: openBattleRules
  }, [t("Scoring rules")]));
  panel.appendChild(renderScoreActionPanel(table));

  if (table.results.length) {
    panel.appendChild(el("section", { className: "action-panel" }, [
      el("h3", {}, [table.phase === "finished" ? t("Final standings") : t("Round result")]),
      el("ul", { className: "status-lines" }, table.results.map((line) => el("li", {}, [line])))
    ]));
  }
  panel.appendChild(el("section", { className: "action-panel" }, [
    el("h3", {}, [t("Status")]),
    el("ul", { className: "status-lines" }, [
      el("li", {}, [`${t("Round")} ${table.round || "-"}/${table.rounds || 5}`]),
      table.currentTurnName ? el("li", {}, [`${t("Current turn")}: ${table.currentTurnName}`]) : "",
      el("li", {}, [scoreTimerText(table)]),
      el("li", {}, [`${table.readySeats} ${t("Ready")}`])
    ])
  ]));
  panel.appendChild(renderScoreChatPanel(table));
  panel.appendChild(el("section", { className: "action-panel" }, [
    el("h3", {}, [t("Log")]),
    el("ul", { className: "message-list" }, table.messages.map((line) => el("li", {}, [line])))
  ]));
  return panel;
}

function renderScoreChatPanel(table) {
  const key = table.id;
  const messages = Array.isArray(table.chat) ? table.chat : [];
  const draft = state.scoreChatDrafts[key] || "";
  const list = el("div", {
    className: "score-chat-list",
    "data-score-chat-list": key,
    onscroll: (event) => {
      const node = event.currentTarget;
      state.scoreChatScrolls[key] = node.scrollTop;
      state.scoreChatStickToBottom[key] = node.scrollHeight - node.scrollTop - node.clientHeight < 18;
    }
  }, messages.length
    ? messages.map((message) => el("div", { className: "score-chat-message" }, [
      el("div", { className: "score-chat-meta" }, [
        el("strong", {}, [message.username || t("Player")]),
        el("span", {}, [formatChatTime(message.createdAt)])
      ]),
      el("div", { className: "score-chat-text" }, [message.message || ""])
    ]))
    : [el("div", { className: "empty-state compact" }, [t("No chat messages yet.")])]);

  requestAnimationFrame(() => {
    const node = app.querySelector(`[data-score-chat-list="${key}"]`);
    if (!node) return;
    if (state.scoreChatStickToBottom[key] !== false) node.scrollTop = node.scrollHeight;
    else node.scrollTop = state.scoreChatScrolls[key] || 0;
  });

  const input = el("input", {
    type: "text",
    maxlength: "200",
    value: draft,
    placeholder: t("Message table"),
    "data-field": "score-chat-input",
    disabled: !table.canChat,
    oninput: (event) => {
      state.scoreChatDrafts[key] = event.currentTarget.value;
    }
  });
  const form = el("form", {
    className: "score-chat-form",
    onsubmit: (event) => {
      event.preventDefault();
      sendScoreChatMessage(key);
    }
  }, [
    input,
    el("button", { type: "submit", disabled: !table.canChat }, [t("Send")])
  ]);

  return el("section", { className: "action-panel score-chat-panel" }, [
    el("h3", {}, [t("Table chat")]),
    list,
    table.canChat ? form : el("div", { className: "empty-state compact" }, [t("Only seated players can chat.")])
  ]);
}

function formatChatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function canShowAddScoreBot(table) {
  if (!table) return false;
  const preGame = ["waiting", "finished"].includes(table.phase);
  const visibleSeats = (table.seats || []).filter((seat) => !seat.left).length;
  return Boolean(table.canAddBot || (table.isHost && preGame && visibleSeats < (table.maxSeats || 6)));
}

function renderScoreActionPanel(table) {
  const panel = el("section", { className: "action-panel" });
  const you = table.seats.find((seat) => seat.isYou);
  panel.appendChild(el("h3", {}, [t("Action")]));
  if (!you) {
    panel.appendChild(el("div", { className: "empty-state" }, [t("Spectating")]));
    return panel;
  }

  const controls = [];
  if (table.canReady) {
    controls.push(el("button", {
      className: you.ready ? "secondary" : "",
      type: "button",
      onclick: () => setScoreReady(!you.ready)
    }, [you.ready ? t("Cancel score battle ready") : t("Ready for score battle")]));
  }
  if (canShowAddScoreBot(table)) {
    controls.push(el("button", {
      className: "secondary",
      type: "button",
      onclick: addScoreBot
    }, [t("Add CPU")]));
  }
  if (table.isHost && table.canStart) {
    controls.push(el("button", { type: "button", onclick: startScoreBattle }, [table.phase === "finished" ? t("Next score battle") : t("Start score battle")]));
  }
  if (controls.length) panel.appendChild(el("div", { className: "control-grid" }, controls));

  if (!you.inGame) {
    if (!controls.length) panel.appendChild(el("div", { className: "empty-state" }, [t("Spectating")]));
    return panel;
  }

  if (table.phase !== "play-select") {
    panel.appendChild(el("div", { className: "empty-state" }, [t("Waiting for other players")]));
    return panel;
  }

  if (!you.isScoreTurn) {
    panel.appendChild(el("div", { className: "empty-state" }, [
      table.currentTurnName
        ? `${t("Current turn")}: ${table.currentTurnName} | ${t("Waiting for your turn")}`
        : t("Waiting for your turn")
    ]));
    return panel;
  }

  panel.appendChild(el("div", { className: "hint-line strong" }, [
    `${t("Your score battle turn")} ${scoreTimerText(table)}`
  ]));

  if ((you.effectOptions || []).length || you.selectedEffect) {
    const targetingEffect = state.battleEffectTarget
      ? findYourEffectOption(you, state.battleEffectTarget.effectId)
      : null;
    panel.appendChild(el("div", { className: "hint-line strong" }, [
      you.effectChosen
        ? `${t("Effect locked")}: ${battleEffectName(you.selectedEffect)}`
        : targetingEffect
          ? `${t("Effect locked")}: ${battleEffectName(targetingEffect)}`
        : `${t("Optional effect")} | ${t("You may play without choosing an effect.")}`
    ]));
    if (you.effectChosen && you.selectedEffect) {
      panel.appendChild(el("div", { className: "effect-options" }, [
        el("div", { className: "effect-card is-selected-effect" }, [
          el("strong", {}, [battleEffectName(you.selectedEffect)]),
          el("span", {}, [battleEffectDescription(you.selectedEffect)])
        ])
      ]));
    } else if (targetingEffect) {
      panel.appendChild(el("div", { className: "effect-options" }, [
        el("div", { className: "effect-card is-selected-effect is-targeting-effect" }, [
          el("strong", {}, [battleEffectName(targetingEffect)]),
          el("span", {}, [battleEffectDescription(targetingEffect)])
        ])
      ]));
      panel.appendChild(renderBattleEffectTargetPanel(table, you));
    } else {
      const options = el("div", { className: "effect-options effect-alert" });
      for (const effect of you.effectOptions || []) {
        options.appendChild(el("button", {
          className: "effect-card",
          type: "button",
          onclick: () => beginBattleEffect(effect)
        }, [el("strong", {}, [battleEffectName(effect)]), el("span", {}, [battleEffectDescription(effect)])]));
      }
      panel.appendChild(options);
    }
  }

  panel.appendChild(el("div", { className: "empty-state" }, [
    `${t("Choose exactly 5 cards")} | ${t("Discard uses left")}: ${you.discardUsesLeft}`
  ]));
  return panel;
}

function renderBattleEffectTargetPanel(table, you) {
  const target = state.battleEffectTarget;
  const effect = findYourEffectOption(you, target.effectId);
  if (!effect) return "";
  const ready = battleEffectTargetReady(effect, target);
  return el("div", { className: "effect-target-panel" }, [
    el("div", { className: "hint-line strong" }, [battleEffectTargetPrompt(effect)]),
    el("div", { className: "hint-line" }, [battleEffectTargetStatus(effect, target, table)]),
    el("div", { className: "battle-action-row effect-target-confirm-row" }, [
      el("button", {
        type: "button",
        disabled: !ready,
        onclick: () => confirmBattleEffectTarget(effect)
      }, [t("Confirm effect")])
    ])
  ]);
}

function findYourEffectOption(you, effectId) {
  return (you?.effectOptions || []).find((effect) => effect.id === effectId) || null;
}

function effectNeedsTarget(effect) {
  return ["rank-chip", "pattern-reproduction", "shadow-swap", "void-erosion", "shadow-targeting"].includes(effect?.kind);
}

function beginBattleEffect(effect) {
  if (!effectNeedsTarget(effect)) {
    chooseBattleEffect(effect.id);
    return;
  }
  state.battleSelections = [];
  state.battleScorePreview = null;
  state.battleScorePreviewKey = "";
  state.battleScorePreviewLoading = false;
  state.battleEffectTarget = {
    effectId: effect.id,
    kind: effect.kind,
    cardTargets: [],
    targetSeatId: ""
  };
  render();
}

function battleEffectTargetPrompt(effect) {
  if (effect.kind === "rank-chip") return isZh() ? "选择一张当前手牌或公共牌来确定点数。" : "Choose one current hand or community card to set the rank.";
  if (effect.kind === "pattern-reproduction") return t("Choose two hand cards in order.");
  if (effect.kind === "shadow-swap") return t("Choose one hand card and one community card.");
  if (effect.kind === "void-erosion") return t("Choose one community card.");
  if (effect.kind === "shadow-targeting") return t("Choose two hand cards and one target player.");
  return t("Choose effect targets.");
}

function battleEffectTargetStatus(effect, target, table) {
  const cards = target.cardTargets.map((entry) => entry.code).join(", ") || "-";
  if (effect.kind === "shadow-targeting") {
    const targetSeat = (table.seats || []).find((seat) => seat.seatId === target.targetSeatId);
    return `${t("Selected cards")}: ${cards} | ${t("Target")}: ${targetSeat?.displayName || "-"}`;
  }
  return `${t("Selected cards")}: ${cards}`;
}

function battleEffectTargetReady(effect, target) {
  if (effect.kind === "rank-chip") return target.cardTargets.length === 1 && ["hand", "community"].includes(target.cardTargets[0].source);
  if (effect.kind === "pattern-reproduction") return target.cardTargets.length === 2 && target.cardTargets.every((entry) => entry.source === "hand");
  if (effect.kind === "shadow-swap") {
    return target.cardTargets.some((entry) => entry.source === "hand") && target.cardTargets.some((entry) => entry.source === "community");
  }
  if (effect.kind === "void-erosion") return target.cardTargets.length === 1 && target.cardTargets[0].source === "community";
  if (effect.kind === "shadow-targeting") return target.cardTargets.length === 2 && target.cardTargets.every((entry) => entry.source === "hand") && Boolean(target.targetSeatId);
  return true;
}

function confirmBattleEffectTarget(effect) {
  const target = state.battleEffectTarget;
  if (!target || !battleEffectTargetReady(effect, target)) return;
  chooseBattleEffect(effect.id, {
    targetCardCodes: target.cardTargets.map((entry) => entry.code),
    targetSeatId: target.targetSeatId
  });
}

function toggleBattleCard(code, source) {
  if (!state.scoreTable) return;
  const you = state.scoreTable.seats.find((seat) => seat.isYou);
  if (!you || !you.inGame || !you.isScoreTurn || you.submitted || state.scoreTable.phase !== "play-select") return;
  if (!["hand", "community"].includes(source)) return;
  if (state.battleEffectTarget) {
    toggleBattleEffectTargetCard(code, source);
    return;
  }
  const index = state.battleSelections.indexOf(code);
  if (index >= 0) state.battleSelections.splice(index, 1);
  else {
    const maxSelectable = Math.max(5, (you.hand || []).length);
    if (state.battleSelections.length >= maxSelectable) return;
    state.battleSelections.push(code);
  }
  requestBattleScorePreview();
  render();
}

function battleScorePreviewKey() {
  const table = state.scoreTable;
  if (!table) return "";
  const you = table.seats.find((seat) => seat.isYou);
  if (!you || !you.inGame || !you.isScoreTurn || you.submitted || table.phase !== "play-select") return "";
  if (!you.fateChosen || !you.fate) return "";
  if (["big-short", "going-long"].includes(you.fate.kind) && !you.fate.targetSeatId) return "";
  if (you.fate.kind === "dice" && !you.fate.diceValue) return "";
  if (state.battleEffectTarget || state.battleSelections.length !== 5) return "";
  const selectedHasCommunity = state.battleSelections.some((code) => (table.community || []).some((card) => card.code === code));
  if (!selectedHasCommunity) return "";
  const handKey = (you.hand || []).map((card) => `${card.code}:${card.displayCode || card.code}`).join(",");
  const communityKey = (table.community || []).map((card) => `${card.code}:${card.displayCode || card.code}`).join(",");
  const effectKey = you.selectedEffect ? `${you.selectedEffect.id || ""}:${you.selectedEffect.kind || ""}` : "no-effect";
  const roundEffectKey = (table.roundEffects || []).map((effect) => `${effect.kind}:${effect.suit || ""}:${effect.amount || ""}`).join(",");
  const fateKey = `${you.fate.kind}:${you.fate.diceValue || ""}:${you.fate.targetSeatId || ""}`;
  return `${table.id}:${table.gameNumber}:${table.round}:${table.currentTurnSeatId}:${state.battleSelections.join("-")}:${effectKey}:${fateKey}:${roundEffectKey}:${handKey}:${communityKey}`;
}

async function requestBattleScorePreview() {
  const key = battleScorePreviewKey();
  if (!key) {
    state.battleScorePreview = null;
    state.battleScorePreviewKey = "";
    state.battleScorePreviewLoading = false;
    return;
  }
  if (state.battleScorePreviewKey === key && (state.battleScorePreview || state.battleScorePreviewLoading)) return;
  state.battleScorePreviewKey = key;
  state.battleScorePreview = null;
  state.battleScorePreviewLoading = true;
  try {
    const tableId = state.scoreTable.id;
    const cardCodes = state.battleSelections.slice();
    const response = await api(`/api/score-tables/${tableId}/preview`, {
      method: "POST",
      body: { cardCodes }
    });
    if (state.battleScorePreviewKey === key) state.battleScorePreview = response.preview;
  } catch {
    if (state.battleScorePreviewKey === key) state.battleScorePreview = { error: true };
  } finally {
    if (state.battleScorePreviewKey === key) state.battleScorePreviewLoading = false;
    render();
  }
}

function toggleBattleEffectTargetCard(code, source) {
  const target = state.battleEffectTarget;
  if (!target) return;
  const index = target.cardTargets.findIndex((entry) => entry.code === code);
  if (index >= 0) {
    target.cardTargets.splice(index, 1);
    render();
    return;
  }
  if (target.kind === "pattern-reproduction") {
    if (source !== "hand" || target.cardTargets.length >= 2) return;
    target.cardTargets.push({ code, source });
  } else if (target.kind === "rank-chip") {
    if (!['hand', 'community'].includes(source)) return;
    target.cardTargets = [{ code, source }];
  } else if (target.kind === "shadow-swap") {
    if (!["hand", "community"].includes(source)) return;
    target.cardTargets = target.cardTargets.filter((entry) => entry.source !== source);
    target.cardTargets.push({ code, source });
  } else if (target.kind === "void-erosion") {
    if (source !== "community") return;
    target.cardTargets = [{ code, source }];
  } else if (target.kind === "shadow-targeting") {
    if (source !== "hand" || target.cardTargets.length >= 2) return;
    target.cardTargets.push({ code, source });
  }
  render();
}

function isBattleEffectTargetSeat(seat) {
  return Boolean(
    state.battleEffectTarget?.kind === "shadow-targeting" &&
    seat.inGame &&
    !seat.submitted &&
    !seat.isYou
  );
}

function chooseBattleEffectTargetSeat(seatId) {
  if (!state.battleEffectTarget || state.battleEffectTarget.kind !== "shadow-targeting") return;
  state.battleEffectTarget.targetSeatId = seatId;
  render();
}

function scorePhaseText(phase) {
  if (isZh()) return zhText[phase] || phase;
  return phase === "effect-select" ? "Effect selection" : phase === "play-select" ? "Choose cards" : phase === "round-result" ? "Round result" : phase;
}

function scoreTimerText(table) {
  if (!table.phaseDeadline) return "";
  const seconds = Math.max(0, Math.ceil((table.phaseDeadline - table.serverNow) / 1000));
  return `${seconds}s`;
}

function translateBattleHand(handName) {
  return isZh() ? (zhText[handName] || handName) : handName;
}

function translateBattleHandId(handId) {
  const names = {
    "high-card": "High Card",
    "one-pair": "One Pair",
    "two-pair": "Two Pair",
    "three-kind": "Three of a Kind",
    straight: "Straight",
    flush: "Flush",
    "full-house": "Full House",
    "four-kind": "Four of a Kind",
    "straight-flush": "Straight Flush"
  };
  return translateBattleHand(names[handId] || handId);
}

function scoreFateName(fate) {
  const names = {
    giant: isZh() ? "巨人" : "The Giant",
    dice: isZh() ? "骰子" : "The Dice",
    "big-short": isZh() ? "大空头" : "The Big Short",
    "going-long": isZh() ? "做多" : "Going Long",
    "fate-collector": isZh() ? "收藏家" : "The Collector",
    clod: isZh() ? "土块" : "The Clod"
  };
  return names[fate?.kind] || fate?.name || "FATE";
}

function scoreFateDescription(fate) {
  const kind = fate?.kind;
  const descriptions = isZh() ? {
    giant: "\u5f00\u5c40\u83b7\u5f97 3300 \u603b\u5206\u548c 8 \u6b21\u5f03\u724c\uff1b\u7b2c 2-5 \u56de\u5408\u4e0d\u80fd\u9009\u666e\u901a\u7279\u6548\u3002\u6bcf\u56de\u5408\u5de8\u4eba\u5148\u627f\u53d7 max(\u5de8\u4eba\u5916\u5176\u4ed6\u73a9\u5bb6\u6700\u4f4e\u56de\u5408\u5206x1.3, \u5de8\u4eba\u5916\u5176\u4ed6\u73a9\u5bb6\u6700\u9ad8\u56de\u5408\u5206x50%) \u603b\u5206\u6263\u9664\uff1b\u968f\u540e AOE \u4f7f\u9664\u5de8\u4eba\u5916\u6240\u6709\u73a9\u5bb6\u6263\u9664\u5de8\u4eba\u672c\u56de\u5408\u624b\u724c\u88f8\u5206\u7684 20%\uff0c\u56de\u5408\u5206\u4f4e\u4e8e\u5de8\u4eba\u624b\u724c\u88f8\u5206\u7684\u6240\u6709\u975e\u5de8\u4eba\u73a9\u5bb6\u518d\u53d7\u5230\u731b\u51fb\uff0c\u989d\u5916\u6263\u9664\u8be5\u88f8\u5206\u7684 20%\u3002\u7b2c 1-5 \u56de\u5408\u53ef\u5728\u51fa\u724c\u524d\u4f7f\u7528\u4e00\u6b21\u9632\u5fa1\u59ff\u6001\uff0c\u5206\u522b\u51cf\u514d\u5f53\u56de\u5408\u5de8\u4eba\u8d1f\u62c5\u7684 80%/70%/60%/50%/40%\u3002\u6bcf\u5c40\u6700\u591a\u4e00\u4f4d\u5de8\u4eba\u3002",
    dice: "\u6bcf\u56de\u5408\u7684\u6700\u7ec8\u500d\u7387\u4e3a\u6700\u5927\u9ab0\u5b50\u70b9\u6570 + \u6240\u6709\u5df2\u751f\u6548\u7279\u6548\u7684\u500d\u7387\u52a0\u6210\uff1b\u724c\u578b\u57fa\u7840\u500d\u7387\u4e0d\u4f1a\u989d\u5916\u52a0\u5165\u3002\u6bcf\u4e09\u6b21\u63b7\u51fa x3 \u83b7\u5f97\u989d\u5916\u4e00\u63b7\u3002\u6982\u7387\uff1ax3 2.5%\u3001x4 5%\u3001x5 8.5%\u3001x6 20%\u3001x7 21%\u3001x8 20%\u3001x10 13%\u3001x12 6%\u3001x15 3%\u3001x20 1%\u3002",
    "big-short": "\u6bcf\u56de\u5408\u51fa\u724c\u524d\u505a\u7a7a\u53e6\u4e00\u4f4d\u73a9\u5bb6\uff0c\u4f46\u4e0d\u4f1a\u6539\u53d8\u8be5\u73a9\u5bb6\u7684\u5206\u6570\u3002\u82e5\u76ee\u6807\u4e3a\u6700\u4f4e\u5206\uff0c\u4f60\u83b7\u5f97 50/100/150/200/300\uff0c\u5e76\u6309\u672c\u5c40\u7d2f\u8ba1\u505a\u7a7a\u6210\u529f\u6b21\u6570\u518d\u83b7\u5f97 0/50/100/300/500\uff1b\u82e5\u9884\u6d4b\u5931\u8d25\uff0c\u4f60\u7684\u603b\u5206\u989d\u5916 -50/-80/-80/-80/-80\u3002",
    "going-long": "\u6bcf\u56de\u5408\u51fa\u724c\u524d\u505a\u591a\u4e00\u4f4d\u73a9\u5bb6\uff08\u53ef\u4ee5\u9009\u81ea\u5df1\uff09\uff0c\u4f46\u4e0d\u4f1a\u6539\u53d8\u8be5\u73a9\u5bb6\u7684\u5206\u6570\u3002\u82e5\u76ee\u6807\u4e3a\u672c\u56de\u5408\u6700\u9ad8\u5206\uff0c\u4f60\u83b7\u5f97 50/100/150/200/300\uff0c\u5e76\u6309\u672c\u5c40\u7d2f\u8ba1\u505a\u591a\u6210\u529f\u6b21\u6570\u518d\u83b7\u5f97 0/50/100/300/500\u3002",
    "fate-collector": "\u5f00\u5c40\u5f03\u724c\u6b21\u6570\u6539\u4e3a 6\u3002\u4e94\u56de\u5408\u5185\u7b2c\u4e00\u6b21\u6253\u51fa\u4e00\u79cd\u81ea\u5df1\u6b64\u524d\u672a\u6253\u51fa\u7684\u724c\u578b\u65f6\uff0c\u6309\u7b2c 1/2/3/4/5 \u79cd\u5206\u522b\u83b7\u5f97 +20/+80/+150/+300/+400 \u56de\u5408\u5206\u3002",
    clod: "\u7b2c 1/2/3/4/5 \u56de\u5408\u624b\u724c\u6570\u6539\u4e3a 4/5/6/6/6\uff0c\u5f00\u5c40\u5f03\u724c\u6b21\u6570\u6539\u4e3a 6\uff0c\u4e0d\u518d\u6bcf\u56de\u5408\u989d\u5916\u589e\u52a0\u5f03\u724c\u3002"
  } : {
    giant: "Start with 3,300 total score and 8 discard uses. Choose no normal effects in rounds 2-5. Each round, the Giant first loses max(1.3x the lowest non-Giant round score, 50% of the highest non-Giant round score). AOE then deducts 20% of the Giant's bare hand score from every non-Giant player's total. Every non-Giant player whose round score is lower than that bare hand score is also Smashed for another 20%. Once in rounds 1-5, Defense Stance reduces that round's Giant burden by 80%/70%/60%/50%/40%. Only one Giant per game.",
    dice: "The final multiplier is the highest die roll plus all active effect multiplier bonuses; the hand type's base multiplier is not added again. Every three x3 rolls grant an extra roll. Odds: x3 2.5%, x4 5%, x5 8.5%, x6 20%, x7 21%, x8 20%, x10 13%, x12 6%, x15 3%, x20 1%.",
    "big-short": "Predict another player to finish with the lowest round score without changing that player's score. A correct prediction grants 50/100/150/200/300 plus 0/50/100/300/500 based on cumulative Big Short successes; a miss costs you 50/80/80/80/80 total score.",
    "going-long": "Predict any player, including yourself, to finish with the highest round score without changing that player's score. A correct prediction grants 50/100/150/200/300 plus 0/50/100/300/500 based on cumulative Going Long successes.",
    "fate-collector": "Start with 6 discard uses. The first time you play each new hand type, gain 20/80/150/300/400 round score for your 1st-5th collected type.",
    clod: "Your hand sizes become 4/5/6/6/6 in rounds 1-5 and you start with 6 discard uses. You no longer gain an extra discard each round."
  };
  if (descriptions[kind]) return descriptions[kind];
  return "";
}

function battleEffectName(effect) {
  const suit = battleSuitName(effect.suit);
  if (effect.kind === "suit-chip") return isZh() ? `${suit}\u70b9\u6570\u589e\u5f3a` : `${suit} chip boost`;
  if (effect.kind === "rank-chip") return effect.rank ? (isZh() ? `${effect.rank}\u70b9\u589e\u5f3a` : `${effect.rank} rank boost`) : (isZh() ? "\u70b9\u6570\u589e\u5f3a" : "Rank boost");
  if (effect.kind === "pair-mult") return isZh() ? "\u5bf9\u5b50\u5f15\u64ce" : "Pair engine";
  if (effect.kind === "flush-mult") return isZh() ? "\u540c\u82b1\u5f15\u64ce" : "Flush engine";
  if (effect.kind === "red-chip") return isZh() ? "\u7ea2\u8272\u589e\u5e45" : "Red boost";
  if (effect.kind === "void-suit") return isZh() ? `${suit}\u865a\u65e0\u5c01\u5370` : `${suit} void seal`;
  if (effect.kind === "pattern-reproduction") return isZh() ? "\u82b1\u8272\u590d\u5236" : "Pattern Reproduction";
  if (effect.kind === "shadow-swap") return isZh() ? "\u6697\u9690\u7f6e\u6362" : "Shadow Swap";
  if (effect.kind === "void-erosion") return isZh() ? "\u865a\u7a7a\u4fb5\u8680" : "Void Erosion";
  if (effect.kind === "world-mirror") return isZh() ? "\u955c\u4e2d\u4e16\u754c" : "World in Mirror";
  if (effect.kind === "man-mirror") return isZh() ? "\u955c\u4e2d\u4eba" : "Man in Mirror";
  if (effect.kind === "draven") return isZh() ? "\u5fb7\u83b1\u8054\u76df" : "Draven's League";
  if (effect.kind === "goelia") return isZh() ? "\u6b4c\u8389\u5a05" : "GOELIA";
  if (effect.kind === "shadow-targeting") return isZh() ? "\u865a\u7a7a\u7d22\u654c" : "Shadow Targeting";
  if (effect.kind === "chaos-dice") return isZh() ? "\u6df7\u6c8c\u9ab0\u5b50" : "Chaos Dice";
  if (effect.kind === "tomato-king") return isZh() ? "\u756a\u8304\u5927\u738b" : "King of the Tomato";
  if (effect.kind === "tomato-shooter") return isZh() ? "\u756a\u8304\u5c04\u624b" : "Tomato Shooter";
  if (effect.kind === "runaans-hurricane") return isZh() ? "\u5362\u5b89\u5a1c\u7684\u98d3\u98ce" : "Runaan's Hurricane";
  if (effect.kind === "old-days-tomatoes") return isZh() ? "\u5f80\u65e5\u756a\u8304" : "Old days' Tomatoes";
  if (effect.kind === "lord-dominicks-regards") return isZh() ? "\u591a\u7c73\u5c3c\u514b\u9886\u4e3b\u7684\u81f4\u610f" : "Lord Dominick's Regards";
  if (effect.kind === "collector") return isZh() ? "\u6536\u96c6\u8005" : "The Collector";
  if (effect.kind === "bite-me") return isZh() ? "\u76f4\u63a5\u6765\u5427" : "Bite me";
  if (effect.kind === "straight-flush-boost") return isZh() ? "同花大顺" : "Straight Flush";
  if (effect.kind === "change-straight") return isZh() ? "质变：顺子" : "Change: Straight";
  if (effect.kind === "protoceratops") return isZh() ? "叠角龙" : "Protoceratops";
  if (effect.kind === "bread-butter") return isZh() ? "面包和黄油" : "Bread and butter";
  if (effect.kind === "bread-cheese") return isZh() ? "面包和奶酪" : "Bread and cheese";
  if (effect.kind === "bread-jam") return isZh() ? "面包和果酱" : "Bread and Jam";
  if (effect.kind === "astral-body") return isZh() ? "星界躯体" : "Astral Body";
  if (effect.kind === "astral-body-penalty") return isZh() ? "星界躯体惩罚" : "Astral Body penalty";
  if (effect.kind === "tempered-tomato") return isZh() ? "钢化番茄" : "Tempered Tomato";
  if (effect.kind === "returning-fundamentals") return isZh() ? "回归基本功" : "Returning to the fundamentals";
  if (effect.kind === "draw-sword") return isZh() ? "亮出你的剑" : "Draw your sword";
  if (effect.kind === "critical-hit") return isZh() ? "关键暴击" : "Critical Hit";
  if (effect.kind === "infinity-edge") return isZh() ? "无尽之刃" : "Infinity Edge";
  if (effect.kind === "brutal-force") return isZh() ? "残暴之力" : "Brutal Force";
  if (effect.kind === "vigorous") return isZh() ? "大力" : "Vigorous";
  if (effect.kind === "refresher-orb") return isZh() ? "刷新球" : "Refresher Orb";
  if (effect.kind === "giant-killer") return isZh() ? "巨人杀手" : "Giant Killer";
  if (effect.kind === "matthew-effect") return isZh() ? "马太效应" : "Matthew effect";
  if (effect.kind === "critical-switch-hand") return isZh() ? "暴击切牌" : "Critical Switch Hand";
  if (effect.kind === "dance-illusions") return isZh() ? "\u5e7b\u5f71\u4e4b\u821e" : "Dance of Illusions";
  if (effect.kind === "no-critical-hit") return isZh() ? "\u672a\u89e6\u53d1\u66b4\u51fb" : "No critical hit";
  if (effect.kind === "rambo") return isZh() ? "\u7ea2\u6e29\u706b\u70e4" : "Rambo";
  if (effect.kind === "fate-collector") return scoreFateName(effect);
  if (effect.kind === "big-short") return scoreFateName(effect);
  if (effect.kind === "going-long") return scoreFateName(effect);
  if (effect.kind === "giant-penalty") return isZh() ? "巨人负担" : "Giant burden";
  if (effect.kind === "big-short-miss") return isZh() ? "\u505a\u7a7a\u5931\u8d25" : "Big Short miss";
  if (effect.kind === "giant-aoe") return isZh() ? "\u5de8\u4eba AOE" : "Giant AOE";
  if (effect.kind === "giant-smash") return isZh() ? "\u5de8\u4eba\u731b\u51fb" : "Giant Smash";
  if (effect.kind === "fate-giant") return isZh() ? "\u5de8\u4eba\u500d\u7387" : "Giant multiplier";
  return effect.kind || "";
}

function battleEffectDescription(effect) {
  const suit = battleSuitName(effect.suit);
  if (effect.kind === "tomato-king") {
    const hits = Math.max(0, Number(effect.tomatoHits) || 0);
    return isZh()
      ? `\u672c\u56de\u5408\u500d\u7387 +1\uff1b\u6b64\u524d\u547d\u4e2d ${hits} \u6b21 x min(\u672c\u6b21\u724c\u578b\u57fa\u7840\u500d\u7387, 1) \u52a0\u5165\u6700\u7ec8\u5206\u3002`
      : `This round gains +1 mult; add ${hits} earlier hits x min(base hand multiplier, 1) to final score.`;
  }
  if (effect.kind === "tomato-shooter") {
    const throws = Math.max(0, Number(effect.tomatoThrows) || 0);
    return isZh()
      ? `\u672c\u56de\u5408\u500d\u7387 +1\uff1b\u6b64\u524d\u6295\u63b7 ${throws} \u6b21 x min(\u672c\u6b21\u724c\u578b\u57fa\u7840\u500d\u7387, 1) \u52a0\u5165\u6700\u7ec8\u5206\u3002`
      : `This round gains +1 mult; add ${throws} earlier throws x min(base hand multiplier, 1) to final score.`;
  }
  if (effect.kind === "tempered-tomato") {
    return isZh()
      ? "\u8fbe\u6807\u540e\u6bcf\u56de\u5408\u5728\u624b\u724c\u7ed3\u7b97\u540e\u989d\u5916\u52a0\u5165\uff08\u547d\u4e2dx0.5 + \u6295\u63b7x0.2\uff09x min(\u672c\u6b21\u724c\u578b\u57fa\u7840\u500d\u7387, 1) \u6700\u7ec8\u5206\u3002"
      : "Once active, after hand scoring add (hits x0.5 + throws x0.2) x min(base hand multiplier, 1) final score each round.";
  }
  const balanceDescription = battleBalanceEffectDescription(effect);
  if (balanceDescription) return balanceDescription;
  if (effect.kind === "suit-chip") return isZh() ? `\u6253\u51fa\u7684${suit}\u6bcf\u5f20 +${effect.amount} \u70b9` : `Played ${suit} cards gain +${effect.amount} chips.`;
  if (effect.kind === "rank-chip") return isZh() ? `\u6253\u51fa\u7684 ${effect.rank} \u6bcf\u5f20 +${effect.amount} \u70b9` : `Played ${effect.rank}s gain +${effect.amount} chips.`;
  if (effect.kind === "pair-mult") return isZh() ? `\u53ea\u6709\u4e00\u5bf9\u6216\u4e24\u5bf9\u65f6 +${effect.amount} \u500d\u7387` : `One Pair or Two Pair gains +${effect.amount} mult.`;
  if (effect.kind === "flush-mult") return isZh() ? `\u540c\u82b1\u6216\u540c\u82b1\u987a +${effect.amount} \u500d\u7387` : `Flushes gain +${effect.amount} mult.`;
  if (effect.kind === "red-chip") return isZh() ? `\u6253\u51fa\u7684\u7ea2\u8272\u724c\u6bcf\u5f20 +${effect.amount} \u70b9` : `Played red cards gain +${effect.amount} chips.`;
  if (effect.kind === "void-suit") return isZh() ? `从你开始，之后玩家的${suit}点数 -${effect.amount || 3}；你自己的${suit}改为每张 +4，且包含该花色时倍率 +1。` : `From you onward, ${suit} cards lose ${effect.amount || 3} chips. Your own ${suit} cards gain +4 instead, and add +1 mult if played.`;
  if (effect.kind === "pattern-reproduction") return isZh() ? "先选手牌复制后选手牌的花色，本回合倍率 +2.5。" : "The first selected hand card copies the second selected hand card's suit. This round gains +2.5 mult.";
  if (effect.kind === "shadow-swap") return isZh() ? "一张手牌与一张公共牌交换；本回合点数 +5，倍率 +1。" : "Swap one hand card with one community card. This round gains +5 chips and +1 mult.";
  if (effect.kind === "void-erosion") return isZh() ? "移除一张公共牌并补发；本回合点数 +5，倍率 +1。" : "Remove one community card and deal a replacement. This round gains +5 chips and +1 mult.";
  if (effect.kind === "world-mirror") return isZh() ? "所有公共牌变为点数互补牌；本回合点数 +6，倍率 +2。" : "Mirror all community card ranks. This round gains +6 chips and +2 mult.";
  if (effect.kind === "man-mirror") return isZh() ? "自己的手牌变为点数互补牌；本回合点数 +6，倍率 +2。" : "Mirror your hand card ranks. This round gains +6 chips and +2 mult.";
  if (effect.kind === "draven") return isZh() ? "本回合倍率 +3.5；若本回合得分最高，额外获得当前最高总分的 20%。" : "This round gains +3.5 mult. If you lead this round, gain 20% of the current highest total score.";
  if (effect.kind === "goelia") return isZh() ? "\u672c\u73a9\u5bb6\u624b\u724c\u5728\u4e0d\u6539\u53d8\u82b1\u8272\u7684\u524d\u63d0\u4e0b\u53d8\u4e3a 8 \u5230 K \u7684\u4e0d\u91cd\u590d\u70b9\u6570\u3002" : "Your hand ranks become distinct ranks from 8 through K while keeping suits.";
  if (effect.kind === "shadow-targeting") return isZh() ? "与未出牌玩家随机两张手牌交换；倍率 +1，并额外加上换得牌的点数和。" : "Swap with two random cards from an unplayed target. Gain +1 mult and extra chips equal to gained cards.";
  if (effect.kind === "chaos-dice") {
    const count = Number(effect.rerolledCardCount);
    const countText = Number.isFinite(count) ? (isZh() ? `本次重发 ${count} 张。` : `${count} cards rerolled.`) : "";
    return isZh() ? `所有尚未出牌玩家的手牌全部重发；倍率 +1，并获得重发总张数 x0.5 的点数。${countText}` : `Reroll every unplayed player's hand. Gain +1 mult and rerolled-card count x0.5 chips. ${countText}`;
  }
  if (effect.kind === "tomato-king") {
    const hits = Number(effect.tomatoHits);
    const hitText = Number.isFinite(hits) ? (isZh() ? `当前计入 ${hits} 次番茄。` : `Currently counts ${hits} tomatoes.`) : "";
    return isZh() ? `本局之前回合被番茄命中的次数加到点数上，倍率 +1；每局只能用一次。${hitText}` : `Earlier tomato hits this game become bonus chips, and this round gains +1 mult. Once per game. ${hitText}`;
  }
  if (effect.kind === "tomato-shooter") {
    const throws = Number(effect.tomatoThrows);
    const throwText = Number.isFinite(throws) ? (isZh() ? `当前计入 ${throws} 次番茄。` : `Currently counts ${throws} tomatoes.`) : "";
    return isZh() ? `本局之前回合投出的番茄次数加到点数上，倍率 +0.5；每局只能用一次。${throwText}` : `Earlier tomatoes you threw this game become bonus chips, and this round gains +0.5 mult. Once per game. ${throwText}`;
  }
  if (effect.kind === "bite-me") {
    const uses = Number(effect.discardMultiplier);
    const useText = Number.isFinite(uses) ? (isZh() ? `当前预计 +${uses} 倍率。` : `Currently estimates +${uses} mult.`) : "";
    return isZh() ? `结算时将剩余弃牌次数加到倍率上。${useText}` : `At scoring time, remaining discard uses are added to multiplier. ${useText}`;
  }
  if (effect.kind === "straight-flush-boost") return isZh() ? "打出同花顺时，最终分 +1000。" : "When playing a Straight Flush, gain +1000 final score.";
  if (effect.kind === "change-straight") return isZh() ? "若打出顺子，按同花顺倍率计算；每局一次。" : "If your play is a Straight, score it with Straight Flush multiplier. Once per game.";
  if (effect.kind === "protoceratops") return isZh() ? "本回合倍率 +3；本局番茄命中和投掷有效计数变为 3 倍。每局一次。" : "This round gains +3 mult; your tomato hit and throw counts are tripled for this game. Once per game.";
  if (effect.kind === "bread-butter") return isZh() ? "本局之后所有顺子倍率 +2。每局一次。" : "For the rest of this game, your Straights gain +2 mult. Once per game.";
  if (effect.kind === "bread-cheese") return isZh() ? "本局之后所有三条倍率 +3。每局一次。" : "For the rest of this game, your Three of a Kind gains +3 mult. Once per game.";
  if (effect.kind === "bread-jam") return isZh() ? "本局之后所有两对倍率 +4。每局一次。" : "For the rest of this game, your Two Pair gains +4 mult. Once per game.";
  if (effect.kind === "astral-body") return isZh() ? "本回合最终分 +1000；从本回合起本局每回合得分变为 50%。每局一次。" : "This round gains +1000 final score; from this round onward, your scores are halved. Once per game.";
  if (effect.kind === "tempered-tomato") return isZh() ? "持续判定番茄阈值；达标后每回合点数加入命中x0.5+投掷x0.2。每局一次。" : "Continuously checks tomato thresholds; once active, future rounds add hits x0.5 plus throws x0.2 chips. Once per game.";
  if (effect.kind === "returning-fundamentals") return isZh() ? "只在第 2/3 回合出现；本局之后不能再选特效，并获得持续点数与倍率。每局一次。" : "Only appears in rounds 2/3. You cannot choose more effects and gain persistent chips and mult. Once per game.";
  if (effect.kind === "draw-sword") return isZh() ? "只在第 2/3 回合出现；本局之后不能再弃牌，并获得持续点数与倍率。每局一次。" : "Only appears in rounds 2/3. You cannot discard and gain persistent chips and mult. Once per game.";
  if (effect.kind === "critical-hit") return isZh() ? "本局之后每张打出的牌有 50% 几率暴击，暴击点数 x1.75。" : "For the rest of this game, each played card has 50% crit chance for x1.75 chips.";
  if (effect.kind === "infinity-edge") return isZh() ? "本局之后暴击率 +25%，暴击倍率提升至 x2.25。每局一次。" : "For the rest of this game, gain +25% crit chance and raise crit multiplier to x2.25. Once per game.";
  if (effect.kind === "brutal-force") return isZh() ? "本回合点数 +25，倍率 +1。" : "This round gains +25 chips and +1 mult.";
  if (effect.kind === "vigorous") return isZh() ? "本回合计分点数之和 x1.5。" : "This round multiplies chip total by x1.5.";
  if (effect.kind === "refresher-orb") return isZh() ? "本回合倍率 +1，额外获得 4 次弃牌；可解除亮剑的弃牌封禁。" : "This round gains +1 mult and 4 extra discards; re-enables discards blocked by Draw your sword.";
  if (effect.kind === "giant-killer") return isZh() ? "仅选择回合和下一回合生效，按与最高总分的差距获得 x1.3/x1.45/x1.6/x1.75/x1.9；之后消失且本局不再出现。" : "Active this round and the next for x1.3/x1.45/x1.6/x1.75/x1.9 by the gap to the leader, then expires and cannot appear again this game.";
  if (effect.kind === "matthew-effect") return isZh() ? "本回合倍率 +2；之后每次单回合最高分，额外获得 3 次弃牌。每局一次。" : "This round gains +2 mult; later round wins grant 3 extra discards. Once per game.";
  if (effect.kind === "critical-switch-hand") return isZh() ? "本局之后暴击率 +25%；每回合若至少一张牌暴击，额外获得 1 次弃牌。每局一次。" : "For the rest of this game, gain +25% crit chance; any crit in a round grants 1 extra discard. Once per game.";
  if (effect.kind === "rambo") return isZh() ? "\u82e5 15 \u79d2\u5185\u51fa\u724c\uff0c\u672c\u56de\u5408\u70b9\u6570 +10 \u540e\u518d\u4e58\u500d\u7387\u3002" : "If you play within 15 seconds, gain +10 chips before multiplying.";
  return "";
}

function battleBalanceEffectDescription(effect) {
  if (!effect) return "";
  const suit = battleSuitName(effect.suit);
  if (effect.kind === "rambo") return isZh()
    ? "\u7ea2\u6e29\u706b\u70e4\uff1a20 \u79d2\u5185\u51fa\u724c\u65f6\u8ba1\u5206\u70b9\u6570 +15\u3001\u500d\u7387 +1\uff1b10 \u79d2\u5185\u51fa\u724c\u65f6\u6539\u4e3a\u8ba1\u5206\u70b9\u6570 +30\u3001\u500d\u7387 +3\u3002"
    : "Rambo: play within 20 seconds for +15 chips and +1 mult; play within 10 seconds for +30 chips and +3 mult instead.";
  if (effect.kind === "suit-chip") return isZh()
    ? `${suit}点数增强：按本次五张牌的同花色数量，获得 max(8, 4×匹配张数) 点，最高 20 点；本回合倍率 +1。`
    : `${suit} chip boost: gain max(8, 4 x matching cards) chips, capped at 20, and +1 mult this round.`;
  if (effect.kind === "rank-chip") {
    const rank = effect.rank || "-";
    return isZh()
      ? (effect.rank ? `${rank}点数增强：本回合额外获得 max(10, 6×匹配张数) 点，最高 24 点。` : "点数增强：选择一张当前手牌或公共牌来确定实际存在的点数；随后按该点数的匹配张数加成。")
      : (effect.rank ? `${rank} rank boost: gain max(10, 6 x matching cards) chips, capped at 24.` : "Rank boost: choose a current hand or community card to set an existing rank.");
  }
  if (effect.kind === "pair-mult") return isZh()
    ? "对子引擎：计分点数增加 max(8, 8×对子数量) 点；若为一对或两对，倍率额外 +2。"
    : "Pair engine: gain max(8, 8 x pair ranks) chips; One Pair and Two Pair also gain +2 mult.";
  if (effect.kind === "flush-mult") return isZh()
    ? "同花引擎：无条件额外 +7 点；若为同花或同花顺，倍率额外 +1.5。"
    : "Flush engine: gain +7 chips; Flush and Straight Flush also gain +1.5 mult.";
  if (effect.kind === "red-chip") return isZh()
    ? "红色增幅：本次五张牌中，红桃或方块每张 +4 点，黑桃或梅花每张 +2 点。"
    : "Red boost: Hearts and Diamonds gain +4 chips each; Spades and Clubs gain +2 each.";
  if (effect.kind === "void-erosion") {
    const following = Math.max(0, Number(effect.followingUnplayedPlayers) || 0);
    return isZh()
      ? `选择并重发一张公共牌；本回合点数 +5、倍率 +1，并额外获得 +${Math.max(1, following)} 倍率和 +${following * 70} 总分（之后尚有 ${following} 位未出牌玩家）。`
      : `Replace one community card. Gain +5 chips, +1 mult, then +${Math.max(1, following)} mult and +${following * 70} final score for ${following} later unplayed players.`;
  }
  if (effect.kind === "shadow-targeting") {
    const gained = Math.max(0, Number(effect.gainedChipBonus) || 0);
    return isZh()
      ? `与未出牌玩家随机两张手牌交换；本回合倍率 +2，且最终总分额外 +${gained * 10}（换得两张牌点数和 ${gained} ×10）。`
      : `Swap two hand cards with an unplayed target's random cards. Gain +2 mult and +${gained * 10} final score (gained card chips ${gained} x10).`;
  }
  if (effect.kind === "chaos-dice") {
    const count = Math.max(0, Number(effect.rerolledCardCount) || 0);
    return isZh()
      ? `重发所有未出牌玩家的手牌；本回合倍率 +1、点数 +${10 + count * 0.5}，并额外 +${count * 10} 总分（本次重发 ${count} 张）。`
      : `Reroll every unplayed hand. Gain +1 mult, +${10 + count * 0.5} chips, and +${count * 10} final score (${count} cards rerolled).`;
  }
  if (effect.kind === "vigorous") return isZh()
    ? "大力：本回合手牌结算后，最终总分额外增加 100 + 手牌得分×25%，最高增加 200。"
    : "Vigorous: after hand scoring, add 100 + 25% of hand score to final score, capped at 200.";
  if (effect.kind === "rambo") return isZh()
    ? "红温火烤：在回合开始后 20 秒内出牌，计分点数 +10 后乘以倍率，且最终总分额外 +150。"
    : "Rambo: play within 20 seconds for +10 chips before multiplier and +150 final score.";
  if (effect.kind === "bread-cheese") return isZh()
    ? "面包和奶酪：从本回合起每回合计分点数 +5；三条、葫芦或四条时，再 +7 点和 +1 倍率。每局一次。"
    : "Bread and cheese: from this round on gain +5 chips every round; Three of a Kind, Full House, and Four of a Kind also gain +7 chips and +1 mult. Once per game.";
  if (effect.kind === "bread-butter") return isZh()
    ? "面包和黄油：从本回合起每回合计分点数 +4；一对或两对时，再 +5 点和 +2 倍率。每局一次。"
    : "Bread and butter: from this round on gain +4 chips every round; One Pair and Two Pair also gain +5 chips and +2 mult. Once per game.";
  if (effect.kind === "bread-jam") return isZh()
    ? "面包和果酱：从本回合起每回合计分点数 +4；顺子时，再 +5 点和 +2 倍率。每局一次。"
    : "Bread and Jam: from this round on gain +4 chips every round; Straights also gain +5 chips and +2 mult. Once per game.";
  if (effect.kind === "astral-body") return isZh()
    ? "星界躯体：选择时最终分 +1000，且该加分不受减益；只降低手牌结算分，第 5 回合无减益。每局一次。"
    : "Astral Body: gain +1000 final score outside the penalty; only hand score is reduced, with no round-5 penalty. Once per game.";
  if (effect.kind === "astral-body-penalty") return isZh()
    ? "星界躯体惩罚：只降低本回合手牌结算分，不影响额外最终分；第 5 回合不再生效。"
    : "Astral Body penalty: reduces only this round's hand score, not flat final-score bonuses, and no longer applies in round 5.";
  if (effect.kind === "tomato-king") {
    const hits = Math.max(0, Number(effect.tomatoHits) || 0);
    return isZh()
      ? `\u672c\u56de\u5408\u500d\u7387 +1\uff1b\u624b\u724c\u7ed3\u7b97\u540e\uff0c\u6b64\u524d\u88ab\u547d\u4e2d ${hits} \u6b21 \u00d7 min(\u672c\u6b21\u724c\u578b\u57fa\u7840\u500d\u7387, 1) \u52a0\u5165\u6700\u7ec8\u5206\u3002\u6bcf\u5c40\u4e00\u6b21\u3002`
      : `This round gains +1 mult; after hand scoring, add ${hits} earlier hits x min(base hand multiplier, 1) to final score. Once per game.`;
  }
  if (effect.kind === "tomato-shooter") {
    const throws = Math.max(0, Number(effect.tomatoThrows) || 0);
    return isZh()
      ? `\u672c\u56de\u5408\u500d\u7387 +1\uff1b\u624b\u724c\u7ed3\u7b97\u540e\uff0c\u6b64\u524d\u6295\u63b7 ${throws} \u6b21 \u00d7 min(\u672c\u6b21\u724c\u578b\u57fa\u7840\u500d\u7387, 1) \u52a0\u5165\u6700\u7ec8\u5206\u3002\u6bcf\u5c40\u4e00\u6b21\u3002`
      : `This round gains +1 mult; after hand scoring, add ${throws} earlier throws x min(base hand multiplier, 1) to final score. Once per game.`;
  }
  if (effect.kind === "tempered-tomato") {
    return isZh()
      ? "\u6301\u7eed\u5224\u5b9a\u756a\u8304\u9608\u503c\uff1b\u8fbe\u6807\u540e\u6bcf\u56de\u5408\u5728\u624b\u724c\u7ed3\u7b97\u540e\u989d\u5916\u52a0\u5165\uff08\u547d\u4e2d\u00d70.5 + \u6295\u63b7\u00d70.2\uff09\u00d7 min(\u672c\u6b21\u724c\u578b\u57fa\u7840\u500d\u7387, 1) \u6700\u7ec8\u5206\u3002\u6bcf\u5c40\u4e00\u6b21\u3002"
      : "Continuously checks tomato thresholds; once active, after hand scoring add (hits x0.5 + throws x0.2) x min(base hand multiplier, 1) final score each round. Once per game.";
  }
  if (effect.kind === "dance-illusions") {
    return isZh()
      ? "\u66b4\u51fb\u7387 +25%\uff0c\u653b\u51fb\u901f\u5ea6 +65%\uff1b\u672c\u56de\u5408\u70b9\u6570 +5\u3001\u500d\u7387 +1.5\u3002\u4f60\u6295\u63b7\u7684\u756a\u8304\u53ea\u7ed9\u81ea\u5df1\u589e\u52a0\u6295\u63b7\u8ba1\u6570\uff0c\u4e0d\u7ed9\u5bf9\u624b\u589e\u52a0\u88ab\u547d\u4e2d\u8ba1\u6570\uff1b\u4ed6\u4eba\u6295\u4f60\u65f6\uff0c\u4f60\u4ecd\u83b7\u5f97\u88ab\u547d\u4e2d\u8ba1\u6570\uff0c\u5bf9\u65b9\u4e0d\u83b7\u5f97\u6295\u63b7\u8ba1\u6570\u3002\u6bcf\u5c40\u4e00\u6b21\u3002"
      : "Gain +25% crit chance and +65% attack speed. This round gains +5 chips and +1.5 mult. Your tomatoes add only to your throw count and do not add hit count to opponents. Tomatoes thrown at you still add your hit count, while the thrower gains no throw count. Once per game.";
  }
  if (effect.kind === "runaans-hurricane") {
    return isZh()
      ? "\u66b4\u51fb\u7387 +25%\uff0c\u653b\u51fb\u901f\u5ea6 +40%\u3002\u6bcf\u6b21\u6295\u63b7\u756a\u8304\u540e\uff0c\u989d\u5916\u5411 2 \u540d\u968f\u673a\u5176\u4ed6\u73a9\u5bb6\u5404\u53d1\u5c04 1 \u9897\u5206\u88c2\u756a\u8304\uff08\u53ef\u91cd\u590d\u547d\u4e2d\u540c\u4e00\u76ee\u6807\uff09\uff1b\u5206\u88c2\u756a\u8304\u4e0d\u518d\u89e6\u53d1\u5206\u88c2\u3002\u6bcf\u5c40\u4e00\u6b21\u3002"
      : "Gain +25% crit chance and +40% attack speed. Each tomato also fires two non-recursive split tomatoes at random other players; the same target may be hit twice. Once per game.";
  }
  if (effect.kind === "old-days-tomatoes") {
    const throws = Math.max(0, Number(effect.tomatoThrows) || 0);
    return isZh()
      ? `\u53ea\u5728\u7b2c 5 \u56de\u5408\u51fa\u73b0\u3002\u672c\u5c40\u6b64\u524d\u7684\u756a\u8304\u6295\u63b7\u6570 ${throws} \u00d70.5 \u52a0\u5165\u624b\u724c\u70b9\u6570\uff0c\u518d\u4e0e\u724c\u578b\u500d\u7387\u4e00\u8d77\u8ba1\u7b97\u3002`
      : `Only appears in round 5. Earlier tomato throws this game add ${throws} x0.5 chips before hand multiplier.`;
  }
  if (effect.kind === "lord-dominicks-regards") {
    return isZh()
      ? "\u66b4\u51fb\u7387 +25%\u3002\u4ece\u672c\u56de\u5408\u8d77\uff0c\u9ad8\u724c\u3001\u4e00\u5bf9\u3001\u4e24\u5bf9\u3001\u4e09\u6761\u3001\u987a\u5b50\u7684\u724c\u578b\u500d\u7387\u90fd\u81f3\u5c11\u4e3a 6\u3002\u6bcf\u5c40\u4e00\u6b21\u3002"
      : "Gain +25% crit chance. From this round onward, High Card through Straight use at least x6 hand multiplier. Once per game.";
  }
  if (effect.kind === "collector") {
    return isZh()
      ? "\u66b4\u51fb\u7387 +25%\uff1b\u672c\u56de\u5408\u70b9\u6570 +10\u3002\u4ece\u4e0b\u56de\u5408\u8d77\uff0c\u82e5\u4e0a\u4e00\u56de\u5408\u5f97\u5206\u6700\u9ad8\uff0c\u989d\u5916\u83b7\u5f97 2 \u6b21\u5f03\u724c\uff0c\u5e76\u83b7\u5f97\u5176\u4ed6\u73a9\u5bb6\u603b\u6295\u63b7\u6b21\u6570\u4e4b\u548c\u7684 10%\uff08\u53d6\u6574\uff09\u4f5c\u4e3a\u989d\u5916\u6295\u63b7\u8ba1\u6570\u3002\u6bcf\u5c40\u4e00\u6b21\u3002"
      : "Gain +25% crit chance and +10 chips this round. After any previous-round win, gain 2 discard uses and 10% of all other players' total throws, floored, as bonus throw count. Once per game.";
  }
  if (effect.kind === "returning-fundamentals") {
    return isZh()
      ? "\u53ea\u5728\u7b2c 2/3 \u56de\u5408\u51fa\u73b0\uff1b\u4e4b\u540e\u4e0d\u80fd\u518d\u9009\u7279\u6548\uff0c\u7acb\u5373\u989d\u5916\u83b7\u5f97 4 \u6b21\u5f03\u724c\u3002\u7b2c 2/3/4/5 \u56de\u5408\u5747\u83b7\u5f97 +18 \u70b9\u6570\uff0c\u500d\u7387\u5206\u522b +1.5/+1.5/+1.5/+1.75\u3002\u6bcf\u5c40\u4e00\u6b21\u3002"
      : "Only appears in rounds 2/3. You cannot choose more effects and immediately gain 4 discard uses. Rounds 2/3/4/5 gain +18 chips and +1.5/+1.5/+1.5/+1.75 mult. Once per game.";
  }
  if (effect.kind === "draw-sword") {
    return isZh()
      ? "\u53ea\u5728\u7b2c 2/3 \u56de\u5408\u51fa\u73b0\uff1b\u4e4b\u540e\u4e0d\u80fd\u518d\u5f03\u724c\u3002\u7b2c 2/3/4/5 \u56de\u5408\u5747\u83b7\u5f97 +15 \u70b9\u6570\u548c +2.25 \u500d\u7387\u3002\u6bcf\u5c40\u4e00\u6b21\u3002"
      : "Only appears in rounds 2/3. You cannot discard. Rounds 2/3/4/5 each gain +15 chips and +2.25 mult. Once per game.";
  }
  if (effect.kind === "giant-killer") {
    return isZh()
      ? "\u4ec5\u9009\u62e9\u56de\u5408\u548c\u4e0b\u4e00\u56de\u5408\u751f\u6548\uff0c\u6309\u4e0e\u9886\u5148\u8005\u7684\u5206\u5dee\u83b7\u5f97 x1.3/x1.45/x1.6/x1.75/x1.9\uff1b\u4e4b\u540e\u6d88\u5931\u4e14\u672c\u5c40\u4e0d\u518d\u51fa\u73b0\u3002"
      : "Active this round and the next for x1.3/x1.45/x1.6/x1.75/x1.9 by the gap to the leader, then expires and cannot appear again this game.";
  }
  if (effect.kind === "tomato-king") {
    const hits = Math.max(0, Number(effect.tomatoHits) || 0);
    const bonus = Math.round(hits * 1.5 * 10) / 10;
    return isZh()
      ? `本回合倍率 +1；手牌按牌型倍率结算后，最终分额外 +${bonus}（此前被命中 ${hits} 次 ×1.5）。每局一次。`
      : `This round gains +1 mult; after hand scoring, add +${bonus} final score (${hits} earlier hits x1.5). Once per game.`;
  }
  if (effect.kind === "tomato-shooter") {
    const throws = Math.max(0, Number(effect.tomatoThrows) || 0);
    const bonus = Math.round(throws * 1.5 * 10) / 10;
    return isZh()
      ? `本回合倍率 +1；手牌按牌型倍率结算后，最终分额外 +${bonus}（此前投掷 ${throws} 次 ×1.5）。每局一次。`
      : `This round gains +1 mult; after hand scoring, add +${bonus} final score (${throws} earlier throws x1.5). Once per game.`;
  }
  if (effect.kind === "tempered-tomato") {
    return isZh()
      ? "持续判定番茄阈值；达标后每回合在手牌结算后额外加入（命中×0.5 + 投掷×0.2）×0.5 最终分。每局一次。"
      : "Continuously checks tomato thresholds; once active, after hand scoring add (hits x0.5 + throws x0.2) x0.5 final score each round. Once per game.";
  }
  if (effect.kind === "suit-chip") {
    return isZh()
      ? `打出的${suit}每张 +${effect.amount} 点；即使该牌不参与牌型计分，也可以获得这项加成。`
      : `Played ${suit} cards gain +${effect.amount} chips, even when that card is not part of the scoring hand.`;
  }
  if (effect.kind === "rank-chip") {
    return isZh()
      ? `打出的 ${effect.rank} 每张 +${effect.amount} 点；即使该牌不参与牌型计分，也可以获得这项加成。`
      : `Played ${effect.rank}s gain +${effect.amount} chips, even when that card is not part of the scoring hand.`;
  }
  if (effect.kind === "red-chip") {
    return isZh()
      ? `打出的红桃和方块每张 +${effect.amount} 点；即使该牌不参与牌型计分，也可以获得这项加成。`
      : `Played hearts and diamonds gain +${effect.amount} chips, even when that card is not part of the scoring hand.`;
  }
  if (effect.kind === "tomato-king") {
    const hits = Number(effect.tomatoHits);
    const hitText = Number.isFinite(hits) ? (isZh() ? `当前计入 ${hits} 次。` : `Currently counts ${hits}.`) : "";
    return isZh()
      ? `本回合倍率 +1；本局内本回合之前被番茄命中的次数 x5 加到手牌点数。每局一次。${hitText}`
      : `This round gains +1 mult; earlier tomato hits this game add hits x5 chips. Once per game. ${hitText}`;
  }
  if (effect.kind === "tomato-shooter") {
    const throws = Number(effect.tomatoThrows);
    const throwText = Number.isFinite(throws) ? (isZh() ? `当前计入 ${throws} 次。` : `Currently counts ${throws}.`) : "";
    return isZh()
      ? `本回合倍率 +1；本局内本回合之前投掷番茄的次数 x5 加到手牌点数。每局一次。${throwText}`
      : `This round gains +1 mult; earlier tomatoes you threw this game add throws x5 chips. Once per game. ${throwText}`;
  }
  if (effect.kind === "bread-butter") {
    return isZh()
      ? "本局之后所有两对牌型倍率 +2，基础点数 +5。每局一次。"
      : "For the rest of this game, your Two Pair gains +2 mult and +5 chips. Once per game.";
  }
  if (effect.kind === "bread-cheese") {
    return isZh()
      ? "本局之后所有三条牌型倍率 +1，基础点数 +12。每局一次。"
      : "For the rest of this game, your Three of a Kind gains +1 mult and +12 chips. Once per game.";
  }
  if (effect.kind === "bread-jam") {
    return isZh()
      ? "本局之后所有顺子牌型倍率 +2，基础点数 +3。每局一次。"
      : "For the rest of this game, your Straights gain +2 mult and +3 chips. Once per game.";
  }
  if (effect.kind === "tempered-tomato") {
    return isZh()
      ? "持续判定番茄阈值；若有效命中超过 30 或有效投掷超过 50，每回合点数加入（命中x0.5 + 投掷x0.2）x5，保留一位小数。每局一次。"
      : "Continuously checks tomato thresholds; once effective hits exceed 30 or throws exceed 50, future rounds add (hits x0.5 + throws x0.2) x5 chips, rounded to one decimal. Once per game.";
  }
  if (effect.kind === "returning-fundamentals") {
    return isZh()
      ? "只在第 2/3 回合出现；之后不能再选特效。第 2/3/4/5 回合获得 +12/+15/+15/+18 点数和 +1.25/+1.5/+1.5/+1.75 倍率。每局一次。"
      : "Only appears in rounds 2/3. You cannot choose more effects. Rounds 2/3/4/5 gain +12/+15/+15/+18 chips and +1.25/+1.5/+1.5/+1.75 mult. Once per game.";
  }
  if (effect.kind === "draw-sword") {
    return isZh()
      ? "只在第 2/3 回合出现；之后不能弃牌。第 2/3/4/5 回合获得 +12/+12/+12/+15 点数和 +1.5/+1.75/+1.75/+2 倍率。每局一次。"
      : "Only appears in rounds 2/3. You cannot discard. Rounds 2/3/4/5 gain +12/+12/+12/+15 chips and +1.5/+1.75/+1.75/+2 mult. Once per game.";
  }
  if (effect.kind === "critical-hit") {
    return isZh()
      ? "本局之后参与牌型计分的牌有 50% 几率暴击，暴击点数 x1.75。"
      : "For the rest of this game, scoring-hand cards have 50% crit chance for x1.75 chips.";
  }
  if (effect.kind === "infinity-edge") {
    return isZh()
      ? "本局之后参与牌型计分的牌暴击率 +25%，暴击倍率提升至 x2.25。每局一次。"
      : "For the rest of this game, scoring-hand cards gain +25% crit chance and crit multiplier rises to x2.25. Once per game.";
  }
  if (effect.kind === "critical-switch-hand") {
    return isZh()
      ? "本局之后参与牌型计分的牌暴击率 +25%；每回合若至少一张计分牌暴击，额外获得 1 次弃牌。每局一次。"
      : "For the rest of this game, scoring-hand cards gain +25% crit chance; any scoring-card crit in a round grants 1 extra discard. Once per game.";
  }
  if (effect.kind === "dance-illusions") {
    return isZh()
      ? "\u66b4\u51fb\u7387 +25%\uff0c\u653b\u51fb\u901f\u5ea6 +65%\uff0c\u5e76\u8fdb\u5165\u5e7d\u7075\u72b6\u6001\uff1a\u5411\u8be5\u73a9\u5bb6\u6295\u63b7\u756a\u8304\u65f6\uff0c\u547d\u4e2d\u4e0d\u8ba1\u5165\u6295\u63b7\u8005\u7684\u6295\u63b7\u6b21\u6570\uff0c\u4f46\u4f1a\u8ba1\u5165\u8be5\u73a9\u5bb6\u88ab\u6295\u63b7\u7684\u6b21\u6570\u3002\u6bcf\u5c40\u4e00\u6b21\u3002"
      : "Gain +25% crit chance and +65% attack speed. You become ghosted: tomatoes thrown at you still count as hits against you, but do not count as throws for the thrower. Once per game.";
  }
  if (effect.kind === "astral-body-penalty") {
    return isZh()
      ? "星界身体的持续惩罚：本局之后每回合最终得分变为 50%。"
      : "Astral Body: reduces only hand score and no longer penalizes round 5.";
  }
  return "";
}

function battleSuitName(suit) {
  const english = { S: "Spades", H: "Hearts", D: "Diamonds", C: "Clubs" };
  const chinese = { S: "\u9ed1\u6843", H: "\u7ea2\u6843", D: "\u65b9\u5757", C: "\u6885\u82b1" };
  return isZh() ? chinese[suit] : english[suit];
}

async function handleAvatarFile(file) {
  if (!file) return;
  if (file.type && !file.type.startsWith("image/")) {
    state.error = t("Use PNG, JPEG, WebP, or GIF for the avatar.");
    render();
    return;
  }
  try {
    const dataUrl = await imageFileToAvatarDataUrl(file);
    await updateAvatar(dataUrl);
  } catch (error) {
    state.error = error.message;
    render();
  }
}

async function imageFileToAvatarDataUrl(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(rawDataUrl);
  const size = AVATAR_EXPORT_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { alpha: true });
  context.clearRect(0, 0, size, size);

  const sourceSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const sx = ((image.naturalWidth || image.width) - sourceSize) / 2;
  const sy = ((image.naturalHeight || image.height) - sourceSize) / 2;
  context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);

  return avatarDataUrlFromCanvas(canvas);
}

function avatarDataUrlFromCanvas(sourceCanvas) {
  const sizes = [AVATAR_EXPORT_SIZE, 320, 256, 192];
  const qualities = [0.95, 0.9, 0.84, 0.78, 0.72];

  for (const size of sizes) {
    const canvas = size === sourceCanvas.width ? sourceCanvas : resizeAvatarCanvas(sourceCanvas, size);
    for (const quality of qualities) {
      const webp = canvas.toDataURL("image/webp", quality);
      if (webp.startsWith("data:image/webp") && webp.length <= AVATAR_MAX_DATA_URL_LENGTH) return webp;
    }
    for (const quality of qualities) {
      const jpeg = canvas.toDataURL("image/jpeg", quality);
      if (jpeg.length <= AVATAR_MAX_DATA_URL_LENGTH) return jpeg;
    }
  }

  return resizeAvatarCanvas(sourceCanvas, 192).toDataURL("image/jpeg", 0.72);
}

function resizeAvatarCanvas(sourceCanvas, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { alpha: true });
  context.drawImage(sourceCanvas, 0, 0, size, size);
  return canvas;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Use PNG, JPEG, WebP, or GIF for the avatar."));
    image.src = src;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Avatar image is too large."));
    reader.readAsDataURL(file);
  });
}

async function updateAvatar(avatar) {
  try {
    const response = await api("/api/profile/avatar", {
      method: "POST",
      body: { avatar }
    });
    state.user = response.user;
    state.profile = response.profile;
    state.error = "";
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function logout() {
  await api("/api/logout", { method: "POST" });
  state.user = null;
  state.profile = null;
  state.showProfile = false;
  state.showPasswordModal = false;
  state.showFeedbackModal = false;
  state.passwordDraft = { oldPassword: "", newPassword: "", confirmPassword: "" };
  state.feedbackDraft = "";
  state.showUpdateNotice = false;
  state.showUpdateHistory = false;
  state.updateHistoryScroll = 0;
  state.scoreChatDrafts = {};
  state.scoreChatScrolls = {};
  state.scoreChatStickToBottom = {};
  state.tables = [];
  state.scoreTables = [];
  state.tomatoSeenKeys.clear();
  clearCurrentTable();
  clearCurrentScoreTable();
  state.currentTableId = null;
  state.currentScoreTableId = null;
  state.error = "";
  render();
}

async function createTable(name) {
  try {
    const response = await api("/api/tables", { method: "POST", body: { name } });
    state.currentTableId = response.table.id;
    setCurrentTable(response.table);
    state.createTableName = "";
    await refreshTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function openTable(id, join) {
  try {
    if (join) await api(`/api/tables/${id}/join`, { method: "POST" });
    state.currentTableId = id;
    await refreshTable();
    await refreshTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function startHand() {
  if (!state.table) return;
  try {
    const response = await api(`/api/tables/${state.table.id}/start`, { method: "POST" });
    setCurrentTable(response.table);
    await refreshTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function setReady(ready) {
  if (!state.table) return;
  try {
    const response = await api(`/api/tables/${state.table.id}/ready`, {
      method: "POST",
      body: { ready }
    });
    setCurrentTable(response.table);
    await refreshTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function addBot() {
  if (!state.table) return;
  try {
    const response = await api(`/api/tables/${state.table.id}/add-bot`, { method: "POST" });
    setCurrentTable(response.table);
    await refreshTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function rebuy() {
  if (!state.table) return;
  try {
    const response = await api(`/api/tables/${state.table.id}/rebuy`, { method: "POST" });
    setCurrentTable(response.table);
    await refreshTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function leaveTable() {
  if (!state.table) return;
  try {
    await api(`/api/tables/${state.table.id}/leave`, { method: "POST" });
    state.currentTableId = null;
    clearCurrentTable();
    await refreshProfile(false);
    await refreshTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function act(type, amount) {
  if (!state.table) return;
  try {
    const response = await api(`/api/tables/${state.table.id}/action`, {
      method: "POST",
      body: { type, amount }
    });
    setCurrentTable(response.table);
    await refreshTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function createScoreTable(name) {
  try {
    const response = await api("/api/score-tables", { method: "POST", body: { name } });
    state.currentScoreTableId = response.table.id;
    setCurrentScoreTable(response.table);
    state.createScoreTableName = "";
    await refreshScoreTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function openScoreTable(id, join) {
  try {
    if (join) await api(`/api/score-tables/${id}/join`, { method: "POST" });
    state.currentScoreTableId = id;
    await refreshScoreTable();
    await refreshScoreTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function leaveScoreTable() {
  if (!state.scoreTable) return;
  try {
    await api(`/api/score-tables/${state.scoreTable.id}/leave`, { method: "POST" });
    state.currentScoreTableId = null;
    clearCurrentScoreTable();
    await Promise.all([refreshScoreTables(false), refreshProfile(false)]);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function setScoreReady(ready) {
  if (!state.scoreTable) return;
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/ready`, {
      method: "POST",
      body: { ready }
    });
    setCurrentScoreTable(response.table);
    await refreshScoreTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function startScoreBattle() {
  if (!state.scoreTable) return;
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/start`, { method: "POST" });
    setCurrentScoreTable(response.table);
    await refreshScoreTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function addScoreBot() {
  if (!state.scoreTable) return;
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/add-bot`, { method: "POST" });
    setCurrentScoreTable(response.table);
    await refreshScoreTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function sendScoreChatMessage(tableId) {
  if (!state.scoreTable || state.scoreTable.id !== tableId) return;
  const message = String(state.scoreChatDrafts[tableId] || "").trim();
  if (!message) return;
  try {
    const response = await api(`/api/score-tables/${tableId}/chat`, {
      method: "POST",
      body: { message }
    });
    state.scoreChatDrafts[tableId] = "";
    state.scoreChatStickToBottom[tableId] = true;
    setCurrentScoreTable(response.table);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function chooseBattleEffect(effectId, target = {}) {
  if (!state.scoreTable) return;
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/effect`, {
      method: "POST",
      body: { effectId, ...target }
    });
    state.battleEffectTarget = null;
    setCurrentScoreTable(response.table);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function chooseBattleFate(fateId) {
  if (!state.scoreTable || state.battleFateBusy) return;
  state.battleFateBusy = true;
  render();
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/fate`, {
      method: "POST",
      body: { fateId }
    });
    setCurrentScoreTable(response.table);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.battleFateBusy = false;
  }
  render();
}

async function rollBattleFateDice() {
  if (!state.scoreTable || state.battleFateBusy) return;
  state.battleFateBusy = true;
  render();
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/fate-roll`, { method: "POST" });
    setCurrentScoreTable(response.table);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.battleFateBusy = false;
  }
  render();
}

async function chooseBattleFateTarget(targetSeatId) {
  if (!state.scoreTable || state.battleFateBusy) return;
  state.battleFateBusy = true;
  render();
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/fate-target`, {
      method: "POST",
      body: { targetSeatId }
    });
    setCurrentScoreTable(response.table);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.battleFateBusy = false;
  }
  render();
}

async function useBattleGiantDefense() {
  if (!state.scoreTable || state.battleFateBusy) return;
  state.battleFateBusy = true;
  render();
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/fate-giant-defense`, { method: "POST" });
    setCurrentScoreTable(response.table);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.battleFateBusy = false;
  }
  render();
}

async function discardBattleCards() {
  if (!state.scoreTable || state.battleSelections.length === 0) return;
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/discard`, {
      method: "POST",
      body: { cardCodes: state.battleSelections }
    });
    state.battleSelections = [];
    state.battleScorePreview = null;
    state.battleScorePreviewKey = "";
    setCurrentScoreTable(response.table);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function submitBattlePlay() {
  if (!state.scoreTable || state.battleSelections.length !== 5) return;
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/play`, {
      method: "POST",
      body: { cardCodes: state.battleSelections }
    });
    state.battleSelections = [];
    state.battleScorePreview = null;
    state.battleScorePreviewKey = "";
    setCurrentScoreTable(response.table);
    await refreshScoreTables(false);
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function autoPlayBattleHand() {
  if (!state.scoreTable || state.battleAutoPlayBusy) return;
  state.battleAutoPlayBusy = true;
  state.battleSelections = [];
  state.battleScorePreview = null;
  state.battleScorePreviewKey = "";
  render();
  try {
    const response = await api(`/api/score-tables/${state.scoreTable.id}/auto-play`, { method: "POST" });
    setCurrentScoreTable(response.table);
    await refreshScoreTables(false);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.battleAutoPlayBusy = false;
  }
  render();
}

function actionTimerText(table) {
  if (!table || !table.actionDeadline) return "";
  const remaining = Math.max(0, Math.ceil((table.actionDeadline - table.serverNow) / 1000));
  return `(${remaining}s)`;
}

function isLivePhase(phase) {
  return ["preflop", "flop", "turn", "river"].includes(phase);
}

async function api(url, options = {}) {
  const fetchOptions = {
    method: options.method || "GET",
    headers: {},
    credentials: "same-origin"
  };
  if (options.body !== undefined) {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(options.body);
  }
  const response = await fetch(url, fetchOptions);
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") node.className = value;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "value") node.value = value;
    else if (key === "disabled" && value) node.disabled = true;
    else if (key === "required" && value) node.required = true;
    else if (key === "checked" && value) node.checked = true;
    else if (key === "draggable") node.draggable = value;
    else if (value !== false && value !== null && value !== undefined) node.setAttribute(key, value);
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child === null || child === undefined || child === "") continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}
