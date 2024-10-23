const express = require('express');
const router = express.Router();
const { addEqualExpense, addPercentageExpense, addExactExpense, getIndividualExpenses, getOverallExpenses, getBalanceSheet } = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/addEqualExpense', authMiddleware, addEqualExpense);
router.post('/addPercentageExpense', authMiddleware, addPercentageExpense);
router.post('/addExactExpense', authMiddleware, addExactExpense);
router.get('/individualExpenses', authMiddleware, getIndividualExpenses);
router.get('/overallExpenses', authMiddleware, getOverallExpenses);
router.get('/balanceSheet', authMiddleware, getBalanceSheet);

module.exports = router;
