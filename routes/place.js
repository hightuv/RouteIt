// ─── Express 모듈 ──────────────────────────
const express = require("express");
const router = express.Router();

const { getPlaceById } = require("../controllers/placeController");

// ─── 라우팅 ────────────────────────────────
// 특정 장소 조회
router.get("/:id", getPlaceById);
    
module.exports = router;