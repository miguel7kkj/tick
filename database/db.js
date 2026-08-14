const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function read(name) {
  const file = filePath(name);
  if (!fs.existsSync(file)) return {};
  try {
    const raw = fs.readFileSync(file, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function write(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf8");
}

function getGuildData(store, guildId, defaults = {}) {
  const all = read(store);
  if (!all[guildId]) {
    all[guildId] = defaults;
    write(store, all);
  }
  return all[guildId];
}

function setGuildData(store, guildId, value) {
  const all = read(store);
  all[guildId] = value;
  write(store, all);
  return value;
}

module.exports = { read, write, getGuildData, setGuildData };
