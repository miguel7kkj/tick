require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const comandos = [];
const slashPath = path.join(__dirname, "commands", "slash");
for (const file of fs.readdirSync(slashPath).filter((f) => f.endsWith(".js"))) {
  const comando = require(path.join(slashPath, file));
  comandos.push(comando.data.toJSON());
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Registrando ${comandos.length} comandos...`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: comandos });
    console.log("Comandos registrados com sucesso.");
  } catch (erro) {
    console.error(erro);
  }
})();
