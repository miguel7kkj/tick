const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, CORES } = require("./containers");

function renderPreview(sessao) {
  if (sessao.containers.length === 0) {
    return [new ContainerBuilder().setAccentColor(CORES.padrao).addTextDisplayComponents(new TextDisplayBuilder().setContent("_nenhum container adicionado ainda_"))];
  }

  return sessao.containers.map((c) => {
    const container = new ContainerBuilder();
    if (c.cor) container.setAccentColor(parseInt(c.cor.replace("#", ""), 16));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(c.texto || "_sem texto_"));
    if (c.botoes.length > 0) {
      const row = new ActionRowBuilder().addComponents(
        c.botoes.map((b) => new ButtonBuilder().setLabel(b.label).setStyle(ButtonStyle.Link).setURL(b.url))
      );
      container.addActionRowComponents(row);
    }
    return container;
  });
}

function renderBuilderMenu(sessao) {
  const preview = renderPreview(sessao);

  const painel = new ContainerBuilder().setAccentColor(CORES.info);
  painel.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## Montagem de container\nWebhook: **${sessao.webhookNome || "(usa o nome do servidor)"}**\nContainers montados: **${sessao.containers.length}**`
    )
  );
  painel.addSeparatorComponents(new SeparatorBuilder());

  const linha1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("cb_novo").setLabel("Novo container").setStyle(ButtonStyle.Success).setEmoji("➕"),
    new ButtonBuilder().setCustomId("cb_botao").setLabel("Add botão com link").setStyle(ButtonStyle.Primary).setEmoji("🔗").setDisabled(sessao.containers.length === 0),
    new ButtonBuilder().setCustomId("cb_remover").setLabel("Remover último").setStyle(ButtonStyle.Danger).setEmoji("🗑️").setDisabled(sessao.containers.length === 0)
  );

  const linha2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("cb_webhook").setLabel("Configurar webhook").setStyle(ButtonStyle.Secondary).setEmoji("🪝"),
    new ButtonBuilder().setCustomId("cb_salvar").setLabel("Salvar template").setStyle(ButtonStyle.Secondary).setEmoji("💾").setDisabled(sessao.containers.length === 0),
    new ButtonBuilder().setCustomId("cb_enviar").setLabel("Enviar").setStyle(ButtonStyle.Primary).setEmoji("📨").setDisabled(sessao.containers.length === 0)
  );

  painel.addActionRowComponents(linha1, linha2);

  return {
    components: [...preview, painel],
    flags: MessageFlags.IsComponentsV2,
  };
}

module.exports = { renderPreview, renderBuilderMenu };
