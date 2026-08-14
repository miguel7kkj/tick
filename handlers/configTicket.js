const { ticketBuilders } = require("../utils/sessions");
const { renderBuilder } = require("../utils/ticketPanel");
const { getGuildData } = require("../database/db");

module.exports = async function configTicket(interaction) {
  const salvo = getGuildData("ticketconfig", interaction.guild.id, null);

  const sessao = {
    guildId: interaction.guild.id,
    tipo: salvo?.tipo || "botao",
    destino: salvo?.destino || "topico",
    cargos: salvo?.cargos ? [...salvo.cargos] : [],
    itens: salvo?.itens ? JSON.parse(JSON.stringify(salvo.itens)) : [],
    painelTitulo: salvo?.painelTitulo || "Central de Atendimento",
    painelDescricao: salvo?.painelDescricao || "Selecione abaixo o motivo do seu ticket.",
  };

  ticketBuilders.set(interaction.user.id, sessao);

  await interaction.reply({ ...renderBuilder(sessao), ephemeral: true });
};
