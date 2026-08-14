const { PermissionFlagsBits } = require("discord.js");
const { podePunir, temPermissao } = require("../../utils/permissions");
const { montarConfirmacao } = require("../../utils/confirmacao");
const { containerErro, payload } = require("../../utils/containers");
const { parseDuracao } = require("../../utils/tempo");

module.exports = {
  name: "mute",
  async execute(mensagem, args) {
    if (!temPermissao(mensagem.member, PermissionFlagsBits.ModerateMembers)) {
      return mensagem.reply(payload(containerErro("Você não tem permissão para silenciar membros.")));
    }

    const alvoMember = mensagem.mentions.members.first();
    if (!alvoMember) {
      return mensagem.reply(payload(containerErro("Uso: `!mute @membro 10m motivo`")));
    }

    const duracaoTexto = args[1];
    const duracaoMs = duracaoTexto ? parseDuracao(duracaoTexto) : null;
    if (!duracaoMs) {
      return mensagem.reply(payload(containerErro("Duração inválida. Use algo como `10m`, `1h` ou `1d`.")));
    }

    const check = podePunir(mensagem.guild, mensagem.member, alvoMember);
    if (!check.ok) {
      return mensagem.reply(payload(containerErro(check.motivo)));
    }

    const motivo = args.slice(2).join(" ") || "Não especificado";
    const conteudo = montarConfirmacao({
      tipo: "mute",
      autorId: mensagem.author.id,
      alvoUser: alvoMember.user,
      motivo,
      duracaoMs,
      descricao: `Você está prestes a silenciar **${alvoMember.user.tag}** por ${duracaoTexto}.\nMotivo: ${motivo}`,
    });

    await mensagem.reply(conteudo);
  },
};
