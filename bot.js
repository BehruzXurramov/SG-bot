import { Telegraf } from "telegraf";
import { config } from "./config.js";
import action from "./src/actions.js";
import regis from "./src/registration.middleware.js";

const bot = new Telegraf(config.BOT_API_KEY);

bot.use(action);
bot.use(regis);

bot.catch((err, ctx) => {
  console.error(`Bot catch error:`, err);

  bot.telegram
    .sendMessage(config.TECH_ADMIN, `Bot error:\n${err.message}`)
    .catch(() => {});

  if (ctx) {
    ctx
      .reply(
        "Botda xatolik yuz berdi, iltimos birozdan so'ng qayta urinib ko'ring."
      )
      .catch(() => console.log("Could not reply to user"));
  }
});

bot
  .launch(() => console.log(`Bot is running smoothly!`))
  .catch((err) => {
    console.error("Bot failed to start:", err.message);
    setTimeout(() => {
      console.log("Restarting bot in 5 seconds...");
      bot.launch(() => console.log(`Bot is running smoothly!`)).catch(() => {});
    }, 5000);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled error (bot keeps running):", error.message);
});

process.on("uncaughtException", (error) => {
  console.error("Critical error (bot keeps running):", error.message);
});
