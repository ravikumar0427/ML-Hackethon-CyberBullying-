const MLUtils = require('../utils/mlutils');
const Message = require('../models/Message');

exports.analyzeMessage = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Get prediction from ML model
    const prediction = await MLUtils.predictMessage(text);
    
    // Save to database (optional)
    const message = new Message({
      text,
      isBullying: prediction.is_bullying,
      confidence: prediction.confidence,
      userId: req.user?.id,
      timestamp: new Date()
    });
    
    await message.save();

    // Emit alert if cyberbullying detected
    if (prediction.is_bullying && prediction.confidence > 0.7) {
      req.io.emit('alert', {
        message: 'Cyberbullying detected',
        content: text,
        confidence: prediction.confidence,
        timestamp: new Date()
      });
    }

    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to analyze message' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};