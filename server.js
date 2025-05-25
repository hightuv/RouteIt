// 필요한 패키지 불러오기
import express from "express";
import swaggerUI from "swagger-ui-express";
import yaml from "yamljs";
import * as OpenAPIValidator from "express-openapi-validator";
import path from "path";
import { fileURLToPath } from "url";

// 현재 디렉토리 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 3000;

// Swagger YAML 파일 불러오기
const swaggerPath = path.join(__dirname, "swagger.yaml");
const openAPIDocument = yaml.load(swaggerPath);

// Swagger UI 연결
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openAPIDocument));

// JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});