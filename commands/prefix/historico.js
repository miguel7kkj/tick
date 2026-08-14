const { getGuildData } = require("../../database/db");
const { containerInfo, payload } = require("../../utils/containers");

module.exports = {
  name: "historico",
  async execute(mensagem, args) {
    const alvo = mensagem.mentions.members.first() || mensagem.member;
    const dados = getGuildData("historico", mensagem.guild.id, {});
    const lista = dados[alvo.id] || [];

    if (lista.length === 0) {
      return mensagem.reply(payload(containerInfo(`${alvo} ainda não tem nenhum registro de cargo no histórico.`)));
    }

    const texto = lista
      .slice()
      .reverse()
      .slice(0, 25)
      .map((r) => `${r.acao === "add" ? "➕" : "➖"} <@&${r.cargoId}> — <t:${Math.floor(r.data / 1000)}:d> às <t:${Math.floor(r.data / 1000)}:t>`)
      .join("\n");

    await mensagem.reply(payload(containerInfo(`## Histórico de cargos de ${alvo.user.tag}\n${texto}`)));
  },
};
