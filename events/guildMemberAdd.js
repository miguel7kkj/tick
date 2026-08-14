const { getGuildData } = require("../database/db");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const config = getGuildData("cargosconfig", member.guild.id, { historico: [], autorole: [] });
    if (config.autorole.length === 0) return;

    for (const cargoId of config.autorole) {
      await member.roles.add(cargoId).catch(() => {});
    }
  },
};
