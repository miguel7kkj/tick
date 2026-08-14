const { pegarConfirmacao, removerConfirmacao } = require("../utils/sessions");
const { containerSucesso, containerErro, payload } = require("../utils/containers");
const { executarBan, executarKick, executarMute, executarWarn, removerWarn } = require("../utils/moderacao");

module.exports = async function moderationConfirm(interaction) {
  const [acao, id] = interaction.customId.split(":");
  const dados = pegarConfirmacao(id);

  if (!dados) {
    return interaction.update({ ...payload(containerErro("Essa confirmação expirou.")), components: [] });
  }

  if (interaction.user.id !== dados.autorId) {
    return interaction.reply({ ...payload(containerErro("Só quem executou o comando pode confirmar essa ação.")), ephemeral: true });
  }

  if (acao === "mod_cancel") {
    removerConfirmacao(id);
    return interaction.update({ ...payload(containerErro("Ação cancelada.")), components: [] });
  }

  removerConfirmacao(id);
  const guild = interaction.guild;

  try {
    if (dados.tipo === "ban") {
      await executarBan(guild, interaction.user, null, dados.alvoUser, dados.motivo);
      await interaction.update({ ...payload(containerSucesso(`**${dados.alvoUser.tag}** foi banido.`)), components: [] });
    } else if (dados.tipo === "kick") {
      const membro = await guild.members.fetch(dados.alvoUser.id);
      await executarKick(guild, interaction.user, membro, dados.motivo);
      await interaction.update({ ...payload(containerSucesso(`**${dados.alvoUser.tag}** foi expulso.`)), components: [] });
    } else if (dados.tipo === "mute") {
      const membro = await guild.members.fetch(dados.alvoUser.id);
      await executarMute(guild, interaction.user, membro, dados.duracaoMs, dados.motivo);
      await interaction.update({ ...payload(containerSucesso(`**${dados.alvoUser.tag}** foi silenciado.`)), components: [] });
    } else if (dados.tipo === "warn") {
      const warn = await executarWarn(guild, interaction.user, dados.alvoUser, dados.motivo);
      await interaction.update({ ...payload(containerSucesso(`**${dados.alvoUser.tag}** recebeu um warn. (ID: \`${warn.id}\`)`)), components: [] });
    } else if (dados.tipo === "warnremove") {
      const ok = removerWarn(guild, dados.alvoUser, dados.warnId);
      await interaction.update({
        ...payload(ok ? containerSucesso(`Warn \`${dados.warnId}\` removido de **${dados.alvoUser.tag}**.`) : containerErro("Warn não encontrado.")),
        components: [],
      });
    }
  } catch (erro) {
    console.error(erro);
    await interaction.update({ ...payload(containerErro("Não consegui aplicar essa punição. Verifique minhas permissões e a hierarquia de cargos.")), components: [] });
  }
};
