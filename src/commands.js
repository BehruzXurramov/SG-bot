import { Composer } from "telegraf";
import errorHandler from "./error_handler.js";
import { config } from "../config.js";
import { admins } from "./ljdb.js";

const command = new Composer();

command.command("add", async (ctx) => {
  try {
    if (config.TECH_ADMIN != ctx.from.id) return;
    const adminId = ctx.message.text.split(" ")[1];

    if (!/^\d+$/.test(adminId)) {
      return await ctx.reply("ID noto'gri yozilgan.");
    }

    admins.data[adminId] = "none";
    admins.save();

    await ctx.deleteMessage(ctx.message.message_id);

    await ctx.reply("Admin qo'shildi.");
  } catch (error) {
    errorHandler(error, ctx);
  }
});

command.command("elon", async (ctx) => {
  try {
    if (!admins.data[ctx.from.id]) return;

    admins.data[ctx.from.id] = "elon";
    admins.save();

    await ctx.deleteMessage(ctx.message.message_id);
    await ctx.reply("Elonni yuborishingiz mumkin:")
  } catch (error) {
    errorHandler(error, ctx);
  }
});

export default command;
