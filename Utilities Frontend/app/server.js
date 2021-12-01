const express = require("express");
const app = express();
const port = 8082;

app.use(express.static("dist"));

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
