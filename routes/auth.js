// ─── Express 모듈 ──────────────────────────
const express = require("express");
const router = express.Router();

const { login, register } = require("../controllers/authController");

// ─── 라우팅 ────────────────────────────────
// 로그인
router.post("/login", login);

// 회원가입
router.post("/register", register);

module.exports = router;