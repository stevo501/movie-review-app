//import { Handler } from "aws-lambda";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    //console.log("[EVENT] ", JSON.stringify(event));
    //const queryParams = event?.queryStringParameters;

    console.log("[EVENT]", JSON.stringify(event));
    const pathParameters  = event?.pathParameters;
    //const movieId = pathParameters?.movieId ? parseInt(pathParameters.movieId) : undefined;

    if (!pathParameters) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
 },
        body: JSON.stringify({ message: "Missing query parameters" }),
 };
 }
    if (!pathParameters.movieId) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
 },
        body: JSON.stringify({ message: "Missing movie Id parameter" }),
 };
 }
    const movieId = pathParameters?.movieId ? parseInt(pathParameters.movieId) : undefined;
    let commandInput: QueryCommandInput = {
      TableName: process.env.TABLE_NAME,
 };
    if ("reviewId" in pathParameters) {
      commandInput = {
 ...commandInput,
        //IndexName: "reviewerIx",
        KeyConditionExpression: "movieId = :m and begins_with(reviewId, :r) ",
        ExpressionAttributeValues: {
          ":m": movieId,
          ":r": pathParameters.reviewId,
 },
 };
 } else if ("reviewerName" in pathParameters) {
      commandInput = {
 ...commandInput,
        IndexName: "reviewerIx",
        KeyConditionExpression: "movieId = :m and begins_with(reviewerName, :a) ",
        ExpressionAttributeValues: {
          ":m": movieId,
          ":a": pathParameters.reviewerId,
 },
 };
 } else {
      commandInput = {
 ...commandInput,
        KeyConditionExpression: "movieId = :m",
        ExpressionAttributeValues: {
          ":m": movieId,
 },
 };
 }

    const commandOutput = await ddbDocClient.send(
      new QueryCommand(commandInput)
 );

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
 },
      body: JSON.stringify({
        data: commandOutput.Items,
 }),
 };
 } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
 },
      body: JSON.stringify({ error }),
 };
 }
};

function createDocumentClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
 };
  const unmarshallOptions = {
    wrapNumbers: false,
 };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}