const { PermissionFlagsBits } = require("discord.js");

// Verifica se quem executa pode punir o alvo (hierarquia de cargos)
function podePunir(guild, autor, alvo) {
  if (alvo.id === autor.id) {
    return { ok: false, motivo: "Você não pode se punir." };
  }
  if (alvo.id === guild.client.user.id) {
    return { ok: false, motivo: "Não posso me punir." };
  }
  if (alvo.id === guild.ownerId) {
    return { ok: false, motivo: "Você não pode punir o dono do servidor." };
  }
  const memberAutor = autor;
  const memberAlvo = alvo;

  if (guild.ownerId === memberAutor.id) return { ok: true };

  const cargoMaiorAutor = memberAutor.roles.highest;
  const cargoMaiorAlvo = memberAlvo.roles.highest;

  if (cargoMaiorAlvo.position >= cargoMaiorAutor.position) {
    return { ok: false, motivo: "Você não pode punir esse membro pois ele possui um cargo igual ou superior ao seu." };
  }
  return { ok: true };
}

function temPermissao(member, permissao) {
  return member.permissions.has(permissao);
}

const PERMISSOES_MOD = {
  ban: PermissionFlagsBits.BanMembers,
  kick: PermissionFlagsBits.KickMembers,
  mute: PermissionFlagsBits.ModerateMembers,
  warn: PermissionFlagsBits.ModerateMembers,
};

module.exports = { podePunir, temPermissao, PERMISSOES_MOD };
