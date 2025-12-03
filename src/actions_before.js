import { Composer } from "telegraf";
import errorHandler from "./error_handler.js";
import { users, done_users } from "./ljdb.js";
import chatCleaner from "./chat_cleaner.js";

const actionBefore = new Composer();

actionBefore.action("verify", async (ctx) => {
  try {
    if (!ctx.from) return;
    if (done_users.data.includes(ctx.from.id)) return;
    if (!users.data[ctx.from.id]) return;
    const id = ctx.from.id;

    const message = await ctx.reply(
      "Botda ro'yxatdan o'tganingiz bilan tabriklaymiz. Endi ushbu botdan to'liq foydalana olishingiz mumkin."
    );

    chatCleaner(ctx, message.message_id - 1);

    delete users.data[id];
    done_users.data.push(id);
    done_users.save();
    users.save();
  } catch (error) {
    errorHandler(error, ctx);
  }
});

actionBefore.action(/^elon_(.+)_(.+)$/, async (ctx) => {
  try {
    const chatId = ctx.match[1];
    const messageId = ctx.match[2];

    delete users.data[ctx.from.id];
    done_users.data.push(ctx.from.id);
    done_users.save();
    users.save();

    await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
    await ctx.telegram.copyMessage(ctx.from.id, chatId, messageId);
  } catch (error) {
    errorHandler(error, ctx);
  }
});

export default actionBefore;
