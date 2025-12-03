import { Telegraf } from "telegraf";
import { config } from "./config.js";
import regis from "./src/registration.middleware.js";
import errorCatch from "./src/error_catch.js";
import actionBefore from "./src/actions_before.js";
import command from "./src/commands.js";

const bot = new Telegraf(config.BOT_API_KEY);

bot.use(actionBefore);
bot.use(regis);
bot.use(command);

bot.catch(errorCatch);

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
