const errorCatch = (err, ctx) => {
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
};

export default errorCatch;
