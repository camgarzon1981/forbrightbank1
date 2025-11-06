import { S3Client, ListBucketsCommand, ListObjectsV2Command, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';



 
 const s3Client = new S3Client({  region: 'us-east-1',
       credentials: {
     accessKeyId: '', 
     secretAccessKey: ''
   } }); 

async function listMyBuckets() {
  try {
    const command = new ListBucketsCommand({});
    const data = await s3Client.send(command);
    console.log('Buckets:', data.Buckets.map((bucket) => bucket.Name));
  } catch (error) {
    console.error('Error listing buckets:', error);
  }
}

async function getBucketContent(bucketName, bucketPath) {
   
    const command = new ListObjectsV2Command({
        Bucket: bucketName
            });
     try {
        let data = await s3Client.send(command);
        console.log('Bucket Contents:', data.Contents.map((item) => item.Key));
        return data.Contents;
    } catch (error) {
        console.error('Error fetching bucket contents:', error);
    }
}

async function createFile(bucketName, bucketPath, fileName, fileContent) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `${bucketPath}/${fileName}`,
        Body: fileContent
    });
    try {
        let data = await s3Client.send(command);
        console.log('File Created:', data);
        return data;
    } catch (error) {
        console.error('Error creating file:', error);
    }
}        

async function fileExistsInS3(filePath, bucketName) {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: filePath, 
      });

      try {
        await s3Client.send(command);
        console.log(`File exists: ${filePath}`);
        return true;
      } catch (error) {
        if (error.name === 'NotFound') {
          console.log(`File does not exist: ${filePath}`);
          return false;
        }
        console.error(`Error checking file existence: ${error}`);
        throw error; // Re-throw other errors for handling upstream
      }
    }

export { listMyBuckets, getBucketContent, createFile, fileExistsInS3 };