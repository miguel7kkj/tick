const { AuditLogEvent } = require("discord.js");
const { enviarLog } = require("../utils/logs");

module.exports = {
  name: "guildBanAdd",
  async execute(ban) {
    const guild = ban.guild;
    let executor = null;
    try {
      const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
      executor = logs.entries.first()?.executor;
    } catch {}

    enviarLog(guild, "bans", `🔨 **${ban.user.tag}** foi banido${executor ? ` por ${executor}` : ""}.`);
  },
};
