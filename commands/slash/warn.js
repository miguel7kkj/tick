const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { podePunir } = require("../../utils/permissions");
const { montarConfirmacao } = require("../../utils/confirmacao");
const { containerErro, containerInfo, payload } = require("../../utils/containers");
const { getGuildData } = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Sistema de advertências")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((sub) =>
      sub
        .setName("adicionar")
        .setDescription("Aplica uma advertência em um membro")
        .addUserOption((opt) => opt.setName("usuario").setDescription("Membro a ser advertido").setRequired(true))
        .addStringOption((opt) => opt.setName("motivo").setDescription("Motivo da advertência").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName("remover")
        .setDescription("Remove uma advertência de um membro")
        .addUserOption((opt) => opt.setName("usuario").setDescription("Membro alvo").setRequired(true))
        .addStringOption((opt) => opt.setName("id").setDescription("ID da advertência (veja em !historico ou nos logs)").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName("listar")
        .setDescription("Lista as advertências de um membro")
        .addUserOption((opt) => opt.setName("usuario").setDescription("Membro alvo").setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const alvoUser = interaction.options.getUser("usuario");

    if (sub === "listar") {
      const dados = getGuildData("warns", interaction.guild.id, {});
      const lista = dados[alvoUser.id] || [];
      if (lista.length === 0) {
        return interaction.reply({ ...payload(containerInfo(`**${alvoUser.tag}** não possui advertências.`)), ephemeral: true });
      }
      const texto = lista.map((w) => `\`${w.id}\` — ${w.motivo} (aplicado por <@${w.moderador}> em <t:${Math.floor(w.data / 1000)}:d>)`).join("\n");
      return interaction.reply({ ...payload(containerInfo(`**Advertências de ${alvoUser.tag}:**\n${texto}`)), ephemeral: true });
    }

    const alvoMember = await interaction.guild.members.fetch(alvoUser.id).catch(() => null);
    if (alvoMember) {
      const check = podePunir(interaction.guild, interaction.member, alvoMember);
      if (!check.ok) {
        return interaction.reply({ ...payload(containerErro(check.motivo)), ephemeral: true });
      }
    }

    if (sub === "adicionar") {
      const motivo = interaction.options.getString("motivo");
      const conteudo = montarConfirmacao({
        tipo: "warn",
        autorId: interaction.user.id,
        alvoUser,
        motivo,
        descricao: `Você está prestes a advertir **${alvoUser.tag}**.\nMotivo: ${motivo}`,
      });
      return interaction.reply(conteudo);
    }

    if (sub === "remover") {
      const warnId = interaction.options.getString("id").toUpperCase();
      const conteudo = montarConfirmacao({
        tipo: "warnremove",
        autorId: interaction.user.id,
        alvoUser,
        warnId,
        descricao: `Você está prestes a remover a advertência \`${warnId}\` de **${alvoUser.tag}**.`,
      });
      return interaction.reply(conteudo);
    }
  },
};
