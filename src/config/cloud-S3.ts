import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

export const helloS3 = async () => {
  const myRegion = process.env.AWS_BUCKET_REGION;
  const myAccessKeyId = process.env.AWS_PUBLIC_KEY;
  const mySecretAccessKey = process.env.AWS_SECRET_KEY;

  const client = new S3Client({ region: myRegion });

  const command = new ListBucketsCommand({ MaxBuckets: 10 });
  console.log(command);
  const Buckets = await client.send(command);
  if (typeof Buckets !== 'undefined') {
    console.log('Buckets: ');
    console.log(Buckets);
  }
  return Buckets;
};
