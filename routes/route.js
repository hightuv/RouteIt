// ─── Express 모듈 ──────────────────────────
const express = require("express");
const router = express.Router();

const { getRoutes, createRoute, getRoute, deleteRoute, updateRoute } = require("../controllers/routeController");

// ─── 라우팅 ────────────────────────────────
// 모든 동선 조회
router.get("/", getRoutes);

// 동선 생성
router.post("/", createRoute);

// 특정 동선 조회
router.get("/:id", getRoute);

// 특정 동선 삭제
router.delete("/:id", deleteRoute);

// 특정 장소 업데이트
router.put("/:id", updateRoute);
    
module.exports = router;