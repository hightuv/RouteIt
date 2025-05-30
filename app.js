import express from 'express';
import swaggerUI from 'swagger-ui-express';
import yaml from 'yamljs';
import dotenv from 'dotenv';
import cors from 'cors';
import * as OpenAPIValidator from 'express-openapi-validator';
import * as apis from './controller/index.js';

dotenv.config();

const app = express();

const port = process.env.PORT;
const openAPIDocument = yaml.load('./api/openapi.yaml');

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openAPIDocument));
app.use(
  OpenAPIValidator.middleware({
    apiSpec: './api/openapi.yaml',
    validateResponses: true,

    operationHandlers: {
      resolver: modulePathResolver,
    },
    // validateSecurity: {
    //   handlers: {
    //     jwt_auth: authHandler,
    //   },
    // },
  })
);

function modulePathResolver(_, route, apiDoc) {
  const pathKey = route.openApiRoute.substring(route.basePath.length);
  const operation = apiDoc.paths[pathKey][route.method.toLowerCase()];
  const methodName = operation.operationId;
  // console.log(typeof apis[methodName], methodName);
  return apis[methodName];
}

app.listen(port, () => {
  console.log(`Server is started -> http://localhost:${port}`);
});
