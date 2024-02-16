import * as cdk from "aws-cdk-lib";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import type { CronEvent } from "../event";
import { env } from "./env";
import { convertCronOptions, schedules } from "./schedules";

export function createCronLambda(
  stack: cdk.Stack,
  resourceName: string,
  ecr: ecr.Repository,
): void {
  const logGroup = new logs.LogGroup(stack, `${resourceName}-cron-log-group`, {
    logGroupName: "/aws/lambda/podcast-lambda-cron",
    removalPolicy: RemovalPolicy.DESTROY,
    retention: logs.RetentionDays.THREE_MONTHS,
  });

  const cronLambda = new lambda.DockerImageFunction(
    stack,
    `${resourceName}-cron`,
    {
      functionName: `${resourceName}-cron`,
      code: lambda.DockerImageCode.fromEcr(ecr),
      logGroup,
      timeout: Duration.minutes(7),
      memorySize: 1024,
      environment: { ...env, TZ: "Asia/Tokyo" },
    },
  );

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

export function createSpotTaskLambda(
  stack: cdk.Stack,
  resourceName: string,
  ecr: ecr.Repository,
): void {
  const logGroup = new logs.LogGroup(
    stack,
    `${resourceName}-spot-task-log-group`,
    {
      logGroupName: "/aws/lambda/podcast-lambda-spot-task",
      removalPolicy: RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.THREE_MONTHS,
    },
  );

  const spotTaskLambda = new lambda.DockerImageFunction(
    stack,
    `${resourceName}-spot-task`,
    {
      functionName: `${resourceName}-spot-task`,
      code: lambda.DockerImageCode.fromEcr(ecr),
      logGroup,
      timeout: Duration.minutes(7),
      memorySize: 1024,
      environment: { ...env, TZ: "Asia/Tokyo" },
    },
  );

  new events.Rule(stack, `${resourceName}-spot-task-rule`, {
    ruleName: "prevent-inactivation",
    schedule: events.Schedule.cron({
      minute: "0",
      hour: "0",
      weekDay: "SUN",
    }),
    targets: [
      new targets.LambdaFunction(spotTaskLambda, {
        event: events.RuleTargetInput.fromObject({}),
      }),
    ],
  });
}
