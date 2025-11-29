import { Composer } from "telegraf";
import saveToSheet from "./save_to_sheet.js";
import errorHandler from "./error_handler.js";
import users from "./ljdb.js";

const action = new Composer();

action.action("verify", async (ctx) => {
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

export default action;
