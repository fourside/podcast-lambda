import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { createCronLambda, createSpotTaskLambda } from "./create-lambda";

const resourceName = "podcast-lambda";

export class PodcastLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ecrLifecycleRule: ecr.LifecycleRule = {
      rulePriority: 1,
      maxImageCount: 1,
    };

    const ecrCronRepository = new ecr.Repository(this, "PodcastEcrCronRepo", {
      repositoryName: `${resourceName}-cron-repository`,
    });
    ecrCronRepository.addLifecycleRule(ecrLifecycleRule);

    const ecrSpotTaskRepository = new ecr.Repository(
      this,
      "PodcastEcrSpotRepo",
      {
        repositoryName: `${resourceName}-spot-task-repository`,
      },
    );
    ecrSpotTaskRepository.addLifecycleRule(ecrLifecycleRule);

    const ecrRole = new iam.Role(this, "PodcastEcrRole", {
      roleName: `${resourceName}-repository-role`,
      assumedBy: new iam.FederatedPrincipal(
        "arn:aws:iam::540093229923:oidc-provider/token.actions.githubusercontent.com", // TODO
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            "token.actions.githubusercontent.com:sub":
              "repo:fourside/podcast-lambda:ref:refs/heads/main",
          },
        },
        "sts:AssumeRoleWithWebIdentity",
      ),
    });
    ecrRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ecr:GetAuthorizationToken"],
        effect: iam.Effect.ALLOW,
        resources: ["*"],
      }),
    );
    ecrRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "ecr:UploadLayerPart",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:CompleteLayerUpload",
          "ecr:BatchCheckLayerAvailability",
        ],
        effect: iam.Effect.ALLOW,
        resources: [
          ecrCronRepository.repositoryArn,
          ecrSpotTaskRepository.repositoryArn,
        ],
      }),
    );

    ecrCronRepository.grant(ecrRole);
    ecrSpotTaskRepository.grant(ecrRole);

    createCronLambda(this, resourceName, ecrCronRepository);
    createSpotTaskLambda(this, resourceName, ecrSpotTaskRepository);
  }
}
