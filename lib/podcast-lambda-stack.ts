import * as cdk from "aws-cdk-lib";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import type { CronEvent } from "../event";
import { env } from "./env";
import { jstToUtc, schedules, toTime } from "./schedules";

const resourceName = "podcast-lambda";

export class PodcastLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ecrCronRepository = new ecr.Repository(this, "PodcastEcrCronRepo", {
      repositoryName: `${resourceName}-cron-repository`,
    });

    const ecrSpotTaskRepository = new ecr.Repository(this, "PodcastEcrSpotRepo", {
      repositoryName: `${resourceName}-spot-task-repository`,
    });

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

    const cronLogGroup = new logs.LogGroup(
      this,
      `${resourceName}-cron-log-group`,
      {
        logGroupName: "/aws/lambda/podcast-cron-lambda",
        removalPolicy: RemovalPolicy.DESTROY,
        retention: logs.RetentionDays.THREE_MONTHS,
      },
    );

    const cronLambda = new lambda.DockerImageFunction(
      this,
      `${resourceName}-cron`,
      {
        code: lambda.DockerImageCode.fromEcr(ecrCronRepository),
        logGroup: cronLogGroup,
        timeout: Duration.minutes(3), // TODO
        memorySize: 1024,
        environment: { ...env, TZ: "Asia/Tokyo" },
      },
    );

    for (const schedule of schedules) {
      const toCron = toTime(schedule.cronDate, schedule.duration);
      const cron = jstToUtc(toCron);
      const targetInput: CronEvent = {
        title: schedule.title,
        stationId: schedule.station,
        personality: schedule.personality,
        from: {
          hour: schedule.cronDate.hour,
          min: schedule.cronDate.min,
        },
        to: { hour: toCron.hour, min: toCron.min },
      };
      new events.Rule(this, `${resourceName}-${schedule.name}-rule`, {
        ruleName: schedule.name,
        schedule: events.Schedule.cron({
          hour: cron.hour.toString(),
          minute: cron.min.toString(),
          weekDay: Array.isArray(cron.dayOfWeek)
            ? cron.dayOfWeek.join(",")
            : cron.dayOfWeek,
        }),
        targets: [
          new targets.LambdaFunction(cronLambda, {
            event: events.RuleTargetInput.fromObject(targetInput),
          }),
        ],
      });
    }
  }
}
