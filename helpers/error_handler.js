import { config } from "../config.js";

async function errorHandler(error, ctx) {
  try {
    console.log(error);
    await ctx.telegram.sendMessage(config.TECH_ADMIN, error);
  } catch (error) {
    console.log(error);
  }
}

export default errorHandler;
