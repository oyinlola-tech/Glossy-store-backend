const { ContactMessage } = require('../models');

exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    const senderName = name || req.user?.name;
    const senderEmail = email || req.user?.email;

    if (!senderName || !senderEmail || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    const contact = await ContactMessage.create({
      user_id: req.user ? req.user.id : null,
      name: senderName,
      email: senderEmail,
      message,
    });
    res.status(201).json({ message: 'Message sent', contact });
  } catch (err) {
    next(err);
  }
};
