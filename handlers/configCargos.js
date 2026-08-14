const { getGuildData, setGuildData } = require("../database/db");
const { containerSucesso, payload } = require("../utils/containers");

module.exports = async function configCargos(interaction) {
  const acao = interaction.options.getString("acao");
  const cargo = interaction.options.getRole("cargo");

  const dados = getGuildData("cargosconfig", interaction.guild.id, {
    historico: [],
    autorole: [],
  });

  let mensagem = "";

  if (acao === "add_historico") {
    if (!dados.historico.includes(cargo.id)) dados.historico.push(cargo.id);
    mensagem = `O cargo ${cargo} agora aparece no !historico dos membros.`;
  } else if (acao === "remove_historico") {
    dados.historico = dados.historico.filter((id) => id !== cargo.id);
    mensagem = `O cargo ${cargo} não vai mais aparecer no !historico.`;
  } else if (acao === "add_autorole") {
    if (!dados.autorole.includes(cargo.id)) dados.autorole.push(cargo.id);
    mensagem = `O cargo ${cargo} agora é dado automaticamente para quem entra no servidor.`;
  } else if (acao === "remove_autorole") {
    dados.autorole = dados.autorole.filter((id) => id !== cargo.id);
    mensagem = `O cargo ${cargo} não é mais dado automaticamente.`;
  }

  setGuildData("cargosconfig", interaction.guild.id, dados);
  await interaction.reply({ ...payload(containerSucesso(mensagem)), ephemeral: true });
};
