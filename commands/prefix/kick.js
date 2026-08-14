const { PermissionFlagsBits } = require("discord.js");
const { podePunir, temPermissao } = require("../../utils/permissions");
const { montarConfirmacao } = require("../../utils/confirmacao");
const { containerErro, payload } = require("../../utils/containers");

module.exports = {
  name: "kick",
  async execute(mensagem, args) {
    if (!temPermissao(mensagem.member, PermissionFlagsBits.KickMembers)) {
      return mensagem.reply(payload(containerErro("Você não tem permissão para expulsar membros.")));
    }

    const alvoMember = mensagem.mentions.members.first();
    if (!alvoMember) {
      return mensagem.reply(payload(containerErro("Marque o membro que deseja expulsar. Ex: `!kick @membro motivo`")));
    }

    const check = podePunir(mensagem.guild, mensagem.member, alvoMember);
    if (!check.ok) {
      return mensagem.reply(payload(containerErro(check.motivo)));
    }

    const motivo = args.slice(1).join(" ") || "Não especificado";
    const conteudo = montarConfirmacao({
      tipo: "kick",
      autorId: mensagem.author.id,
      alvoUser: alvoMember.user,
      motivo,
      descricao: `Você está prestes a expulsar **${alvoMember.user.tag}**.\nMotivo: ${motivo}`,
    });

    await mensagem.reply(conteudo);
  },
};
