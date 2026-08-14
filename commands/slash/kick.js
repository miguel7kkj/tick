const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { podePunir } = require("../../utils/permissions");
const { montarConfirmacao } = require("../../utils/confirmacao");
const { containerErro, payload } = require("../../utils/containers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa um membro do servidor")
    .addUserOption((opt) => opt.setName("usuario").setDescription("Membro a ser expulso").setRequired(true))
    .addStringOption((opt) => opt.setName("motivo").setDescription("Motivo da expulsão").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const alvoUser = interaction.options.getUser("usuario");
    const motivo = interaction.options.getString("motivo") || "Não especificado";
    const alvoMember = await interaction.guild.members.fetch(alvoUser.id).catch(() => null);

    if (!alvoMember) {
      return interaction.reply({ ...payload(containerErro("Esse usuário não está no servidor.")), ephemeral: true });
    }

    const check = podePunir(interaction.guild, interaction.member, alvoMember);
    if (!check.ok) {
      return interaction.reply({ ...payload(containerErro(check.motivo)), ephemeral: true });
    }

    const conteudo = montarConfirmacao({
      tipo: "kick",
      autorId: interaction.user.id,
      alvoUser,
      motivo,
      descricao: `Você está prestes a expulsar **${alvoUser.tag}**.\nMotivo: ${motivo}`,
    });

    await interaction.reply(conteudo);
  },
};
