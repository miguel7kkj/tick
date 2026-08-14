const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { podePunir } = require("../../utils/permissions");
const { montarConfirmacao } = require("../../utils/confirmacao");
const { containerErro, payload } = require("../../utils/containers");
const { parseDuracao } = require("../../utils/tempo");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Silencia um membro por um tempo determinado")
    .addUserOption((opt) => opt.setName("usuario").setDescription("Membro a ser silenciado").setRequired(true))
    .addStringOption((opt) => opt.setName("duracao").setDescription("Ex: 10m, 1h, 1d (máx 28d)").setRequired(true))
    .addStringOption((opt) => opt.setName("motivo").setDescription("Motivo do silenciamento").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const alvoUser = interaction.options.getUser("usuario");
    const motivo = interaction.options.getString("motivo") || "Não especificado";
    const duracaoTexto = interaction.options.getString("duracao");
    const duracaoMs = parseDuracao(duracaoTexto);

    if (!duracaoMs) {
      return interaction.reply({ ...payload(containerErro("Duração inválida. Use algo como `10m`, `1h` ou `1d`.")), ephemeral: true });
    }

    const alvoMember = await interaction.guild.members.fetch(alvoUser.id).catch(() => null);
    if (!alvoMember) {
      return interaction.reply({ ...payload(containerErro("Esse usuário não está no servidor.")), ephemeral: true });
    }

    const check = podePunir(interaction.guild, interaction.member, alvoMember);
    if (!check.ok) {
      return interaction.reply({ ...payload(containerErro(check.motivo)), ephemeral: true });
    }

    const conteudo = montarConfirmacao({
      tipo: "mute",
      autorId: interaction.user.id,
      alvoUser,
      motivo,
      duracaoMs,
      descricao: `Você está prestes a silenciar **${alvoUser.tag}** por ${duracaoTexto}.\nMotivo: ${motivo}`,
    });

    await interaction.reply(conteudo);
  },
};
