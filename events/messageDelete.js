const { enviarLog } = require("../utils/logs");

module.exports = {
  name: "messageDelete",
  async execute(mensagem) {
    if (!mensagem.guild || mensagem.author?.bot) return;

    const temImagem = mensagem.attachments?.some((a) => a.contentType?.startsWith("image/"));

    if (temImagem) {
      enviarLog(
        mensagem.guild,
        "fotos",
        `🖼️ Uma imagem enviada por ${mensagem.author} em ${mensagem.channel} foi apagada.`
      );
    }

    if (mensagem.content) {
      enviarLog(
        mensagem.guild,
        "mensagens",
        `🗑️ Mensagem de ${mensagem.author} apagada em ${mensagem.channel}:\n> ${mensagem.content.slice(0, 500)}`
      );
    }
  },
};
