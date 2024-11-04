const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(expressLayouts);
app.set("layout", "layout");

app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
