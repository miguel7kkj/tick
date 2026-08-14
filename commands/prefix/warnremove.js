const { PermissionFlagsBits } = require("discord.js");
const { temPermissao } = require("../../utils/permissions");
const { montarConfirmacao } = require("../../utils/confirmacao");
const { containerErro, payload } = require("../../utils/containers");

module.exports = {
  name: "warnremove",
  async execute(mensagem, args) {
    if (!temPermissao(mensagem.member, PermissionFlagsBits.ModerateMembers)) {
      return mensagem.reply(payload(containerErro("Você não tem permissão para remover advertências.")));
    }

    const alvoMember = mensagem.mentions.members.first();
    const warnId = args[1];

    if (!alvoMember || !warnId) {
      return mensagem.reply(payload(containerErro("Uso: `!warnremove @membro ID`")));
    }

    const conteudo = montarConfirmacao({
      tipo: "warnremove",
      autorId: mensagem.author.id,
      alvoUser: alvoMember.user,
      warnId: warnId.toUpperCase(),
      descricao: `Você está prestes a remover a advertência \`${warnId.toUpperCase()}\` de **${alvoMember.user.tag}**.`,
    });

    await mensagem.reply(conteudo);
  },
};
