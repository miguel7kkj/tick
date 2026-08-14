const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  MessageFlags,
} = require("discord.js");
const { containerBuilders, getGuildData: _unused } = require("../utils/sessions");
const { renderBuilderMenu, renderPreview } = require("../utils/containerBuilderUI");
const { containerSucesso, containerErro, payload } = require("../utils/containers");
const { getGuildData, setGuildData } = require("../database/db");

async function handleContainerButton(interaction) {
  const sessao = containerBuilders.get(interaction.user.id);
  if (!sessao) {
    return interaction.reply({ ...payload(containerErro("Essa sessão expirou, use `/container criar` novamente.")), ephemeral: true });
  }

  const id = interaction.customId;

  if (id === "cb_novo") {
    const modal = new ModalBuilder().setCustomId("cb_modal_novo").setTitle("Novo container");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("texto").setLabel("Texto do container").setStyle(TextInputStyle.Paragraph).setMaxLength(3500).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("cor")
          .setLabel("Cor em hexadecimal (opcional, ex: FF5733)")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setMaxLength(7)
      )
    );
    return interaction.showModal(modal);
  }

  if (id === "cb_botao") {
    const modal = new ModalBuilder().setCustomId("cb_modal_botao").setTitle("Botão com link");
    modal.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("label").setLabel("Texto do botão").setStyle(TextInputStyle.Short).setMaxLength(80).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("url").setLabel("Link (https://...)").setStyle(TextInputStyle.Short).setRequired(true))
    );
    return interaction.showModal(modal);
  }

  if (id === "cb_remover") {
    sessao.containers.pop();
    return interaction.update(renderBuilderMenu(sessao));
  }

  if (id === "cb_webhook") {
    const modal = new ModalBuilder().setCustomId("cb_modal_webhook").setTitle("Configurar webhook");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("nome").setLabel("Nome do webhook").setStyle(TextInputStyle.Short).setRequired(false).setValue(sessao.webhookNome || "")
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("avatar")
          .setLabel("URL da imagem (deixe vazio p/ usar a do servidor)")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setValue(sessao.webhookAvatar || "")
      )
    );
    return interaction.showModal(modal);
  }

  if (id === "cb_salvar") {
    const modal = new ModalBuilder().setCustomId("cb_modal_salvar").setTitle("Salvar template");
    modal.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("nome").setLabel("Nome do template").setStyle(TextInputStyle.Short).setRequired(true))
    );
    return interaction.showModal(modal);
  }

  if (id === "cb_enviar") {
    const select = new ChannelSelectMenuBuilder().setCustomId("cb_channelselect").setPlaceholder("Selecione o canal de envio").addChannelTypes(ChannelType.GuildText);
    return interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], ephemeral: true });
  }
}

async function handleContainerModal(interaction) {
  const sessao = containerBuilders.get(interaction.user.id);
  if (!sessao) {
    return interaction.reply({ ...payload(containerErro("Essa sessão expirou, use `/container criar` novamente.")), ephemeral: true });
  }

  if (interaction.customId === "cb_modal_novo") {
    const texto = interaction.fields.getTextInputValue("texto");
    const cor = interaction.fields.getTextInputValue("cor");
    sessao.containers.push({ texto, cor: cor || null, botoes: [] });
    return interaction.reply({ ...renderBuilderMenu(sessao), ephemeral: true });
  }

  if (interaction.customId === "cb_modal_botao") {
    const label = interaction.fields.getTextInputValue("label");
    const url = interaction.fields.getTextInputValue("url");
    const ultimo = sessao.containers[sessao.containers.length - 1];
    ultimo.botoes.push({ label, url });
    return interaction.reply({ ...renderBuilderMenu(sessao), ephemeral: true });
  }

  if (interaction.customId === "cb_modal_webhook") {
    sessao.webhookNome = interaction.fields.getTextInputValue("nome") || null;
    sessao.webhookAvatar = interaction.fields.getTextInputValue("avatar") || null;
    return interaction.reply({ ...payload(containerSucesso("Webhook configurado.")), ephemeral: true });
  }

  if (interaction.customId === "cb_modal_salvar") {
    const nome = interaction.fields.getTextInputValue("nome");
    const templates = getGuildData("containertemplates", interaction.guild.id, {});
    templates[nome] = {
      containers: sessao.containers,
      webhookNome: sessao.webhookNome,
      webhookAvatar: sessao.webhookAvatar,
    };
    setGuildData("containertemplates", interaction.guild.id, templates);
    return interaction.reply({ ...payload(containerSucesso(`Template **${nome}** salvo!`)), ephemeral: true });
  }
}

async function handleContainerSelect(interaction) {
  const sessao = containerBuilders.get(interaction.user.id);
  if (!sessao) {
    return interaction.reply({ ...payload(containerErro("Essa sessão expirou, use `/container criar` novamente.")), ephemeral: true });
  }

  if (interaction.customId === "cb_channelselect") {
    const canal = interaction.channels.first();

    let webhook;
    try {
      const webhooks = await canal.fetchWebhooks();
      webhook = webhooks.find((w) => w.owner?.id === interaction.client.user.id);
      if (!webhook) {
        webhook = await canal.createWebhook({
          name: sessao.webhookNome || interaction.guild.name,
          avatar: sessao.webhookAvatar || interaction.guild.iconURL({ extension: "png" }) || undefined,
        });
      } else if (sessao.webhookNome || sessao.webhookAvatar) {
        await webhook.edit({
          name: sessao.webhookNome || webhook.name,
          avatar: sessao.webhookAvatar || undefined,
        });
      }

      await webhook.send({
        components: renderPreview(sessao),
        flags: MessageFlags.IsComponentsV2,
      });

      await interaction.update({ ...payload(containerSucesso(`Enviado em ${canal}!`)), components: [] });
    } catch (erro) {
      console.error(erro);
      await interaction.update({ ...payload(containerErro("Não consegui enviar. Verifique se tenho permissão de Gerenciar Webhooks nesse canal.")), components: [] });
    }
  }
}

module.exports = { handleContainerButton, handleContainerModal, handleContainerSelect };
