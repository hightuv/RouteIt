// ─── 필수 모듈 ─────────────────────────────────
const express = require('express');
const swaggerUI = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');

// ─── 라우터 모듈 ────────────────────────────────
const authRouter = require('./routes/auth');
const memberRouter = require('./routes/member');

// ─── 컨트롤러 모듈 ───────────────────────────────
const apis = require('./controllers');

// ─── Express 앱 초기화 ──────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Swagger 설정 ──────────────────────────────
const swaggerPath = path.join(__dirname, 'openapi.yaml');
const openAPIDocument = yaml.load(swaggerPath);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openAPIDocument));

// ─── 미들웨어 등록 ──────────────────────────────
app.use(express.json());

// ─── OpenAPI Validator 미들웨어 ────────────────
app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerPath,
    validateResponses: true,
    operationHandlers: {
      resolver: modulePathResolver, 
    },
  })
);

// ─── 요청 핸들러 매핑 함수 분리 ────────────────
function modulePathResolver(_, route, apiDoc) {
  const pathKey = route.openApiRoute.substring(route.basePath.length);
  const method = route.method.toLowerCase();
  const operation = apiDoc.paths[pathKey][method];
  const methodName = operation.operationId;
  return apis[methodName];
}

// ─── 라우터 등록 ────────────────────────────────
app.use('/auth', authRouter);
app.use('/member', memberRouter);

// ─── 서버 실행 ──────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
