import nodemailer from 'nodemailer';

export const sendEmail = async ({ from, to, subject, text, html }: { from?: string, to: string, subject: string, text: string, html: string }) => {
	const transporter = nodemailer.createTransport({
		host: String(process.env.EMAIL_HOST),
		port: Number(process.env.EMAIL_PORT),
		secure: Number(process.env.EMAIL_PORT) === 465,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const emailOptions = {
    from: from ?? 'Pepe de Wallaclone',
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

	const info = await transporter.sendMail(emailOptions);
};
