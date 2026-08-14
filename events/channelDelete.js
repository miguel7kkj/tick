const { enviarLog } = require("../utils/logs");

module.exports = {
  name: "channelDelete",
  async execute(canal) {
    if (!canal.guild) return;
    enviarLog(canal.guild, "canais", `📁 Canal apagado: **${canal.name}**`);
  },
};
