import { Bot } from "grammy"; import fs from "fs";

const bot = new Bot("7463496889:AAGU6ouDgH68GM8UwFjEZuxDilmcza1IRVY");

let users = {}; let giftCodes = {};

function generateGiftCode() { return 0c${Math.floor(10000 + Math.random() * 90000)}HEXA; }

function createGift(type = null) { const prize = type === "medium" ? Math.floor(20000 + Math.random() * 30000) : Math.floor(100 + Math.random() * 19900); const difficulty = prize < 20000 ? "🟢 Easy" : "🟡 Medium"; return { id: generateGiftCode(), prize, difficulty, claimed: false }; }

function addGiftToUser(id, gift) { if (!users[id]) users[id] = { gifts: [], xp: 0, referrals: [], streak: 0 }; users[id].gifts.push(gift); giftCodes[gift.id] = { owner: id }; }

bot.command("start", async (ctx) => { const id = ctx.from.id; if (!users[id]) { users[id] = { gifts: [], xp: 0, referrals: [], streak: 0 }; const chance = Math.random(); const gift = createGift(chance < 0.8 ? "easy" : "medium"); addGiftToUser(id, gift); ctx.reply(🎁 Welcome, ${ctx.from.first_name}! You received a gift ID: 🔐 \${gift.id}` Use /claim <gift_code> in the group to claim.`, { parse_mode: "Markdown" }); } else { ctx.reply("You've already started and received your free gift."); } });

bot.command("ref", async (ctx) => { const id = ctx.from.id; const code = ref${id}; ctx.reply(🔗 Your referral link: https://t.me/${ctx.me.username}?start=${code}); });

bot.command("leaderboard", async (ctx) => { const sorted = Object.entries(users).sort((a, b) => b[1].referrals.length - a[1].referrals.length).slice(0, 10); let msg = "🏆 Referral Leaderboard:\n\n"; sorted.forEach(([uid, data], i) => { msg += ${i + 1}. [User](tg://user?id=${uid}) - ${data.referrals.length} referrals\n; }); ctx.reply(msg, { parse_mode: "Markdown" }); });

bot.command("profile", (ctx) => { const id = ctx.from.id; const u = users[id]; if (!u) return ctx.reply("No profile found. Use /start first."); ctx.reply(🧑‍💼 Profile: 🎁 Gifts: ${u.gifts.filter(g => !g.claimed).length} available ⭐ XP: ${u.xp} 🎯 Streak: ${u.streak} 👥 Referrals: ${u.referrals.length}); });

bot.command("claim", async (ctx) => { const [_, code] = ctx.message.text.split(" "); const uid = ctx.from.id; const chat = ctx.chat;

if (!code || !giftCodes[code]) return ctx.reply("❌ Invalid gift code.");
const gift = users[giftCodes[code].owner].gifts.find(g => g.id === code);
if (gift.claimed) return ctx.reply("⚠️ Gift already claimed.");

gift.claimed = true;
users[uid].xp += 10;
users[uid].streak += 1;
await ctx.replyWithChatAction("typing");
setTimeout(() => {
    ctx.reply(`🎉 Congrats, [${ctx.from.first_name}](tg://user?id=${uid})!

💰 You claimed: ${gift.prize} PD Difficulty: ${gift.difficulty}`, { parse_mode: "Markdown" }); }, 1000); });

bot.on("message", async (ctx) => { const msg = ctx.message; const chat = msg.chat; if (chat.type === "private") return;

if (!/\/claim\s+0c\d{5}HEXA/.test(msg.text || "")) {
    try { await ctx.api.deleteMessage(chat.id, msg.message_id); } catch (e) {}
}

});

bot.start();

