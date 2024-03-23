import * as cdk from "aws-cdk-lib";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import type { CronEvent } from "../lambda-image/src/type";
import { env } from "./env";
import { convertCronOptions, schedules } from "./schedules";

export function createLambda(
  stack: cdk.Stack,
  resourceName: string,
  ecr: ecr.Repository,
): void {
  const logGroup = new logs.LogGroup(stack, `${resourceName}-log-group`, {
    logGroupName: "/aws/lambda/podcast-lambda",
    removalPolicy: RemovalPolicy.DESTROY,
    retention: logs.RetentionDays.THREE_MONTHS,
  });

  const cronLambda = new lambda.DockerImageFunction(stack, resourceName, {
    functionName: resourceName,
    code: lambda.DockerImageCode.fromEcr(ecr),
    logGroup,
    timeout: Duration.minutes(10),
    memorySize: 1024,
    environment: { ...env, TZ: "Asia/Tokyo" },
  });

  for (const schedule of schedules) {
    const targetInput: CronEvent = {
      title: schedule.title,
      stationId: schedule.stationId,
      personality: schedule.personality,
      from: {
        hour: schedule.fromTime.hour,
        min: schedule.fromTime.min,
      },
      to: { hour: schedule.toTime.hour, min: schedule.toTime.min },
    };
    new events.Rule(stack, `${resourceName}-${schedule.name}-rule`, {
      ruleName: schedule.name,
      schedule: events.Schedule.cron(
        convertCronOptions(schedule.toTime, schedule.dayOfWeek),
      ),
      targets: [
        new targets.LambdaFunction(cronLambda, {
          event: events.RuleTargetInput.fromObject(targetInput),
        }),
      ],
    });
  }
}
