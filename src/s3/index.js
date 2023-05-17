const {
  S3Client,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
  },
  forcePathStyle: true,
});

const prepareS3 = async () => {
  try {
    const createBucketCMD = new CreateBucketCommand({
      Bucket: process.env.S3_BUCKET_NAME,
    });

    await s3.send(createBucketCMD).catch((e) => {
      if (e.Code !== "BucketAlreadyOwnedByYou") throw e;
    });
    /*
        public
    */
    const policy = {
      Version: "2012-10-17",
      statement: [
        {
          Sid: "AddPerm",
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${process.env.S3_BUCKET_NAME}/public/**`],
        },
      ],
    };

    const policyComand = new PutBucketPolicyCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Policy: JSON.stringify(policy),
    });

    await s3.send(policyComand);

    console.log("S3 Setup sucessfully");
  } catch (e) {
    console.log(e.message);
  }
};

// public/userid/private.mp4
const uploadToS3 = async (fileBuffer, path) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: path,
    Body: fileBuffer,
  };

  const createCommand = new PutObjectCommand(params);

  await s3.send(createCommand);
};

const generatePermanentURL = (key) => {
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET_NAME;
  const url = new URL(endpoint);
  const protocol = endpoint.startsWith("https") ? "https" : "http";

  const host = endpoint.replace(`${protocol}://`, "");

  url.protocol = protocol;
  url.host = host;

  if (process.env.S3_PROVIDER === "minio") {
    url.pathname = `${bucket}/${key}`;
  } else {
    url.pathname = key;
    url.host = `${bucket}.${host}`;
  }

  return url.toString();
};

const deleteS3File = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    const results = await s3.send(new DeleteObjectCommand(params));
    return results;
  } catch (err) {
    console.log("Error while deleting file", err);
    return false;
  }
};

module.exports = {
  s3,
  prepareS3,
  uploadToS3,
  generatePermanentURL,
};
