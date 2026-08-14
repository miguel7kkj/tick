const { enviarLog } = require("../utils/logs");

module.exports = {
  name: "channelCreate",
  async execute(canal) {
    if (!canal.guild) return;
    enviarLog(canal.guild, "canais", `📁 Canal criado: **${canal.name}**`);
  },
};
