import * as cdk from 'aws-cdk-lib';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/util";
import {moviereviews} from "../seed/movie-reviews";
import * as apig from "aws-cdk-lib/aws-apigateway";

import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MovieReviewAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MovieReviewAppQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const simpleFn = new lambdanode.NodejsFunction(this, "SimpleFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: `${__dirname}/../lambdas/simple.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
    });

    const simpleFnURL = simpleFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const moviesTable = new dynamodb.Table(this, "MoviesTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "movieId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: 'reviewId', type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "MovieReviews",
    });

    moviesTable.addLocalSecondaryIndex({
      indexName: "reviewerIx",
      sortKey: { name: "reviewerId", type: dynamodb.AttributeType.STRING },
 });



    new custom.AwsCustomResource(this, "moviesddbInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [moviesTable.tableName]: generateBatch(moviereviews),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("moviesddbInitData"), //.of(Date.now().toString()),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [moviesTable.tableArn],
      }),
    });

    const getMovieReviewsFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieReviewsFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: `${__dirname}/../lambdas/getMovieReviews.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: moviesTable.tableName,
          REGION: "eu-west-1",
        },
      }
    );

    const getMovieReviewsURL = getMovieReviewsFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const getMovieReviewByMovieIdFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieReviewByMovieIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: `${__dirname}/../lambdas/getMovieReviewByMovieId.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: moviesTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const getMovieReviewByMovieIdURL = getMovieReviewByMovieIdFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const getMovieReviewByReviewIdFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieReviewByReviewIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: `${__dirname}/../lambdas/getMovieReviewByReviewId.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: moviesTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const getMovieReviewByReviewIdURL = getMovieReviewByReviewIdFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const newMovieReviewFn = new lambdanode.NodejsFunction(this, "AddMovieReviewFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: `${__dirname}/../lambdas/addMovieReview.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: moviesTable.tableName,
        REGION: "eu-west-1",
      },
    });


    //Permissions
    moviesTable.grantReadData(getMovieReviewsFn)
    moviesTable.grantReadData(getMovieReviewByMovieIdFn)
    moviesTable.grantReadData(getMovieReviewByReviewIdFn)
    moviesTable.grantReadWriteData(newMovieReviewFn)

    //REST Api
    const api = new apig.RestApi(this, "MovieReviewRestAPI", {
      description: "Movie Review api",
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    //movies endpoint
    const moviesEndpoint = api.root.addResource("movies");

    // reviews endpoint
    const reviewsEndpoint = api.root.addResource("reviews");
    
    

    // Detail movie endpoint
    reviewsEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(newMovieReviewFn, { proxy: true })
    );
    //const specificMovieEndpoint = reviewsEndpoint.addResource("{movieId}");
    
    reviewsEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieReviewsFn, { proxy: true })
    );
    //reviewsEndpoint.addMethod(
      //"GET",
      //new apig.LambdaIntegration(getMovieReviewByMovieIdFn, { proxy: true })
   // );
    
    //const specificMovieReviewEndpoint = reviewsEndpoint.addResource("{reviewId}");
    //specificMovieReviewEndpoint.addMethod(
      //"GET",
      //new apig.LambdaIntegration(getMovieReviewByReviewIdFn, { proxy: true })
   // );

   new cdk.CfnOutput(this, "Get All Movie Reviews via Specified Movie Function Url", { value: getMovieReviewByMovieIdURL.url });
    new cdk.CfnOutput(this, "Get All Movie Reviews via Movie ID Function Url", { value: getMovieReviewByMovieIdURL.url });
    new cdk.CfnOutput(this, "Get All Movie Reviews via Review ID Function Url", { value: getMovieReviewByReviewIdURL.url });
    new cdk.CfnOutput(this, "Simple Function Url", { value: simpleFnURL.url });
  }
}
