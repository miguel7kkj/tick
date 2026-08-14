const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { podePunir } = require("../../utils/permissions");
const { montarConfirmacao } = require("../../utils/confirmacao");
const { containerErro, payload } = require("../../utils/containers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bane um membro do servidor")
    .addUserOption((opt) => opt.setName("usuario").setDescription("Membro a ser banido").setRequired(true))
    .addStringOption((opt) => opt.setName("motivo").setDescription("Motivo do banimento").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const alvoUser = interaction.options.getUser("usuario");
    const motivo = interaction.options.getString("motivo") || "Não especificado";
    const alvoMember = await interaction.guild.members.fetch(alvoUser.id).catch(() => null);

    if (alvoMember) {
      const check = podePunir(interaction.guild, interaction.member, alvoMember);
      if (!check.ok) {
        return interaction.reply({ ...payload(containerErro(check.motivo)), ephemeral: true });
      }
    }

    const conteudo = montarConfirmacao({
      tipo: "ban",
      autorId: interaction.user.id,
      alvoUser,
      motivo,
      descricao: `Você está prestes a banir **${alvoUser.tag}**.\nMotivo: ${motivo}`,
    });

    await interaction.reply(conteudo);
  },
};
