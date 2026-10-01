const { generateRAGAnswer } = require('../services/ragService');
const AppError = require('../utils/customError');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    RAG Chat Interface with Evidence References
// @route   POST /api/ai/chat
// @access  Private (All Authenticated Roles)
const handleRAGChat = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return next(new AppError('Question prompt is required', 400));
    }

    const ragResult = await generateRAGAnswer(question, req.user);

    await logAudit({
      req,
      action: 'RAG_AI_CHAT_QUERY',
      newValue: { question, sourcesCount: ragResult.sourcesCount },
    });

    res.status(200).json({
      success: true,
      message: 'RAG assistant answer generated',
      data: ragResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleRAGChat };
