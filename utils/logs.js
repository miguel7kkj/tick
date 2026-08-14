const { getGuildData } = require("../database/db");
const { ContainerBuilder, TextDisplayBuilder, CORES } = require("./containers");
const { MessageFlags } = require("discord.js");

async function enviarLog(guild, tipo, texto) {
  const config = getGuildData("logsconfig", guild.id, {});
  const canalId = config[tipo];
  if (!canalId) return;

  const canal = guild.channels.cache.get(canalId);
  if (!canal) return;

  const container = new ContainerBuilder().setAccentColor(CORES.padrao);
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(texto));

  try {
    await canal.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
  } catch {}
}

module.exports = { enviarLog };
