const { defineConfig } = require("cypress");
const fs = require("fs");
const path = require("path");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        fileExists(filePath) {
          return fs.existsSync(path.join(__dirname, filePath));
        },
        makeDirectory(dirPath) {
          fs.mkdirSync(path.join(__dirname, dirPath), { recursive: true });
          return null;
        },
      });
    },
  },
});
