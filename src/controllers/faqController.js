const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// FAQS
const getPublicFaqs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = { active: true };
    if (category) where.category = category;

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    }).catch(() => []);
    return successResponse(res, faqs, 'FAQs retrieved.');
  } catch (err) {
    return successResponse(res, [], 'Fallback FAQs.');
  }
};

const getAllFaqsAdmin = async (req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }).catch(() => []);
    return successResponse(res, faqs, 'All FAQs retrieved.');
  } catch (err) {
    return successResponse(res, [], 'Fallback FAQs.');
  }
};

const createFaq = async (req, res, next) => {
  try {
    const { question, answer, category, order, active } = req.body;
    if (!question || !answer) {
      return errorResponse(res, 'Question and answer are required.', 400);
    }

    const faq = await prisma.faq.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category || 'General',
        order: order !== undefined ? parseInt(order, 10) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return successResponse(res, faq, 'FAQ created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order, active } = req.body;

    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) return errorResponse(res, 'FAQ not found.', 404);

    const updateData = {};
    if (question !== undefined) updateData.question = question.trim();
    if (answer !== undefined) updateData.answer = answer.trim();
    if (category !== undefined) updateData.category = category;
    if (order !== undefined) updateData.order = parseInt(order, 10);
    if (active !== undefined) updateData.active = Boolean(active);

    const updated = await prisma.faq.update({ where: { id }, data: updateData });
    return successResponse(res, updated, 'FAQ updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.faq.delete({ where: { id } });
    return successResponse(res, null, 'FAQ deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicFaqs,
  getAllFaqsAdmin,
  createFaq,
  updateFaq,
  deleteFaq,
};
