// ─── 필수 모듈 ─────────────────────────────────
const express = require('express');
const swaggerUI = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

// ─── 라우터 모듈 ────────────────────────────────
const authRouter = require('./routes/auth');
const memberRouter = require('./routes/member');

// ─── Express 앱 초기화 ──────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Swagger 설정 ──────────────────────────────
// swagger.yaml 경로 지정
const swaggerPath = path.join(__dirname, 'swagger.yaml');
const openAPIDocument = yaml.load(swaggerPath);

// Swagger UI 연결
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openAPIDocument));

// ─── 미들웨어 등록 ──────────────────────────────
// JSON 본문 파싱
app.use(express.json());

// ─── 라우터 등록 ──────────────────────────────
app.use('/auth', authRouter);
app.use('/member', memberRouter);

// ─── 서버 실행 ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
