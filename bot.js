import { Telegraf } from "telegraf";
import { config } from "./config.js";
import LJDB from "ljdb";
import errorHandler from "./helpers/error_handler.js";
import axios from "axios";

const bot = new Telegraf(config.BOT_API_KEY);
const users = new LJDB("users");

async function saveToSheet(userData, ctx) {
  try {
    const res = await axios.post(config.WEBHOOK_URL, {
      id: userData.id,
      fullname: userData.fullname,
      username: userData.username ? `@${userData.username}` : "",
      phone: userData.phone,
    });
  } catch (err) {
    throw err;
  }
}

// Callback "verify"
bot.action("verify", async (ctx) => {
  try {
    if (!ctx.from) return;
    if (!users.data[ctx.from.id]) return;
    const id = ctx.from.id;

    await saveToSheet({
      id: id,
      fullname: users.data[id].fio,
      username: ctx.from.username,
      phone: users.data[id].phone,
    });

    users.data[id] = { status: "done" };
    users.save();

    await ctx.editMessageReplyMarkup({});
    await ctx.reply(
      "Botda ro'yxatdan o'tganingiz bilan tabriklaymiz. Endi ushbu botdan to'liq foydalana olishingiz mumkin."
    );
  } catch (error) {
    errorHandler(error, ctx);
  }
});

// Main middleware – faqat private chat, boshqa xabarlarni o'tkazmaydi
bot.use(async (ctx, next) => {
  try {
    // Faqat private chatlar
    if (ctx.chat?.type !== "private") return;

    // Faqat oddiy message yoki contact
    if (!ctx.message && !ctx.callbackQuery) return;

    const id = ctx.from.id;

    // Agar user hali bazada bo‘lmasa
    if (!users.data[id]) {
      users.data[id] = { status: "fio" };
      users.save();

      await ctx.reply(
        "Assalomu alaykum *Founders Community*ga hush kelibsiz. Iltimos botdan foydalana olish uchun to'liq ism familiyangizni kiriting.",
        { parse_mode: "Markdown" }
      );
      return;
    }

    const user = users.data[id];

    // Status: FIO
    if (user.status === "fio") {
      if (!ctx.message?.text) return;

      if (ctx.message.text.split(" ").length !== 2) {
        await ctx.reply(
          "Iltimos ism va familiyangizni quyidagi ko'rinishda kiriting:\n*Behruz Xurramov*",
          { parse_mode: "Markdown" }
        );
        return;
      }

      if (ctx.message.text.length > 50) {
        await ctx.reply(
          "Ism va familiyadagi belgilar soni 50 tadan oshmasligi zarur!"
        );
        return;
      }

      user.fio = ctx.message.text;
      user.status = "phone";
      users.save();

      await ctx.reply("Davom etish uchun telefon raqamingizni ulashing.", {
        reply_markup: {
          keyboard: [
            [
              {
                text: "☎️Raqamni ulashish",
                request_contact: true,
              },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
          selective: true,
        },
      });
      return;
    }

    // Status: PHONE
    if (user.status === "phone") {
      const contact = ctx.message?.contact;
      if (!contact) {
        await ctx.reply(
          "Iltimos *☎️Raqamni ulashish* tugmasi orqali raqamingizni ulashing.",
          { parse_mode: "Markdown" }
        );
        return;
      }

      if (contact.user_id !== id) {
        await ctx.reply("Iltimos o'z raqamingizni ulashing.");
        return;
      }

      user.phone = contact.phone_number;
      user.status = "verify";
      users.save();

      await ctx.reply(
        "Iltimos quyidagi tugma orqali *Founders Community*ga [ro'yxatdan o'ting](https://login.circle.so/sign_up?request_host=community.sgfounders.school&user%5Binvitation_token%5D=b5df15ec8c8b3270123fbb2e3bea28cf33880285-53107530-d81e-46fe-b635-b757df0c9e55#email) va buni tasdiqlang",
        {
          parse_mode: "MarkdownV2", // MarkdownV2 is safer for links in text
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Ro'yxatdan o'tish",
                  url: "https://login.circle.so/sign_up?request_host=community.sgfounders.school&user%5Binvitation_token%5D=b5df15ec8c8b3270123fbb2e3bea28cf33880285-53107530-d81e-46fe-b635-b757df0c9e55#email",
                },
              ],
              [{ text: "✅Tasdiqlash", callback_data: "verify" }],
            ],
          },
        }
      );
      return;
    }

    // Status: VERIFY (foydalanuvchi hali qo‘shilmagan)
    if (user.status !== "done") {
      await ctx.reply(
        "Iltimos xabardagi *✅Tasdiqlash* tugmasi orqali qo'shilganingizni tasdiqlang!",
        { parse_mode: "Markdown" }
      );
      return;
    }

    // Agar user status = done bo‘lsa → boshqa handler’ga o‘tadi
    return next();
  } catch (error) {
    errorHandler(error, ctx);
  }
});

// Start bot
bot.launch(() => {
  console.log("Bot ishga tushdi");
});

// Ctrl+C bilan to‘xtashda pollingni to‘xtatish
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
