import { Telegraf } from "telegraf";
import { config } from "./config.js";
import action from "./src/actions.js";
import regis from "./src/registration.middleware.js";

const bot = new Telegraf(config.BOT_API_KEY);

bot.use(action);
bot.use(regis);



bot.launch(() => {
  console.log("Bot ishga tushdi");
});

// Ctrl+C bilan to‘xtashda pollingni to‘xtatish
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
