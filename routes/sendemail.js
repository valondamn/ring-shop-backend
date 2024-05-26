const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Настройка транспорта для Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',  // Замените на ваш email
    pass: 'your-email-password'    // Замените на ваш пароль от email
  }
});

// Маршрут для отправки email
router.post('/send-email', (req, res) => {
  const { subject, body } = req.body;

  const mailOptions = {
    from: 'your-email@gmail.com',  // Замените на ваш email
    to: 'danilovvadim.0404@gmail.com',
    subject: subject,
    text: body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error occurred:', error);
      return res.status(500).json({
        message: 'Failed to send email.',
        error: error.message,
        stack: error.stack
      });
    }
    res.status(200).json({ message: 'Email sent: ' + info.response });
  });
});

module.exports = router;
