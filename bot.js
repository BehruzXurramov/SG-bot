import { Telegraf } from "telegraf";
import { config } from "./config.js";
import LJDB from "ljdb";
import errorHandler from "./helpers/error_handler.js";

const PORT = config.PORT;

const bot = new Telegraf(config.BOT_API_KEY);
const users = new LJDB("users");

bot.action("verify", async (ctx) => {
  try {
    users.data[ctx.chat.id].status = "done";
    users.save();
    await ctx.editMessageReplyMarkup({});
    await ctx.reply(
      "Botda ro'yxatdan o'tganingiz bilan tabriklaymiz. Endi ushbu botdan to'liq foydalana olishingiz mumkin."
    );
  } catch (error) {
    errorHandler(error, ctx);
  }
});

bot.use(async (ctx, next) => {
  try {
    if (!users.data[ctx.chat.id]) {
      users.data[ctx.chat.id] = {
        status: "fio",
      };
      users.save();
      return await ctx.reply(
        "Assalomu alaykum *Founders Community*ga hush kelibsiz. Iltimos botdan foydalana olish uchun to'liq ism familiyangizni kiriting.",
        { parse_mode: "Markdown" }
      );
    }

    if (users.data[ctx.chat.id].status === "fio") {
      if (ctx.message.text.split(" ").length != 2) {
        return await ctx.reply(
          "Iltimos ism va familiyangizni quyidagi ko'rinishda kiriting:\n*Behruz Xurramov*",
          { parse_mode: "Markdown" }
        );
      }

      if (ctx.message.text.length > 50) {
        return await ctx.reply(
          "Ism va familiyadagi belgilar soni 50 tadan oshmasligi zarur!"
        );
      }

      users.data[ctx.chat.id].fio = ctx.message.text;
      users.data[ctx.chat.id].status = "phone";
      users.save();

      return await ctx.reply(
        "Davom etish uchun telefon raqamingizni ulashing.",
        {
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
        }
      );
    }

    if (users.data[ctx.chat.id].status === "phone") {
      const contact = ctx.message.contact;

      if (!contact) {
        return await ctx.reply(
          "Iltimos *☎️Raqamni ulashish* tugmasi orqali raqamingizni ulashing.",
          { parse_mode: "Markdown" }
        );
      }

      if (contact.user_id !== ctx.chat.id) {
        return await ctx.reply("Iltimos o'z raqamingizni ulashing.");
      }

      users.data[ctx.chat.id].phone = contact.phone_number;
      users.data[ctx.chat.id].status = "verify";
      users.save();

      return await ctx.reply(
        "Iltimos ushbu havola orqali *Founders Community*ga qo'shiling va qo'shilganingizni tasdiqlang:\nhttps://www.founders-community.com/#Sign-Up",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅Tasdiqlash", callback_data: "verify" }],
            ],
          },
        }
      );
    }

    if (users.data[ctx.chat.id].status !== "done") {
      return await ctx.reply(
        "Iltimos xabardagi *✅Tasdiqlash* tugmasi orqali qo'shilganingizni tasdiqlang!",
        { parse_mode: "Markdown" }
      );
    }

    next();
  } catch (error) {
    errorHandler(error, ctx);
  }
});

bot.launch(() => {
  console.log("Bot ishga tushdi");
});
