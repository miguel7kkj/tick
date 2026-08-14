const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { ContainerBuilder, TextDisplayBuilder, CORES } = require("./containers");
const { criarConfirmacao } = require("./sessions");

const TITULOS = {
  ban: "Confirmar banimento",
  kick: "Confirmar expulsão",
  mute: "Confirmar silenciamento",
  warn: "Confirmar advertência",
  warnremove: "Confirmar remoção de advertência",
};

function montarConfirmacao(dados) {
  const id = criarConfirmacao(dados);
  const titulo = TITULOS[dados.tipo] || "Confirmar ação";

  const container = new ContainerBuilder().setAccentColor(CORES.aviso);
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ${titulo}\n${dados.descricao}\n\nEssa ação só pode ser confirmada por quem executou o comando.`
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`mod_confirm:${id}`).setLabel("Confirmar").setStyle(ButtonStyle.Danger).setEmoji("✅"),
    new ButtonBuilder().setCustomId(`mod_cancel:${id}`).setLabel("Cancelar").setStyle(ButtonStyle.Secondary).setEmoji("✖️")
  );
  container.addActionRowComponents(row);

  return { components: [container], flags: MessageFlags.IsComponentsV2 };
}

module.exports = { montarConfirmacao };
