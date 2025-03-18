import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDocumentClient();

export const handler: Handler = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));
    const queryParams = event?.queryStringParameters;
    if (!queryParams) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
 },
        body: JSON.stringify({ message: "Missing query parameters" }),
 };
 }
    if (!queryParams.movieId) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
 },
        body: JSON.stringify({ message: "Missing movie Id parameter" }),
 };
 }
    const movieId = parseInt(queryParams?.movieId);
    let commandInput: QueryCommandInput = {
      TableName: process.env.TABLE_NAME,
 };
    if ("reviewId" in queryParams) {
      commandInput = {
 ...commandInput,
        //IndexName: "reviewerIx",
        KeyConditionExpression: "movieId = :m and begins_with(reviewId, :r) ",
        ExpressionAttributeValues: {
          ":m": movieId,
          ":r": queryParams.reviewId,
 },
 };
 } else if ("reviewerName" in queryParams) {
      commandInput = {
 ...commandInput,
        IndexName: "reviewerIx",
        KeyConditionExpression: "movieId = :m and begins_with(reviewerName, :a) ",
        ExpressionAttributeValues: {
          ":m": movieId,
          ":a": queryParams.reviewerId,
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
