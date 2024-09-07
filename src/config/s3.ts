import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION ? process.env.AWS_REGION : '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEYID ? process.env.AWS_ACCESSKEYID : '',
    secretAccessKey: process.env.AWS_SECRETACCESSKEY ? process.env.AWS_SECRETACCESSKEY : '',
  },
});

export const uploadFileToS3 = async (file: Express.Multer.File, filename: string) => {
	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: file.originalname,
		Body: file.buffer,
	};

	try {
		return await s3Client.send(new PutObjectCommand(params));
	} catch (err) {
		console.log(err)
		throw Error('No se pudo subir la imagen al repositorio')
	}
};
