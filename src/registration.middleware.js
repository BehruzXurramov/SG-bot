import { Composer } from "telegraf";
import users from "./ljdb.js";
import errorHandler from "./error_handler.js";

const regis = new Composer();

regis.use(async (ctx, next) => {
  try {
    if (ctx.chat?.type !== "private") return;

    if (!ctx.message && !ctx.callbackQuery) return;

    const id = ctx.from.id;

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
          parse_mode: "Markdown",
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

    if (user.status !== "done") {
      await ctx.reply(
        "Iltimos xabardagi *✅Tasdiqlash* tugmasi orqali qo'shilganingizni tasdiqlang!",
        { parse_mode: "Markdown" }
      );
      return;
    }

    return next();
  } catch (error) {
    errorHandler(error, ctx);
  }
});

export default regis;