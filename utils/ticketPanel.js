const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { CORES } = require("./containers");

function renderBuilder(sessao) {
  const container = new ContainerBuilder().setAccentColor(CORES.info);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## Configuração de tickets\nMonte aqui o painel que os membros vão usar para abrir um ticket.`
    )
  );
  container.addSeparatorComponents(new SeparatorBuilder());

  const tipoTexto = sessao.tipo === "menu" ? "Menu de seleção" : "Botões";
  const destinoTexto = sessao.destino === "topico" ? "Tópico" : "Canal";

  const itensTexto =
    sessao.itens.length === 0
      ? "_nenhuma opção adicionada ainda_"
      : sessao.itens
          .map((i, idx) => `${idx + 1}. ${i.emoji ? i.emoji + " " : ""}${i.label}`)
          .join("\n");

  const cargosTexto =
    sessao.cargos.length === 0 ? "_nenhum cargo definido_" : sessao.cargos.map((c) => `<@&${c}>`).join(", ");

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Formato do painel:** ${tipoTexto}\n**Abertura vira:** ${destinoTexto}\n**Cargos que atendem:** ${cargosTexto}\n\n**Opções configuradas:**\n${itensTexto}`
    )
  );
  container.addSeparatorComponents(new SeparatorBuilder());

  const linha1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_cfg_add").setLabel("Adicionar opção").setStyle(ButtonStyle.Success).setEmoji("➕"),
    new ButtonBuilder()
      .setCustomId("ticket_cfg_remove")
      .setLabel("Remover opção")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("➖")
      .setDisabled(sessao.itens.length === 0)
  );

  const linha2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_cfg_tipo").setLabel(`Formato: ${tipoTexto}`).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("ticket_cfg_destino").setLabel(`Abertura: ${destinoTexto}`).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("ticket_cfg_cargos").setLabel("Cargos de atendimento").setStyle(ButtonStyle.Secondary)
  );

  const linha3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_cfg_painel").setLabel("Texto do painel").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("ticket_cfg_publicar")
      .setLabel("Publicar painel")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📨")
      .setDisabled(sessao.itens.length === 0)
  );

  container.addActionRowComponents(linha1, linha2, linha3);

  return { components: [container], flags: MessageFlags.IsComponentsV2 };
}

module.exports = { renderBuilder };
