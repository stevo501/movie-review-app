/*import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { TranslateMovieReviewsQueryParams } from "../shared/types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json";
import * as AWS from 'aws-sdk';

const translate = new AWS.Translate();

const ajv = new Ajv();
const isValidQueryParams = ajv.compile(
  schema.definitions["TranslateMovieReviewsQueryParams"] || {}
);
 
const ddbDocClient = createDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    const queryParams = event.queryStringParameters;
    if (!queryParams) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing query parameters" }),
      };
    }
    if (!isValidQueryParams(queryParams)) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message: `Incorrect type. Must match Query parameters schema`,
          schema: schema.definitions["MovieReviewsQueryParams"],
        }),
      };
    }
    
}
      /*const pathParameters  = event?.pathParameters;
      const movieId = pathParameters?.movieId ? parseInt(pathParameters.movieId) : undefined;
      const reviewId = pathParameters?.reviewId ? parseInt(pathParameters.reviewId) : undefined;
      let commandInput: QueryCommandInput = {
        TableName: process.env.TABLE_NAME,
      };
  
      if (!movieId) {
          return {
            statusCode: 404,
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ Message: "Missing movie Id" }),
          };
        }
        else if (!reviewId) {
          return {
            statusCode: 404,
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ Message: "Missing review Id" }),
          };
        }
        if ("language" in queryParams) {
            commandInput = {
              ...commandInput,
              KeyConditionExpression: "movieId = :m and language = en ",
              ExpressionAttributeValues: {
                ":m": movieId,
                ":r": reviewId,
              },  
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
}*/
