require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
});

client.slashCommands = new Collection();
client.prefixCommands = new Collection();
client.PREFIX = "!";

// Carrega comandos slash
const slashPath = path.join(__dirname, "commands", "slash");
for (const file of fs.readdirSync(slashPath).filter((f) => f.endsWith(".js"))) {
  const comando = require(path.join(slashPath, file));
  client.slashCommands.set(comando.data.name, comando);
}

// Carrega comandos de prefixo
const prefixPath = path.join(__dirname, "commands", "prefix");
for (const file of fs.readdirSync(prefixPath).filter((f) => f.endsWith(".js"))) {
  const comando = require(path.join(prefixPath, file));
  client.prefixCommands.set(comando.name, comando);
}

// Carrega eventos
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"))) {
  const evento = require(path.join(eventsPath, file));
  if (evento.once) {
    client.once(evento.name, (...args) => evento.execute(...args, client));
  } else {
    client.on(evento.name, (...args) => evento.execute(...args, client));
  }
}

client.login(process.env.TOKEN);
