const Expense = require('../models/Expense'); // Adjust the import based on your file structure
const types = require('../config/types');
const User = require('../models/User')
// Controller for adding equal expense
exports.addEqualExpense = async (req, res, next) => {
    const body = req.body;
    const validation = types.addEqualExpenseSchema.safeParse(body);

    if (!validation.success) {
        return res.status(400).json({
            message: validation.error.errors[0].message,
        });
    }

    const { description, amount, participants } = body;

    try {
        // Look up each participant by email
        const participantIds = await Promise.all(
            participants.map(async (participant) => {
                const user = await User.findOne({ email: participant.email });
                if (!user) {
                    throw new Error(`User with email ${participant.email} not found.`);
                }
                return user._id;
            })
        );

        // Calculate share for each participant
        const share = amount / participantIds.length;

        // Create the expense object
        const expense = new Expense({
            description,
            amount,
            created_by: req.user.id, 
            participants: participantIds.map(userId => ({
                user: userId,
                share,
            })),
            split_method: 'equal',
            total_participants: participantIds.length,
        });

        // Save the expense to the database
        await expense.save();

        res.status(201).json({ message: 'Equal Expense added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Server error. Please try again later.' });
    }
};

exports.addPercentageExpense = async (req, res, next) => {
    const body = req.body;
    const validation = types.addPercentageExpenseSchema.safeParse(body);

    if (!validation.success) {
        return res.status(400).json({
            message: validation.error.errors[0].message,
        });
    }

    const { description, amount, participants } = body;

    try {
        // Look up each participant by email and ensure they exist
        const participantIds = await Promise.all(
            participants.map(async (participant) => {
                const user = await User.findOne({ email: participant.email });
                if (!user) {
                    throw new Error(`User with email ${participant.email} not found.`);
                }
                return user._id;
            })
        );

        // Calculate shares for each participant based on the provided percentage
        const participantsWithShares = participants.map((participant, index) => {
            const shareAmount = (amount * participant.share) / 100; // Calculate the share amount
            return {
                user: participantIds[index],
                share: shareAmount, // Assign the calculated share amount
            };
        });

        // Create the expense object
        const expense = new Expense({
            description,
            amount,
            created_by: req.user.id, // Assuming req.user contains authenticated user's info
            participants: participantsWithShares,
            split_method: 'percentage',
            total_participants: participantIds.length,
        });

        // Save the expense to the database
        await expense.save();

        res.status(201).json({ message: 'Percentage expense added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Server error. Please try again later.' });
    }
};

exports.addExactExpense = async (req, res, next) => {
    const body = req.body;
    const validation = types.addExactExpenseSchema.safeParse(body);

    if (!validation.success) {
        return res.status(400).json({
            message: validation.error.errors[0].message, 
        });
    }

    const { description, amount, participants } = body;

    try {
        // Calculate total share from participants
        const totalShare = participants.reduce((total, participant) => total + participant.share, 0);

        // Check if total share matches the amount
        if (totalShare !== amount) {
            return res.status(400).json({
                message: 'The total exact amounts must add up to the total expense amount.',
            });
        }

        // Look up each participant by email and ensure they exist
        const participantIds = await Promise.all(
            participants.map(async (participant) => {
                const user = await User.findOne({ email: participant.email });
                if (!user) {
                    throw new Error(`User with email ${participant.email} not found.`);
                }
                return user._id;
            })
        );

        // Create the expense object
        const expense = new Expense({
            description,
            amount,
            created_by: req.user.id,
            participants: participants.map((participant, index) => ({
                user: participantIds[index],
                share: participant.share, 
            })),
            split_method: 'exact',
            total_participants: participantIds.length,
        });

        // Save the expense to the database
        await expense.save();

        res.status(201).json({ message: 'Exact expense added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error. Please try again later.' });
    }
};

// Controller to get expenses where the user paid and others owe him money
exports.getIndividualExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ created_by: req.user._id });

        // Calculate the total amount the user has spent on others
        const totalAmountSpent = expenses.reduce((total, expense) => {
            return total + expense.amount; // Add the full amount of each expense paid by the user
        }, 0);

        // Sending the fetched expenses and total amount spent as a JSON response
        res.status(200).json({ expenses, totalAmountSpent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller to get expenses where the logged in user paid as well as those expenses where someone else paid on his/her behalf.
exports.getOverallExpenses = async (req, res) => {
    try {
        // Fetch expenses where the user is a participant
        const participantExpenses = await Expense.find({ 'participants.user': req.user._id });
        
        // Fetch expenses where the user has paid
        const paidExpenses = await Expense.find({ created_by: req.user._id });

        // Calculate the total amount the user owes 
        const totalOwed = participantExpenses.reduce((total, expense) => {
            const participant = expense.participants.find(p => p.user.toString() === req.user._id.toString());
            return total + (participant ? participant.share : 0); 
        }, 0);

        const totalPaid = paidExpenses.reduce((total, expense) => {
            return total + expense.amount;
        }, 0);

        res.status(200).json({
            participantExpenses,
            paidExpenses,
            totalOwed,
            totalPaid
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getBalanceSheet = async (req, res) => {
    try {
        const participantExpenses = await Expense.find({ 'participants.user': req.user._id });

        const paidExpenses = await Expense.find({ created_by: req.user._id });

        const balances = {};

        // Calculate how much the user owes to others
        participantExpenses.forEach(expense => {
            // The creator of the expense
            const creatorId = expense.created_by.toString();

            expense.participants.forEach(participant => {
                const participantId = participant.user.toString();

                // If the logged-in user is the participant and not the creator
                if (participantId === req.user._id.toString()) {
                    // Check if the user owes the creator
                    if (!balances[creatorId]) {
                        const creator = expense.created_by;  // Get the creator
                        balances[creatorId] = { 
                            id: creatorId,
                            owesYou: 0, 
                            youOwe: 0 
                        };
                    }
                    balances[creatorId].youOwe += participant.share || 0; // Add what the user owes to the creator
                }
            });
        });

        // Calculate how much others owe to the user
        paidExpenses.forEach(expense => {
            expense.participants.forEach(participant => {
                const participantId = participant.user.toString();

                // If the logged-in user is the creator and not the participant
                if (participantId !== req.user._id.toString()) {
                    if (!balances[participantId]) {
                        balances[participantId] = { 
                            id: participantId, 
                            owesYou: 0, 
                            youOwe: 0 
                        };
                    }
                    balances[participantId].owesYou += participant.share || 0; // Add what the participant owes to the user
                }
            });
        });

        // Create the final balance sheet
        const balanceSheet = Object.values(balances).map(balance => {
            const netAmount = balance.owesYou - balance.youOwe;
            return {
                id: balance.id,
                owesYou: netAmount > 0 ? netAmount : 0,   // Positive amount means they owe you
                youOwe: netAmount < 0 ? Math.abs(netAmount) : 0 // Negative amount means you owe them
            };
        });
        res.status(200).json(balanceSheet);
    } catch (error) {
        console.error('Error fetching balance sheet:', error);
        res.status(500).json({ error: error.message || 'Server error. Please try again later.' });
    }
};
