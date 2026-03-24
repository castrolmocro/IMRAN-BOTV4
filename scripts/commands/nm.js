// Use global.nameLocks to share data between commands
if (!global.nameLocks) global.nameLocks = new Map();
const lockedNames = global.nameLocks;

module.exports.config = {
  name: "nm",
  version: "1.3.0",
  permission: 1,
  credits: "you",
  prefix: true,
  description: "Lock & monitor group name",
  category: "admin",
  usages: "nm [name] | nm stop",
  cooldowns: 5
};

module.exports.onLoad = function () {
  setInterval(async () => {
    if (!global.client?.api) return;

    for (const [threadID, lockedName] of lockedNames.entries()) {
      try {
        const info = await global.client.api.getThreadInfo(threadID);

        // فقط إذا تغير الاسم
        if (info.threadName && info.threadName !== lockedName) {
          await global.client.api.setTitle(lockedName, threadID);
        }
      } catch (e) {
        // تجاهل الأخطاء
      }
    }
  }, 15000); // كل 15 ثانية
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  const botAdmins = [
    ...(global.config.ADMINBOT || []),
    ...(global.config.OPERATOR || []),
    ...(global.config.OWNER || [])
  ].map(String);

  if (!botAdmins.includes(String(senderID))) {
    return api.sendMessage("❌ هذا الأمر خاص بإدارة البوت فقط", threadID);
  }

  // إيقاف القفل
  if (args[0] === "stop") {
    if (!lockedNames.has(threadID)) {
      return api.sendMessage("⚠️ اسم الغروب غير مقفول أصلًا", threadID);
    }

    lockedNames.delete(threadID);
    return api.sendMessage("🔓 تم إيقاف قفل اسم الغروب", threadID);
  }

  const name = args.join(" ");
  if (!name) {
    return api.sendMessage("⚠️ الاستعمال:\n!nm اسم_الغروب\n!nm stop", threadID);
  }

  // تعيين الاسم وتفعيله
  await api.setTitle(name, threadID);
  lockedNames.set(threadID, name);

  api.sendMessage(`🔒 تم قفل اسم الغروب على:\n${name}`, threadID);
};
