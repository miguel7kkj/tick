module.exports = {
  name: "messageCreate",
  async execute(mensagem, client) {
    if (mensagem.author.bot || !mensagem.guild) return;
    if (!mensagem.content.startsWith(client.PREFIX)) return;

    const args = mensagem.content.slice(client.PREFIX.length).trim().split(/ +/);
    const nomeComando = args.shift().toLowerCase();

    const comando = client.prefixCommands.get(nomeComando);
    if (!comando) return;

    try {
      await comando.execute(mensagem, args, client);
    } catch (erro) {
      console.error(erro);
      mensagem.reply("Ocorreu um erro ao executar esse comando.").catch(() => {});
    }
  },
};
