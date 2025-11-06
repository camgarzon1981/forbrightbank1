const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const s3Client = require('./src/S3client');
const bodyParser = require('body-parser');
const path = require('path');
const { log } = require('console');
const uuid = require('uuid');

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const logger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'app.log' }) 
  ]
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/getMyBuckets', async (req, res) => {
    try {
        var myBuckets = await s3Client.listMyBuckets();
        res.json({ myBuckets });
    } catch (error) {
        console.error('Error fetching buckets:', error);
        res.status(500).json({ error: 'Failed to fetch buckets' });
    }
});

app.get('/getBucketContent/:bucketName/:bucketPath', async (req, res) => {
    const { bucketName, bucketPath } = req.params;
    try {
        const contents = await s3Client.getBucketContent(bucketName, bucketPath);
        res.json({ contents });
    } catch (error) {
        console.error('Error fetching bucket contents:', error);
        res.status(500).json({ error: 'Failed to fetch bucket contents' });
    }
});

app.post('/onboarding', async (req, res) => {
    const timeStamp = new Date();
    const { firstName, lastName, email } = req.body;
    const traceId = uuid.v4();
    try {                        
        logger.info(`Received onboarding request for: ${traceId}`);
        if (!firstName || !lastName || !email) {
            logger.error(`Missing required fields in request: traceId - ${traceId}`);
            res.status(400).send('Missing required fields: firstName, lastName, email');
            return;
        }                        
        const uniqueFileName = `${email}.json`;     
        req.body["createdAt"] = timeStamp.toISOString(); 
        const fileContent = JSON.stringify(req.body, null, 2);        
        const bucketName = 'maggiedelpilar';
        const bucketPath = 'ingest';        
        if (false) {
            logger.warn(`File already exists in S3: ${uniqueFileName}`);
            res.status(409).send('Onboarding data already exists for this email.');
            return;
        }else{
            const contents = await s3Client.createFile(bucketName, bucketPath, uniqueFileName, fileContent);
            logger.info(`Onboarding data stored for: traceId - ${traceId}`);
            const timeStampEnd = new Date();
            logger.info(`Request processed in ${timeStampEnd - timeStamp} ms`);
            logger.info(`Request completed: traceId - ${traceId}`);
            res.send(`<html><head><title>Onboarding Complete</title></head>
                <body>Onboarding data for ${firstName} ${lastName} has been received. Thank you!
                </body></html>`);            
        }
    } catch (error) {
        logger.error(`Error fetching bucket contents: traceId - ${traceId}, error - ${error}`);
        res.status(500).json({ error: 'Failed to fetch bucket contents' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start server when run directly
const port = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    });
}

module.exports = app;