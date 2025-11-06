To run this project will need nodejs installed local

 Setup credentials in file src/S3Client.js  line 6
 
       const s3Client = new S3Client({  region: 'us-east-1',
             credentials: {
           accessKeyId: '', 
           secretAccessKey: ''
         } }); 

go to root dir and execute following command

      node app.js &

Log should show the following start line 
 
  Server listening on http://localhost:3000

Log of processing available in file app.log

