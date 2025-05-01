import { Bot } from "grammy";
import fs from "fs";

const bot = new Bot("7463496889:AAGU6ouDgH68GM8UwFjEZuxDilmcza1IRVY");

let users = {};
let giftCodes = {};
const ADMIN_ID = 5896960462; // replace with your Telegram ID

function generateGiftCode() {
  return `0c${Math.floor(10000 + Math.random() * 90000)}HEXA`;
}

function createGift(type = null) {
  const prize =
    type === "medium"
      ? Math.floor(20000 + Math.random() * 30000)
      : type === "ref"
      ? 500
      : Math.floor(100 + Math.random() * 19900);
  const difficulty =
    prize >= 20000 ? "🟡 Medium" : prize >= 500 ? "🔵 Referral" : "🟢 Easy";
  return {
    id: generateGiftCode(),
    prize,
    difficulty,
    claimed: false,
  };
}

function addGiftToUser(id, gift) {
  if (!users[id])
    users[id] = { gifts: [], xp: 0, referrals: [], streak: 0, lastClaim: 0 };
  users[id].gifts.push(gift);
  giftCodes[gift.id] = { owner: id };
}

// Start
bot.command("start", async (ctx) => {
  const id = ctx.from.id;
  const ref = ctx.match?.input?.split(" ")[1];
  if (!users[id]) {
    users[id] = { gifts: [], xp: 0, referrals: [], streak: 0, lastClaim: 0 };
    const chance = Math.random();
    const gift = createGift(chance < 0.8 ? "easy" : "medium");
    addGiftToUser(id, gift);
    await ctx.reply(
      `🎁 Welcome, ${ctx.from.first_name}!\nYou received a gift ID: 🔐 \`${gift.id}\`\nUse /claim <gift_code> in the group to claim.`,
      { parse_mode: "Markdown" }
    );

    // Handle referral
    if (ref && ref.startsWith("ref")) {
      const refId = ref.replace("ref", "");
      if (refId != id && users[refId]) {
        users[refId].referrals.push(id);
        const referralGift = createGift("ref");
        addGiftToUser(refId, referralGift);

        if (users[refId].referrals.length % 5 === 0) {
          const bonusGift = createGift("medium");
          addGiftToUser(refId, bonusGift);
        }

        await bot.api.sendMessage(
          refId,
          `🎉 New referral joined!\nYou've been rewarded with a 500 PD gift.\nKeep going to unlock more!`
        );
      }
    }
  } else {
    ctx.reply("You've already started and received your free gift.");
  }
});

// Referral
bot.command("ref", async (ctx) => {
  const id = ctx.from.id;
  const code = `ref${id}`;
  ctx.reply(
    `🔗 Your referral link:\nhttps://t.me/${ctx.me.username}?start=${code}`
  );
});

// Leaderboard
bot.command("leaderboard", async (ctx) => {
  const sorted = Object.entries(users)
    .sort((a, b) => b[1].referrals.length - a[1].referrals.length)
    .slice(0, 10);
  let msg = "🏆 Referral Leaderboard:\n\n";
  sorted.forEach(([uid, data], i) => {
    msg += `${i + 1}. [User](tg://user?id=${uid}) - ${
      data.referrals.length
    } referrals\n`;
  });
  ctx.reply(msg, { parse_mode: "Markdown" });
});

// Profile
bot.command("profile", (ctx) => {
  const id = ctx.from.id;
  const u = users[id];
  if (!u) return ctx.reply("No profile found. Use /start first.");
  const ranks =
    u.xp > 100 ? "🔥 Pro" : u.xp > 50 ? "⭐ Skilled" : "🆕 Newbie";
  ctx.reply(
    `🧑‍💼 Profile:
🎁 Gifts: ${u.gifts.filter((g) => !g.claimed).length} available
⭐ XP: ${u.xp} (${ranks})
🎯 Streak: ${u.streak}
👥 Referrals: ${u.referrals.length}`
  );
});

// Claim
bot.command("claim", async (ctx) => {
  const [_, code] = ctx.message.text.split(" ");
  const uid = ctx.from.id;
  const chat = ctx.chat;

  if (!code || !giftCodes[code]) return ctx.reply("❌ Invalid gift code.");
  const gift = users[giftCodes[code].owner].gifts.find((g) => g.id === code);
  if (gift.claimed) return ctx.reply("⚠️ Gift already claimed.");

  gift.claimed = true;
  if (!users[uid]) users[uid] = { gifts: [], xp: 0, referrals: [], streak: 0 };

  users[uid].xp += 10;
  const today = new Date().toDateString();
  const lastClaimDay = new Date(users[uid].lastClaim).toDateString();
  if (today !== lastClaimDay) {
    users[uid].streak += 1;
    users[uid].lastClaim = Date.now();
  }

  await ctx.replyWithChatAction("typing");
  setTimeout(() => {
    ctx.reply(
      `🎉 Congrats, [${ctx.from.first_name}](tg://user?id=${uid})!\n\n💰 You claimed: *${gift.prize} PD*\nDifficulty: ${gift.difficulty}`,
      { parse_mode: "Markdown" }
    );
  }, 1000);
});

// Broadcast (Admin only)
bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) return ctx.reply("❌ Message required.");
  let success = 0;
  for (const id in users) {
    try {
      await bot.api.sendMessage(id, `📢 Admin Broadcast:\n\n${message}`);
      success++;
    } catch {}
  }
  ctx.reply(`✅ Sent to ${success} users.`);
});

// Claim only valid format in groups
bot.on("message", async (ctx) => {
  const msg = ctx.message;
  const chat = msg.chat;
  if (chat.type === "private") return;

  if (!/\/claim\s+0c\d{5}HEXA/.test(msg.text || "")) {
    try {
      await ctx.api.deleteMessage(chat.id, msg.message_id);
    } catch (e) {}
  }
});

bot.start();
