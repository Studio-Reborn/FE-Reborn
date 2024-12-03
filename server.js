const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(expressLayouts);
app.set("views", ["./views", "./pages"]);

app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/js", express.static(path.join(__dirname, "js")));

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // HTTPS를 사용할 경우 true로 설정
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index", { title: "홈", currentPage: "home" });
});
app.get("/login", (req, res) => {
  res.render("../pages/auth/login", { currentPage: "login" });
});
app.get("/auth", (req, res) => {
  res.render("../pages/auth/auth", { currentPage: "auth" });
});
app.get("/pre-loved", (req, res) => {
  res.render("../pages/pre-loved/pre-loved", { currentPage: "pre-loved" });
});
app.get("/pre-loved/:id", (req, res) => {
  res.render("../pages/pre-loved/pre-loved-click", {
    currentPage: "pre-loved",
  });
});
app.get("/eco-market", (req, res) => {
  res.render("../pages/eco-market/eco-market", {
    currentPage: "eco-market",
  });
});
app.get("/eco-market/:id", (req, res) => {
  res.render("../pages/eco-market/eco-market-click", {
    currentPage: "eco-market",
  });
});
app.get("/eco-market/:id/:product_id", (req, res) => {
  res.render("../pages/eco-market/eco-market-product", {
    currentPage: "eco-market",
  });
});
app.get("/reborn-remake", (req, res) => {
  res.render("../pages/reborn-remake/reborn-remake", {
    currentPage: "reborn-remake",
  });
});
app.get("/reborn-remake/:id", (req, res) => {
  res.render("../pages/reborn-remake/reborn-remake-click", {
    currentPage: "reborn-remake",
  });
});
app.get("/payments", (req, res) => {
  res.render("../pages/payments/payments", {
    currentPage: "payments",
  });
});
app.get("/payments/success", (req, res) => {
  res.render("../pages/payments/payments-success", {
    currentPage: "payments",
  });
});
app.get("/payments/fail", (req, res) => {
  res.render("../pages/payments/payments-fail", {
    currentPage: "payments",
  });
});
app.get("/mypage", (req, res) => {
  res.render("../pages/mypage/mypage", {
    currentPage: "mypage",
  });
});
app.get("/mypage/update", (req, res) => {
  res.render("../pages/mypage/mypage-update", {
    currentPage: "mypage",
  });
});
app.get("/mypage/history/:name", (req, res) => {
  res.render("../pages/mypage/mypage-history", {
    currentPage: "mypage",
  });
});
app.get("/chatting", (req, res) => {
  res.render("../pages/chatting/chatting", {
    currentPage: "chatting",
  });
});
app.get("/chatting/detail", (req, res) => {
  res.render("../pages/chatting/chatting-detail", {
    currentPage: "chatting",
  });
});
app.get("/404", (req, res) => {
  res.render("../pages/notFound", {
    currentPage: "404",
  });
});

// api url 관련
app.get("/config.js", (req, res) => {
  res.type("application/javascript");
  res.send(
    `window.API_SERVER_URL = "${
      process.env.API_SERVER_URL || "http://localhost:4000"
    }";
    window.TOSS_CLIENT_KEY = "${process.env.TOSS_CLIENT_KEY}";`
  );
});

// 세션 관련
app.post("/api/save-session-data", (req, res) => {
  const { dataType, data } = req.body;

  // 동적으로 세션에 저장
  req.session[dataType] = data;

  res.sendStatus(200); // 성공 응답
});
app.get("/api/get-session-data", (req, res) => {
  const { dataType } = req.query;

  if (!req.session[dataType]) {
    return res.status(404).send(`${dataType} not found in session`);
  }

  res.json(req.session[dataType]);
});

app.use((req, res, next) => {
  res.status(404).render("../pages/notFound", {
    currentPage: "404",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
