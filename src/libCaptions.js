import "./utils/hooks.js";
import "./utils/logging.js";
import Captions from "./Captions.js";
import { MODULE_NAME } from "./utils/constants.js";

ui.captions = new Captions();

// Listen for incoming caption events over the module socket
if (game.socket) {
  game.socket.on(`module.${MODULE_NAME}`, (payload = {}) => {
    const { action, data } = payload;
    if (action !== "caption" || !data) return;

    const { id, userId, text } = data;
    const user = game.users?.get(userId) ?? { name: "Speaker" };
    ui.captions.caption(id ?? randomID(), user, text);
  });
}

function randomID() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}
