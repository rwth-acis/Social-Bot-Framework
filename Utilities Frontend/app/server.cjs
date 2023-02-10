const express = require("express");
const app = express();
const path = require("path");
const port = 8082;

app.use("/dist", express.static(path.join(__dirname, "dist")));

app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

app.get("*", (req, res) => {
  console.log(req.url);
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
