export const createS3Uri = (imageName: string) => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;
  const objectKey = `${imageName}`;
  return `s3://${bucketName}/${objectKey}`;
};
