const { randomUUID } = require("crypto");

/**
 * Register an Express endpoint which external services can POST to in order to
 * deliver captions into Foundry.
 *
 * The request body should be JSON of the shape:
 *   {
 *     "text": "The words to display",        // required
 *     "userId": "xxxx",                      // optional, Foundry user id
 *     "id": "unique-caption-id"              // optional unique id for updates
 *   }
 *
 * The endpoint responds with 200 and { status: "ok" } on success.
 */
Hooks.once("init", () => {
  // The `game.server` object only exists in the Node.js server context. If we
  // don't have it, we are on the client and should do nothing.
  if (!global?.game?.server?.app) return;

  const express = require("express");
  const bodyParser = express.json();
  const router = express.Router();

  router.post("/captions", bodyParser, (req, res) => {
    const { text, userId, id } = req.body ?? {};
    if (typeof text !== "string" || text.trim() === "") {
      res.status(400).json({ error: "'text' field is required" });
      return;
    }

    const payload = {
      action: "caption",
      data: {
        id: id || randomUUID(),
        userId,
        text,
      },
    };

    // Broadcast over the module socket so all connected clients receive it
    game.socket.emit(`module.lib-captions`, payload);

    res.json({ status: "ok" });
  });

  // Mount under /api/lib-captions
  game.server.app.use("/api/lib-captions", router);

  console.log("[lib-captions] Caption POST endpoint registered at /api/lib-captions/captions");
}); 