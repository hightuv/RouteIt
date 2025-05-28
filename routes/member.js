// ─── Express 모듈 ──────────────────────────
const express = require("express");
const router = express.Router();

const { getMember, getMemberRoute } = require("../controllers/memberController");

// ─── 라우팅 ────────────────────────────────
// 특정 사용자 조회
router.get("/:id", getMember)
    
// 특정 사용자 동선 조회
router.get("/:id/routes", getMemberRoute);

module.exports = router;