const moment = require("moment-timezone");
const axios = require("axios");
const pidusage = require("pidusage");
const { performance } = require("perf_hooks");

moment.tz.setDefault("Asia/Dhaka");

module.exports.config = {
  name: "uptime",
  version: "1.0.1",
  permission: 0,
  credits: "IMRAN",
  description: "Shows bot uptime and status info (image based)",
  prefix: true,
  category: "info",
  usages: "botstatus",
  cooldowns: 5,
  dependencies: {
    "moment-timezone": "latest",
    axios: "latest",
    pidusage: "latest",
  },
};

module.exports.run = async ({ api, event }) => {
  try {
    // logging للتأكد من تنفيذ الأمر
    console.log(`[uptime] Command triggered by senderID: ${event.senderID}`);

    const timeStart = performance.now();

    let usageInfo = null;
    try {
      usageInfo = await pidusage(process.pid);
    } catch (e) {
      console.warn("pidusage failed:", e.message);
    }

    const currentTime = moment().format("h:mm:ss A");
    const currentDate = moment().format("DD/MM/YYYY");

    const uptimeInSeconds = process.uptime();
    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);
    const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;

    const timeEnd = performance.now();
    const ping = Math.round(timeEnd - timeStart);

    const bodyText = `🐥 ʙᴏᴛ ꜱᴛᴀᴛᴜꜱ 🐥
🕒 ᴜᴘᴛɪᴍᴇ : ${hours}ʜ ${minutes}ᴍ ${seconds}ꜱ
📶 ᴘɪɴɢ    : ${ping}ᴍꜱ
⏰ ᴛɪᴍᴇ    : ${currentTime}
📅 ᴅᴀᴛᴇ    : ${currentDate}
👑 ᴏᴡɴᴇʀ   : ɪᴍʀᴀɴ_🦋`;

    const apiUrl = "https://uptime-imran.onrender.com/up";

    const messagePayload = { body: bodyText };

    // محاولة جلب صورة من API
    try {
      const response = await axios.get(apiUrl, {
        responseType: "stream",
        params: {
          uptime: formattedUptime,
          ping: `${ping}ms`,
          time: currentTime,
          date: currentDate,
          owner: "IMRAN",
        },
        timeout: 8000,
      });

      if (response && response.data) {
        messagePayload.attachment = response.data;
      }
    } catch (err) {
      console.warn("Image API fetch failed, falling back to text-only. Error:", err.message);
    }

    return api.sendMessage(messagePayload, event.threadID, event.messageID);
  } catch (error) {
    console.error("botstatus command error:", error);
    return api.sendMessage(
      "❌ Failed to generate bot status image or text.",
      event.threadID,
      event.messageID
    );
  }
};
