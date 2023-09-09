import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket", {
  bucket: "my-test-bucket",
});

if (process.env.CREATE_BUCKET === "true") {
  new aws.s3.Bucket("my-bucket-cond");
}

const firehoseAssumeRole = aws.iam.getPolicyDocument({
  statements: [
    {
      effect: "Allow",
      principals: [
        {
          type: "Service",
          identifiers: ["firehose.amazonaws.com"],
        },
      ],
      actions: ["sts:AssumeRole"],
    },
  ],
});

const firehoseRole = new aws.iam.Role("firehoseRole", {
  assumeRolePolicy: firehoseAssumeRole.then(
    (firehoseAssumeRole) => firehoseAssumeRole.json
  ),
});

const firehose = new aws.kinesis.FirehoseDeliveryStream("firehose", {
  destination: "s3",
  s3Configuration: {
    bucketArn: bucket.arn,
    roleArn: firehoseRole.arn,
  },
});

// Export the name of the bucket
export const bucketName = bucket.id;
