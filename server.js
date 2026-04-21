require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((err) => {
    if (err) {
        console.error('SMTP transporter verification failed:', err.message);
    } else {
        console.log('SMTP transporter ready');
    }
});

const BOOKING_RECIPIENT = process.env.BOOKING_RECIPIENT || 'manyasingh5677@gmail.com';

app.post('/api/booking', async (req, res) => {
    const { name, phone, email, type, message } = req.body || {};

    if (!name || !phone || !type) {
        return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    const typeLabels = {
        bouquet: 'Handmade Bouquet',
        decor: 'Floral Decor',
        wedding: 'Wedding Arrangement',
        gift: 'Gift / Special Occasion',
        custom: 'Custom / Other',
    };
    const prettyType = typeLabels[type] || type;

    const escape = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));

    const html = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; background: #fdf8f4; color: #2a1a10; border-radius: 12px;">
            <h2 style="margin: 0 0 16px; font-family: 'Cormorant Garamond', Georgia, serif; color: #7a3f1d;">New Booking Request</h2>
            <p style="margin: 0 0 24px; color: #555;">You have a new booking request from the Artisan &amp; Co website.</p>
            <table style="width:100%; border-collapse: collapse;">
                <tr><td style="padding:8px 0; width:140px; color:#888;">Name</td><td style="padding:8px 0;"><strong>${escape(name)}</strong></td></tr>
                <tr><td style="padding:8px 0; color:#888;">Phone / WhatsApp</td><td style="padding:8px 0;">${escape(phone)}</td></tr>
                <tr><td style="padding:8px 0; color:#888;">Email</td><td style="padding:8px 0;">${escape(email || '—')}</td></tr>
                <tr><td style="padding:8px 0; color:#888;">Category</td><td style="padding:8px 0;">${escape(prettyType)}</td></tr>
                <tr><td style="padding:8px 0; vertical-align:top; color:#888;">Details</td><td style="padding:8px 0; white-space:pre-wrap;">${escape(message || '—')}</td></tr>
            </table>
        </div>
    `;

    const text = `New Booking Request\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email || '-'}\nCategory: ${prettyType}\n\nDetails:\n${message || '-'}`;

    try {
        await transporter.sendMail({
            from: `"Artisan & Co Website" <${process.env.EMAIL_USER}>`,
            to: BOOKING_RECIPIENT,
            replyTo: email || undefined,
            subject: `New Booking: ${prettyType} — ${name}`,
            text,
            html,
        });
        res.json({ ok: true });
    } catch (err) {
        console.error('Failed to send booking email:', err);
        res.status(500).json({ ok: false, error: 'Failed to send email.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
