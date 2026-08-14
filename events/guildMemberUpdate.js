const { getGuildData, setGuildData } = require("../database/db");
const { enviarLog } = require("../utils/logs");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember) {
    const cargosAntigos = oldMember.roles.cache;
    const cargosNovos = newMember.roles.cache;

    const adicionados = cargosNovos.filter((r) => !cargosAntigos.has(r.id));
    const removidos = cargosAntigos.filter((r) => !cargosNovos.has(r.id));

    if (adicionados.size === 0 && removidos.size === 0) return;

    const configCargos = getGuildData("cargosconfig", newMember.guild.id, { historico: [], autorole: [] });
    const historicoData = getGuildData("historico", newMember.guild.id, {});
    if (!historicoData[newMember.id]) historicoData[newMember.id] = [];

    for (const cargo of adicionados.values()) {
      enviarLog(newMember.guild, "cargos", `➕ ${newMember.user} recebeu o cargo ${cargo}.`);
      if (configCargos.historico.includes(cargo.id)) {
        historicoData[newMember.id].push({ cargoId: cargo.id, acao: "add", data: Date.now() });
      }
    }
    for (const cargo of removidos.values()) {
      enviarLog(newMember.guild, "cargos", `➖ ${newMember.user} perdeu o cargo ${cargo}.`);
      if (configCargos.historico.includes(cargo.id)) {
        historicoData[newMember.id].push({ cargoId: cargo.id, acao: "remove", data: Date.now() });
      }
    }

    setGuildData("historico", newMember.guild.id, historicoData);
  },
};
