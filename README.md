## Enterprise Web Development module - Serverless REST Assignment.

__Name:__ ....Steven Johnston .....

__Demo:__ ... link to your YouTube video demonstration ......

### Overview.

A secure, serverless Web API for managing movie review postings. The API is hosted on the AWS platform and uses the CDK framework to provision the infrastructure resources.
It deploys the MovieReviewAuthAppstack to AWS. It contains an AppApi gateway for public and protected REST endpoints and an AuthAPI for performing Authentication processes.
The MovieReviews table is provisioned in DynamoDB and several Lambdas are invoked to support CRUD functionality.
A JSON schema is used for body/payload validation in all endpoints as well as use of the AJV library.


### App API endpoints.

+ GET /movies/reviews/[movieId] - Get all the reviews for the specified movie. It will also support an optional query string that specifies a review ID or reviewer identity (email address), e.g. ?revieId=1234 or ?reviewerName=joe@gmail.com.
+ POST /movies/reviews - add a movie review. Only authenticated users can post a review.
+ PUT /movies/{movieId}/reviews/{reviewId} - Update the text of a review.
+ GET /reviews/{reviewId}/{movieId}/translation?language=code - Get a translated version of a movie review, using the movie ID and review Id as the identifier.

### Features.
+MovieReviews table is provisioned in DynamoDB for storing Movie reviews and is pre-populated using .\seed\movie-reviews.ts file.
+In \lambdas\ there is four lambdas to support CRUD functionality, addMoviewReview.ts, getMovieReviews.ts,  updateMovieReview.ts and translateMovieReview.ts(not completed)
+The AuthApi processes user authentication requests and allow users to self-register, confirn signup, login, and log out.
+Only authenticated users can perform POST and PUT requests (Protected Endpoints), whereas GET requests are publicly accessible (Publis Endpoints)
+A JSON schema is used for body/payload validation in all endpoints as well as use of the AJV library.

#### Translation persistence (if completed)

Unfortunately I ran out of time and only got to make a start at the attempting the translation piece.

#### Custom L2 Construct (if completed)

The MovieReviewAuthApp Stack class uses built-in L2 constructs for the Cognito user pool infrastructure. It then instantiates instances of our custom L2 constructs to create all the API resources.
The AuthAPI L2 contruct provisions a Cognito User Pool and the AppApi L2 provisons the DynamoDB table, API gateway etc.

Construct Input props object:
~~~
type AppApiProps = {
  userPoolId: string;
  userPoolClientId: string;
};
~~~
Construct public properties
~~~
export class AppApi extends Construct {
  constructor(scope: Construct, id: string, props: AppApiProps) {
    super(scope, id);

    const appApi = new apig.RestApi(this, "AppApi", {
      description: "App RestApi",
      endpointTypes: [apig.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: apig.Cors.ALL_ORIGINS,
      },
    });

    const appCommonFnProps = {
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "handler",
      environment: {
        USER_POOL_ID: props.userPoolId,
        CLIENT_ID: props.userPoolClientId,
        REGION: cdk.Aws.REGION,
      },
    };

~~~
 ]

#### Restricted review updates (if completed)

Did not get this working.


#### API Gateway validators. (if completed)

[State where in your app API's list of endpoints you used API Gateway's Validators. Include code excerpts from your stack code that illustrate their use.]

A JSON schema used for body/payload validation in all endpoints as well use of the AJV library
+ GET /movies/reviews/[movieId]
+ POST /movies/reviews
+ PUT /movies/{movieId}/reviews/{reviewId}
+ GET /reviews/{reviewId}/{movieId}/translation?language=code

In \shared\types.schema.json for example

"export type MovieReviewsQueryParams = {
    movieId: string;
    reviewerName?: string;
    reviewId?: string;
 }"

and in \shared\types.schema.json

"MovieReviewsQueryParams": {
            "additionalProperties": false,
            "properties": {
                "movieId": {
                    "type": "string"
                },
                "reviewId": {
                    "type": "string"
                },
                "reviewerName": {
                    "type": "string"
                }
            },
            "required": [
                "movieId"
            ],
            "type": "object"
        },

In getMovieReviews.ts

import Ajv from "ajv";
import schema from "../shared/types.schema.json";

const ajv = new Ajv();
const isValidQueryParams = ajv.compile(
  schema.definitions["MovieReviewsQueryParams"] || {}
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



###  Extra (If relevant).

[ State any other aspects of your solution that use CDK/serverless features not covered in the lectures ]


