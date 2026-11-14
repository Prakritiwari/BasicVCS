#!/usr/bin/env node

// Backwards-compatible entry point: `node backend/index.js ...` now runs the
// standalone CLI from backend/cli. Publish/install the CLI from backend/cli.
require("./cli");
