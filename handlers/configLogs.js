const { getGuildData, setGuildData } = require("../database/db");
const { containerSucesso, payload } = require("../utils/containers");

const DESCRICOES = {
  cargos: "avisa sempre que um cargo for criado, apagado, editado ou quando alguém receber/perder um cargo.",
  fotos: "avisa quando alguém apagar uma imagem enviada no servidor ou trocar o ícone/banner do servidor.",
  mensagens: "avisa quem editou ou apagou uma mensagem, mostrando o conteúdo antes e depois.",
  bans: "avisa sempre que alguém for banido ou desbanido, com o motivo e quem aplicou.",
  warns: "avisa sempre que alguém receber ou perder uma advertência.",
  mute: "avisa sempre que alguém for silenciado ou tiver o silenciamento removido.",
  kick: "avisa sempre que alguém for expulso do servidor.",
  ticket: "avisa quando um ticket for aberto, atendido e fechado.",
  call: "avisa quando uma call temporária for criada ou deletada.",
  canais: "avisa quando um canal for criado, apagado ou renomeado.",
};

module.exports = async function configLogs(interaction) {
  const tipo = interaction.options.getString("tipo");
  const canal = interaction.options.getChannel("canal");

  const dados = getGuildData("logsconfig", interaction.guild.id, {});
  dados[tipo] = canal ? canal.id : null;
  setGuildData("logsconfig", interaction.guild.id, dados);

  const texto = canal
    ? `O log de **${tipo}** agora vai para ${canal}.\n\n${DESCRICOES[tipo] ? "O que esse log faz: " + DESCRICOES[tipo] : ""}`
    : `O log de **${tipo}** foi desativado.`;

  await interaction.reply({ ...payload(containerSucesso(texto)), ephemeral: true });
};
