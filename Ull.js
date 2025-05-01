import { Bot } from "grammy";

const bot = new Bot("7463496889:AAGU6ouDgH68GM8UwFjEZuxDilmcza1IRVY");

const giftIds = new Map();
const cooldowns = new Map();

bot.command("start", async (ctx) => {
    const id = ctx.from.id;
    if (giftIds.has(id)) {
        const g = giftIds.get(id);
        return ctx.reply(`🎁 Your existing gift ID:\n\n🔐 \`${g.id}\``, { parse_mode: "Markdown" });
    }
    const code = `0c${Math.floor(10000 + Math.random() * 90000)}HEXA`;
    giftIds.set(id, { id: code, used: false });
    ctx.reply(`🎁 Your unique gift ID:\n\n🔐 \`${code}\`\n\nOnly use it once in the group.`, { parse_mode: "Markdown" });
});

bot.on("message", async (ctx) => {
    const msg = ctx.message;
    const chat = msg.chat;
    if (chat.type === "private" || msg.forward_date) return;

    const uid = msg.from.id;
    const uname = msg.from.first_name;
    const data = giftIds.get(uid);

    if (data && msg.text === data.id && !data.used) {
        data.used = true;
        if (cooldowns.has(uid)) cooldowns.delete(uid);

        const prize = Math.floor(100 + Math.random() * 99900);
        const diff = prize < 20000 ? "🟢 Easy" : prize < 50000 ? "🟡 Medium" : "🔴 Extremely Hard";

        await ctx.reply("🔓 Validating gift ID...");
        setTimeout(async () => {
            await ctx.reply(`🎉 Congratulations, [${uname}](tg://user?id=${uid})!\n\n💰 *${prize.toLocaleString()} PD*\nDifficulty: ${diff}`, { parse_mode: "Markdown" });
        }, 1200);
    } else {
        try {
            await ctx.api.deleteMessage(chat.id, msg.message_id);
        } catch (e) {}
    }
});

bot.start();
