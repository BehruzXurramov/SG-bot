import { Composer } from "telegraf";
import saveToSheet from "./save_to_sheet.js";
import errorHandler from "./error_handler.js";
import { users, done_users } from "./ljdb.js";
import chatCleaner from "./chat_cleaner.js";

const action = new Composer();

action.action("verify", async (ctx) => {
  try {
    if (!ctx.from) return;
    if (done_users.data.includes(ctx.from.id)) return;
    if (!users.data[ctx.from.id]) return;
    const id = ctx.from.id;

    await saveToSheet({
      id: id,
      fullname: users.data[id].fio,
      username: ctx.from.username,
      phone: users.data[id].phone,
    });

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

export default action;
