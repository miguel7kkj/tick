const { containerSucesso, containerErro, payload } = require("../../utils/containers");

module.exports = {
  name: "sync",
  async execute(mensagem, args, client) {
    if (mensagem.author.id !== mensagem.guild.ownerId) {
      return mensagem.reply(payload(containerErro("Apenas o dono do servidor pode sincronizar os comandos.")));
    }

    const comandos = [...client.slashCommands.values()].map((c) => c.data.toJSON());

    try {
      await mensagem.guild.commands.set(comandos);
      await mensagem.reply(payload(containerSucesso(`${comandos.length} comandos sincronizados neste servidor.`)));
    } catch (erro) {
      console.error(erro);
      await mensagem.reply(payload(containerErro("Não consegui sincronizar os comandos.")));
    }
  },
};
