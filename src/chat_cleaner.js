import { users } from "./ljdb.js";

const chatCleaner = (ctx, thisId = ctx.message.message_id) => {
  let last = users.data[ctx.from.id]?.last || 0;

  for (; last <= thisId; last++) {
    ctx.deleteMessage(last).catch((error) => {});
  }
};

export default chatCleaner;
