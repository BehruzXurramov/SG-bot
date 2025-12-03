import { Composer } from "telegraf";
import { admins, done_users, users } from "./ljdb.js";
import errorHandler from "./error_handler.js";
import chatCleaner from "./chat_cleaner.js";

const regis = new Composer();

regis.use(async (ctx, next) => {
  try {
    if (ctx.chat?.type !== "private") return;
    if (!ctx.message && !ctx.callbackQuery) return;

    if (done_users.data.includes(ctx.from.id)) return next();

    const id = ctx.from.id;

    if (!users.data[id]) {
      chatCleaner(ctx);
      users.data[id] = { status: "fio" };
      users.data[id].last = ctx.message.message_id + 1;
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
      chatCleaner(ctx);
      user.last = ctx.message.message_id + 1;
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
      chatCleaner(ctx);
      user.last = user.last = ctx.message.message_id + 1;
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
            keyboard: [],
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

regis.use(async (ctx, next) => {
  try {
    if (!admins.data[ctx.from.id]) return next();
    if (admins.data[ctx.from.id] != "elon") return next();

    admins.data[ctx.from.id] = "none";
    admins.save();

    if (!ctx.message) {
      await ctx.reply("Habar topilmadi.");
    }

    const waitMessage = await ctx.reply(
      "Foydalanuvchilarga elonni yuborish jarayoni boshlandi. Iltimos biroz kuting!"
    );

    let sent = 0;
    let blocked = 0;
    let undone = 0;

    done_users.data.forEach(async (item) => {
      try {
        await ctx.telegram.copyMessage(
          item,
          ctx.chat.id,
          ctx.message.message_id
        );
        sent++;
      } catch (err) {
        blocked++;
      }

      await new Promise((resolve) => setTimeout(resolve, 35));
    });

    let users_id = Object.keys(users.data);

    users_id.forEach(async (item) => {
      try {
        await ctx.telegram.sendMessage(
          item,
          "Sizga yangi elon bor, uni ko'rish uchun iltimos avval quyidagi tugma orqali *Founders Community*ga [ro'yxatdan o'ting](https://login.circle.so/sign_up?request_host=community.sgfounders.school&user%5Binvitation_token%5D=b5df15ec8c8b3270123fbb2e3bea28cf33880285-53107530-d81e-46fe-b635-b757df0c9e55#email) va buni tasdiqlang",
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
                [
                  {
                    text: "✅Tasdiqlash",
                    callback_data: `elon_${ctx.chat.id}_${ctx.message.message_id}`,
                  },
                ],
              ],
            },
          }
        );

        undone++;
      } catch (error) {
        blocked++;
      }

      await new Promise((resolve) => setTimeout(resolve, 35));
    });

    await ctx.deleteMessage(waitMessage.message_id);
    await ctx.reply(
      `✅ Elon muvaffaqiyatli yuborildi!\n` +
        `📤 Yuborildi: ${sent} ta\n` +
        `🚫 Yuborolmadi: ${blocked} ta\n` +
        `🕐 Tasdiqlanishi kutulmoqda: ${undone} ta`
    );
  } catch (error) {
    errorHandler(error, ctx);
  }
});

export default regis;
