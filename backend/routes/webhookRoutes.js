const express = require('express');
const router = express.Router();
const { verifyWhatsAppWebhook, receiveWhatsAppMessage } = require('../controllers/webhookController');

router.get('/whatsapp', verifyWhatsAppWebhook);
router.post('/whatsapp', receiveWhatsAppMessage);

module.exports = router;
