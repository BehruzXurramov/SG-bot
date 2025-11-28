import { config } from "../config.js";

async function errorHandler(error, ctx) {
  try {
    console.log("ERROR:", error);
    console.log("--------------------------------------------------------");

    // Adminga xatolik haqida xabar (faqat log)
    try {
      await ctx.telegram.sendMessage(config.TECH_ADMIN, String(error));
    } catch (e) {
      console.error("Adminga xabar yuborilmadi:", e);
    }

    // Foydalanuvchiga reply qilinadigan joylarni filtrlaymiz
    if (ctx.update?.business_message || ctx.chat?.type !== "private") return;
    if (!ctx.message) return;

    await ctx.reply(
      "Botda xatolik yuz berdi, iltimos birozdan so'ng qayta urinib ko'ring."
    );
  } catch (err) {
    console.log("Error handler failed:", err);
  }
}

export default errorHandler;
