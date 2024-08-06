/**
 * Parses the S3URI into bucketName and objectKey.
 *
 * @param {string} s3Uri - A string of the S3URI.
 * @returns {{ bucketName, objectKey }} An object containing the bucketName and objectKey.
 * @throws {Error} If there is an error.
 */
export function parseS3Uri(s3Uri: string) {
  const [bucketName, ...objectArr] = s3Uri.replace("s3://", "").split("/");
  const objectKey = objectArr.join("/");
  return { Bucket: bucketName, Key: objectKey };
}
