const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const { ticketBuilders } = require("../utils/sessions");
const { renderBuilder } = require("../utils/ticketPanel");
const { getGuildData, setGuildData } = require("../database/db");
const { containerSucesso, containerErro, containerInfo, payload, ContainerBuilder, TextDisplayBuilder, CORES } = require("../utils/containers");
const { enviarLog } = require("../utils/logs");

async function handleTicketBuilderButton(interaction) {
  const sessao = ticketBuilders.get(interaction.user.id);
  if (!sessao) {
    return interaction.reply({ ...payload(containerErro("Essa configuração expirou, use `/configurar ticket` novamente.")), ephemeral: true });
  }

  const id = interaction.customId;

  if (id === "ticket_cfg_add") {
    const modal = new ModalBuilder().setCustomId("ticket_cfg_modal_add").setTitle("Nova opção de ticket");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("label").setLabel("Nome do botão/opção").setStyle(TextInputStyle.Short).setMaxLength(80).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("emoji").setLabel("Emoji (opcional)").setStyle(TextInputStyle.Short).setMaxLength(10).setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("titulo").setLabel("Título do ticket aberto").setStyle(TextInputStyle.Short).setMaxLength(100).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("texto").setLabel("Mensagem de abertura do ticket").setStyle(TextInputStyle.Paragraph).setMaxLength(1000).setRequired(true)
      )
    );
    return interaction.showModal(modal);
  }

  if (id === "ticket_cfg_remove") {
    const select = new StringSelectMenuBuilder()
      .setCustomId("ticket_cfg_remove_select")
      .setPlaceholder("Selecione a opção que deseja remover")
      .setMinValues(1)
      .setMaxValues(sessao.itens.length)
      .addOptions(sessao.itens.map((item, idx) => ({ label: item.label, value: String(idx), emoji: item.emoji || undefined })));
    return interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], ephemeral: true });
  }

  if (id === "ticket_cfg_tipo") {
    sessao.tipo = sessao.tipo === "menu" ? "botao" : "menu";
    return interaction.update(renderBuilder(sessao));
  }

  if (id === "ticket_cfg_destino") {
    sessao.destino = sessao.destino === "topico" ? "canal" : "topico";
    return interaction.update(renderBuilder(sessao));
  }

  if (id === "ticket_cfg_cargos") {
    const select = new RoleSelectMenuBuilder()
      .setCustomId("ticket_cfg_roleselect")
      .setPlaceholder("Selecione os cargos que atendem tickets")
      .setMinValues(0)
      .setMaxValues(10);
    return interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], ephemeral: true });
  }

  if (id === "ticket_cfg_painel") {
    const modal = new ModalBuilder().setCustomId("ticket_cfg_modal_painel").setTitle("Texto do painel");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("titulo").setLabel("Título do painel").setStyle(TextInputStyle.Short).setValue(sessao.painelTitulo).setMaxLength(100).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("descricao").setLabel("Descrição do painel").setStyle(TextInputStyle.Paragraph).setValue(sessao.painelDescricao).setMaxLength(1000).setRequired(true)
      )
    );
    return interaction.showModal(modal);
  }

  if (id === "ticket_cfg_publicar") {
    const select = new ChannelSelectMenuBuilder()
      .setCustomId("ticket_cfg_channelselect")
      .setPlaceholder("Selecione o canal para enviar o painel")
      .addChannelTypes(ChannelType.GuildText);
    return interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], ephemeral: true });
  }
}

async function handleTicketBuilderSelect(interaction) {
  const sessao = ticketBuilders.get(interaction.user.id);
  if (!sessao) {
    return interaction.reply({ ...payload(containerErro("Essa configuração expirou, use `/configurar ticket` novamente.")), ephemeral: true });
  }

  if (interaction.customId === "ticket_cfg_remove_select") {
    const indices = interaction.values.map(Number).sort((a, b) => b - a);
    for (const idx of indices) sessao.itens.splice(idx, 1);
    await interaction.update({ ...payload(containerSucesso("Opção(ões) removida(s).")), components: [] });
    return;
  }

  if (interaction.customId === "ticket_cfg_roleselect") {
    sessao.cargos = interaction.values;
    await interaction.update({ ...payload(containerSucesso("Cargos de atendimento atualizados.")), components: [] });
    return;
  }

  if (interaction.customId === "ticket_cfg_channelselect") {
    const canal = interaction.channels.first();
    setGuildData("ticketconfig", interaction.guild.id, {
      tipo: sessao.tipo,
      destino: sessao.destino,
      cargos: sessao.cargos,
      itens: sessao.itens,
      painelTitulo: sessao.painelTitulo,
      painelDescricao: sessao.painelDescricao,
      canalPainel: canal.id,
    });

    await publicarPainel(canal, sessao);
    await interaction.update({ ...payload(containerSucesso(`Painel publicado em ${canal}!`)), components: [] });
    return;
  }
}

async function handleTicketBuilderModal(interaction) {
  const sessao = ticketBuilders.get(interaction.user.id);
  if (!sessao) {
    return interaction.reply({ ...payload(containerErro("Essa configuração expirou, use `/configurar ticket` novamente.")), ephemeral: true });
  }

  if (interaction.customId === "ticket_cfg_modal_add") {
    sessao.itens.push({
      label: interaction.fields.getTextInputValue("label"),
      emoji: interaction.fields.getTextInputValue("emoji") || null,
      titulo: interaction.fields.getTextInputValue("titulo"),
      texto: interaction.fields.getTextInputValue("texto"),
    });
    return interaction.reply({ ...payload(containerSucesso("Opção adicionada! Volte para o painel de configuração para ver.")), ephemeral: true });
  }

  if (interaction.customId === "ticket_cfg_modal_painel") {
    sessao.painelTitulo = interaction.fields.getTextInputValue("titulo");
    sessao.painelDescricao = interaction.fields.getTextInputValue("descricao");
    return interaction.reply({ ...payload(containerSucesso("Texto do painel atualizado.")), ephemeral: true });
  }
}

async function publicarPainel(canal, config) {
  const container = new ContainerBuilder().setAccentColor(CORES.info);
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${config.painelTitulo}\n${config.painelDescricao}`)
  );

  let row;
  if (config.tipo === "menu") {
    const select = new StringSelectMenuBuilder()
      .setCustomId("ticket_open_select")
      .setPlaceholder("Selecione o motivo do ticket")
      .addOptions(
        config.itens.map((item, idx) => ({
          label: item.label,
          value: String(idx),
          emoji: item.emoji || undefined,
        }))
      );
    row = new ActionRowBuilder().addComponents(select);
  } else {
    const botoes = config.itens.slice(0, 5).map((item, idx) =>
      new ButtonBuilder()
        .setCustomId(`ticket_open_btn_${idx}`)
        .setLabel(item.label)
        .setStyle(ButtonStyle.Primary)
        .setEmoji(item.emoji || undefined)
    );
    row = new ActionRowBuilder().addComponents(botoes);
  }

  container.addActionRowComponents(row);
  const { MessageFlags } = require("discord.js");
  await canal.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function abrirTicket(interaction, indice) {
  const config = getGuildData("ticketconfig", interaction.guild.id, null);
  if (!config || !config.itens[indice]) {
    return interaction.reply({ ...payload(containerErro("Esse painel não está mais configurado corretamente.")), ephemeral: true });
  }
  const item = config.itens[indice];
  const guild = interaction.guild;

  await interaction.deferReply({ ephemeral: true });

  if (config.destino === "topico") {
    const thread = await interaction.channel.threads.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.PrivateThread,
      reason: `Ticket aberto por ${interaction.user.tag}`,
    });
    await thread.members.add(interaction.user.id);

    const mencoes = config.cargos.map((c) => `<@&${c}>`).join(" ");
    await thread.send({
      content: mencoes || undefined,
      ...payload(criarContainerTicket(item, interaction.user)),
    });

    await interaction.editReply({ ...payload(containerSucesso(`Seu ticket foi criado: ${thread}`)) });
    enviarLog(guild, "ticket", `🎫 Ticket aberto por ${interaction.user} em ${thread} (motivo: ${item.label})`);
  } else {
    let categoria = guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name === "Tickets");
    if (!categoria) {
      categoria = await guild.channels.create({ name: "Tickets", type: ChannelType.GuildCategory });
    }

    const overwrites = [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: guild.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    ];
    for (const cargoId of config.cargos) {
      overwrites.push({ id: cargoId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
    }

    const canal = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: categoria.id,
      permissionOverwrites: overwrites,
    });

    const mencoes = config.cargos.map((c) => `<@&${c}>`).join(" ");
    await canal.send({
      content: mencoes || undefined,
      ...payload(criarContainerTicket(item, interaction.user)),
    });

    await interaction.editReply({ ...payload(containerSucesso(`Seu ticket foi criado: ${canal}`)) });
    enviarLog(guild, "ticket", `🎫 Ticket aberto por ${interaction.user} em ${canal} (motivo: ${item.label})`);
  }
}

function criarContainerTicket(item, autor) {
  const { ContainerBuilder, TextDisplayBuilder, CORES } = require("../utils/containers");
  const container = new ContainerBuilder().setAccentColor(CORES.info);
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${item.titulo}\n${item.texto}\n\nAberto por: ${autor}`)
  );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_close").setLabel("Fechar ticket").setStyle(ButtonStyle.Danger).setEmoji("🔒")
  );
  container.addActionRowComponents(row);
  return container;
}

async function fecharTicket(interaction) {
  if (!interaction.channel.name?.startsWith("ticket-")) {
    return interaction.reply({ ...payload(containerErro("Esse botão só funciona dentro de um ticket.")), ephemeral: true });
  }
  await interaction.reply({ ...payload(containerInfo("Fechando o ticket em 5 segundos...")) });
  const canal = interaction.channel;
  enviarLog(interaction.guild, "ticket", `🔒 Ticket ${canal.name} fechado por ${interaction.user}`);
  setTimeout(async () => {
    try {
      if (canal.isThread()) await canal.setArchived(true);
      else await canal.delete("Ticket fechado");
    } catch {}
  }, 5000);
}

module.exports = {
  handleTicketBuilderButton,
  handleTicketBuilderSelect,
  handleTicketBuilderModal,
  abrirTicket,
  fecharTicket,
};
