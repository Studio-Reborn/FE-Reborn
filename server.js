const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(expressLayouts);
app.set("views", ["./views", "./pages"]);

app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "홈", currentPage: "home" });
});
app.get("/login", (req, res) => {
  res.render("login", { currentPage: "login" });
});
app.get("/auth", (req, res) => {
  res.render("auth", { currentPage: "auth" });
});
app.get("/pre-loved", (req, res) => {
  res.render("pre-loved", { currentPage: "pre-loved" });
});
app.get("/pre-loved/click", (req, res) => {
  res.render("pre-loved-click", {
    currentPage: "pre-loved",
  });
});
app.get("/eco-market", (req, res) => {
  res.render("eco-market", {
    currentPage: "eco-market",
  });
});
app.get("/eco-market/click", (req, res) => {
  res.render("eco-market-click", {
    currentPage: "eco-market",
  });
});
app.get("/eco-market/product", (req, res) => {
  res.render("eco-market-product", {
    currentPage: "eco-market",
  });
});
app.get("/reborn-remake", (req, res) => {
  res.render("reborn-remake", {
    currentPage: "reborn-remake",
  });
});
app.get("/payments", (req, res) => {
  res.render("payments", {
    currentPage: "payments",
  });
});
app.get("/payments/success", (req, res) => {
  res.render("payments-success", {
    currentPage: "payments",
  });
});
app.get("/mypage", (req, res) => {
  res.render("mypage", {
    currentPage: "mypage",
  });
});
app.get("/mypage/update", (req, res) => {
  res.render("mypage-update", {
    currentPage: "mypage",
  });
});
app.get("/chatting", (req, res) => {
  res.render("chatting", {
    currentPage: "chatting",
  });
});
app.get("/chatting/detail", (req, res) => {
  res.render("chatting-detail", {
    currentPage: "chatting",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
