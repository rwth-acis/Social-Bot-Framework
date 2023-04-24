const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 8082;

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
