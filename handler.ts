import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import handleImportUnl from "./handlers/handleImportUnl"
import handleImportUnlHistory from "./handlers/handleImportUnlHistory"
import handleImportLocation from "./handlers/handleImportLocation"
import handleImportValidator from "./handlers/handleImportValidator"
import handleImportValidatorReport from "./handlers/handleImportValidatorReport"
import handleImportManifest from "./handlers/handleImportManifest"

export const importValidator: APIGatewayProxyHandler = async (_event, _context) => {
  await handleImportValidator()
  return {
    statusCode: 200,
    body: JSON.stringify(true),
  };
}

export const importManifest: APIGatewayProxyHandler = async (_event, _context) => {
  await handleImportManifest()
  return {
    statusCode: 200,
    body: JSON.stringify(true),
  };
}

export const importUnl: APIGatewayProxyHandler = async (_event, _context) => {
  await handleImportUnl()
  return {
    statusCode: 200,
    body: JSON.stringify(true),
  };
}

export const importLocation: APIGatewayProxyHandler = async (_event, _context) => {
  await handleImportLocation()
  return {
    statusCode: 200,
    body: JSON.stringify(true),
  };
}

export const importUnlHistory: APIGatewayProxyHandler = async (_event, _context) => {
  await handleImportUnlHistory()
  return {
    statusCode: 200,
    body: JSON.stringify(true),
  };
}

export const importValidatorReport: APIGatewayProxyHandler = async (_event, _context) => {
  await handleImportValidatorReport()
  return {
    statusCode: 200,
    body: JSON.stringify(true),
  };
}
