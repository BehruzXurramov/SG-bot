import { Telegraf } from "telegraf";
import { config } from "./config.js";

const PORT = config.PORT;

const bot = new Telegraf(config.BOT_API_KEY);

bot.start((ctx) => {
  ctx.reply("Botga xush kelibsiz");
});

bot.launch(() => {
  console.log("Bot ishga tushdi");
});
