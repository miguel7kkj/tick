const { ActivityType } = require("discord.js");

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    console.log(`Tick está online como ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: "a comunidade", type: ActivityType.Watching }],
      status: "online",
    });
  },
};
