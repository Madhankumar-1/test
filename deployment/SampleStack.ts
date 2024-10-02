import {  Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apiGwV2 from "aws-cdk-lib/aws-apigatewayv2";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";
let STAGE = "dev";

const subDomain = "demo.talksite.ai";

export class SampleStack extends Stack {
     constructor(scope: Construct, id: string, props?: StackProps) {
          super(scope, id, props);

          //Api gateway to map with sub domain
          const demoApi = new apiGwV2.HttpApi(this, `demoHttpApi`, {
               corsPreflight: {
                    allowMethods: [apiGwV2.CorsHttpMethod.ANY],
                    allowHeaders: ["*"],
                    allowOrigins: ["*"],
               },
          });

          //Lambda for the api gateway
          const demoLambda = new NodejsFunction(this, `demoLambda`, {
               functionName: `demoLambda`,
               runtime: lambda.Runtime.NODEJS_16_X,
               handler: "handler",
               tracing: lambda.Tracing.ACTIVE,
               description: "Lambda for resending verification code",
               entry: path.join(__dirname, "../lambda/demo/src/index.js"),
               environment: {},
          });

          //Route for the lambda
          demoApi.addRoutes({
               path: "/demo",
               methods: [apiGwV2.HttpMethod.GET],
               integration: new HttpLambdaIntegration("demoLambdaIntegration", demoLambda),
          });

          //Stage for teh api gateway
          let stage = demoApi.addStage(`${subDomain}-${STAGE}`, {
               stageName: STAGE,
               autoDeploy: true,
          });
     }
}

import * as cdk from "aws-cdk-lib";
const app = new cdk.App();
new SampleStack(app, "SampleStack", {
     env: {
          region: "ap-southeast-2",
          account: "199302260568",
     },
});
