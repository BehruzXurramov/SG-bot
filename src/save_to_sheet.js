import axios from "axios";
import { config } from "../config.js";

async function saveToSheet(userData) {
  try {
    const res = await axios.post(config.WEBHOOK_URL, {
      id: userData.id,
      fullname: userData.fullname,
      username: userData.username ? `@${userData.username}` : "",
      phone: userData.phone,
    });
  } catch (err) {
    throw err;
  }
}

export default saveToSheet;