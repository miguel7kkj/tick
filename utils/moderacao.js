const { getGuildData, setGuildData } = require("../database/db");
const { enviarLog } = require("./logs");

function gerarWarnId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function executarBan(guild, moderador, alvoMember, alvoUser, motivo) {
  await guild.members.ban(alvoUser.id, { reason: `${motivo} | Aplicado por ${moderador.tag}` });
  enviarLog(guild, "bans", `🔨 **${alvoUser.tag}** foi banido por ${moderador}.\nMotivo: ${motivo}`);
}

async function executarKick(guild, moderador, alvoMember, motivo) {
  await alvoMember.kick(`${motivo} | Aplicado por ${moderador.tag}`);
  enviarLog(guild, "kick", `👢 **${alvoMember.user.tag}** foi expulso por ${moderador}.\nMotivo: ${motivo}`);
}

async function executarMute(guild, moderador, alvoMember, duracaoMs, motivo) {
  await alvoMember.timeout(duracaoMs, `${motivo} | Aplicado por ${moderador.tag}`);
  enviarLog(
    guild,
    "mute",
    `🔇 **${alvoMember.user.tag}** foi silenciado por ${moderador}.\nDuração: ${Math.round(duracaoMs / 60000)} minuto(s)\nMotivo: ${motivo}`
  );
}

async function executarWarn(guild, moderador, alvoUser, motivo) {
  const dados = getGuildData("warns", guild.id, {});
  if (!dados[alvoUser.id]) dados[alvoUser.id] = [];
  const warn = { id: gerarWarnId(), motivo, moderador: moderador.id, data: Date.now() };
  dados[alvoUser.id].push(warn);
  setGuildData("warns", guild.id, dados);
  enviarLog(guild, "warns", `⚠️ **${alvoUser.tag}** recebeu um warn de ${moderador}.\nID: \`${warn.id}\`\nMotivo: ${motivo}`);
  return warn;
}

function removerWarn(guild, alvoUser, warnId) {
  const dados = getGuildData("warns", guild.id, {});
  const lista = dados[alvoUser.id] || [];
  const antes = lista.length;
  dados[alvoUser.id] = lista.filter((w) => w.id !== warnId);
  setGuildData("warns", guild.id, dados);
  return antes !== dados[alvoUser.id].length;
}

module.exports = {
  gerarWarnId,
  executarBan,
  executarKick,
  executarMute,
  executarWarn,
  removerWarn,
};
