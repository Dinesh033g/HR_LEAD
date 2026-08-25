const Lead = require('../models/Lead');
const { assignLeads } = require('../services/assignmentService');

// @desc    Verify Webhook (WhatsApp Cloud API verification step)
// @route   GET /api/webhook/whatsapp
// @access  Public
const verifyWhatsAppWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'hr_lead_whatsapp_token_2026';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WhatsApp Webhook Verified!');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.status(200).send('WhatsApp Webhook Endpoint Ready');
};

// @desc    Receive WhatsApp Incoming Message & Auto Ingest Lead
// @route   POST /api/webhook/whatsapp
// @access  Public
const receiveWhatsAppMessage = async (req, res) => {
  try {
    const body = req.body;
    console.log('Received WhatsApp Webhook event:', JSON.stringify(body));

    let phone = '';
    let name = '';
    let messageText = '';
    let language = 'English';

    // Parse standard Meta WhatsApp Cloud API structure
    if (body.entry && body.entry[0] && body.entry[0].changes && body.entry[0].changes[0].value) {
      const value = body.entry[0].changes[0].value;
      if (value.messages && value.messages[0]) {
        const msg = value.messages[0];
        phone = msg.from; // Phone number
        
        if (value.contacts && value.contacts[0] && value.contacts[0].profile) {
          name = value.contacts[0].profile.name;
        }

        if (msg.text) {
          messageText = msg.text.body;
        }
      }
    } 
    // Parse generic / Twilio webhook format as fallback
    else if (req.body.From || req.body.phone) {
      phone = req.body.From || req.body.phone;
      name = req.body.ProfileName || req.body.name || `WhatsApp Lead ${phone.slice(-4)}`;
      messageText = req.body.Body || req.body.message || '';
    }

    if (phone) {
      // Clean phone number
      phone = phone.replace(/[^\d+]/g, '');

      // Quick language detection from message text if specified
      const knownLanguages = ['English', 'Hindi', 'Spanish', 'Tamil', 'Telugu', 'Kannada', 'French', 'German', 'Marathi'];
      for (const lang of knownLanguages) {
        if (new RegExp(`\\b${lang}\\b`, 'i').test(messageText)) {
          language = lang;
          break;
        }
      }

      // Check if lead with phone already exists
      let existingLead = await Lead.findOne({ phone });
      if (!existingLead) {
        const rawLead = [{
          name: name || `WhatsApp Lead ${phone.slice(-4)}`,
          phone,
          language,
          source: 'WhatsApp',
          status: 'New',
        }];

        const [assigned] = await assignLeads(rawLead);

        existingLead = await Lead.create({
          ...assigned,
          history: [{
            status: 'New',
            note: `Auto created via incoming WhatsApp message: "${messageText}"`,
          }]
        });

        console.log(`Auto created new WhatsApp lead for ${phone}`);
      }
    }

    // Always respond 200 OK to webhook provider
    res.status(200).json({ status: 'success', message: 'Webhook event processed' });
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    res.status(200).json({ status: 'error', error: error.message });
  }
};

module.exports = {
  verifyWhatsAppWebhook,
  receiveWhatsAppMessage,
};
