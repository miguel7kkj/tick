const { enviarLog } = require("../utils/logs");

module.exports = {
  name: "messageUpdate",
  async execute(antiga, nova) {
    if (!nova.guild || nova.author?.bot) return;
    if (antiga.content === nova.content) return;

    enviarLog(
      nova.guild,
      "mensagens",
      `✏️ ${nova.author} editou uma mensagem em ${nova.channel}.\n**Antes:** ${antiga.content?.slice(0, 400) || "_vazio_"}\n**Depois:** ${nova.content?.slice(0, 400) || "_vazio_"}`
    );
  },
};
