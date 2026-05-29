const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const recipientEmail = '245123733244@mvsrec.edu.in';
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

function required(value) {
	return typeof value === 'string' && value.trim().length > 0;
}

function escapeHtml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function createTransporter() {
	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT || 587),
		secure: process.env.SMTP_SECURE === 'true',
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS
		}
	});
}

app.post('/api/book-lawyer', async (req, res) => {
	const { name, address, mobile } = req.body;

	if (!required(name) || !required(address) || !required(mobile)) {
		return res.status(400).json({ error: 'Name, address, and mobile no are required.' });
	}

	if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
		return res.status(500).json({ error: 'Email service is not configured.' });
	}

	try {
		const transporter = createTransporter();
		const cleanName = name.trim();
		const cleanAddress = address.trim();
		const cleanMobile = mobile.trim();

		await transporter.sendMail({
			from: process.env.MAIL_FROM || process.env.SMTP_USER,
			to: recipientEmail,
			subject: 'New Lawyer Booking Request',
			text: [
				'A client is interested to book a lawyer.',
				'',
				`Name: ${cleanName}`,
				`Address: ${cleanAddress}`,
				`Mobile No: ${cleanMobile}`
			].join('\n'),
			html: `
				<h2>New Lawyer Booking Request</h2>
				<p>A client is interested to book a lawyer.</p>
				<p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
				<p><strong>Address:</strong> ${escapeHtml(cleanAddress)}</p>
				<p><strong>Mobile No:</strong> ${escapeHtml(cleanMobile)}</p>
			`
		});

		return res.json({ message: 'Booking request sent successfully.' });
	} catch (error) {
		console.error('Email send failed:', error);
		return res.status(500).json({ error: 'Unable to send email right now.' });
	}
});

app.listen(port, () => {
	console.log(`Law firm site running at http://localhost:${port}`);
});
