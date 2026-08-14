const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { containerBuilders } = require("../../utils/sessions");
const { renderBuilderMenu } = require("../../utils/containerBuilderUI");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("container")
    .setDescription("Sistema de criação de containers personalizados")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((sub) => sub.setName("criar").setDescription("Abre o construtor de containers")),

  async execute(interaction) {
    const sessao = {
      guildId: interaction.guild.id,
      containers: [],
      webhookNome: null,
      webhookAvatar: null,
    };
    containerBuilders.set(interaction.user.id, sessao);

    await interaction.reply({ ...renderBuilderMenu(sessao), ephemeral: true });
  },
};
