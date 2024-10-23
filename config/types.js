const z = require('zod');
const mongoose = require('mongoose');


exports.userRegisterCheck = z.object({
    username: z.string().min(6, { message: 'Enter username of min 6 characters!' }),
    email: z.string().email({ message: 'Enter a valid email address!' }),  // Validates the presence of '@'
    mobile: z.string().length(10, { message: 'Mobile number must be exactly 10 digits!' }),  // Validates length
    password: z.string().min(6, { message: 'Enter password of min 6 characters!' })  // Corrected to characters
});

exports.userLoginCheck = z.object({
    email: z.string().email({ message: 'Enter a valid email address!' }),// Validates length
    password: z.string().min(6, { message: 'Enter password of min 6 characters!' })
})


exports.addEqualExpenseSchema = z.object({
    description: z.string().trim().min(1, { message: 'Description is required.' }),
    amount: z.number().positive({ message: 'Amount must be greater than 0.' }),
    participants: z.array(
        z.object({
            email: z.string().email({ message: 'Enter a valid email address!' })
        })
    ).min(1, { message: 'At least one participant is required.' }),
});


exports.addPercentageExpenseSchema = z.object({
    description: z.string().trim().min(1, { message: 'Description is required.' }), 
    amount: z.number().positive({ message: 'Amount must be greater than 0.' }),
    participants: z.array(
        z.object({
            email: z.string().email({ message: 'Enter a valid email address!' }), // Validate email
            share: z.number().positive({ message: 'Share must be greater than 0.' }) // Validate share percentage
        })
    )
    .min(1, { message: 'At least one participant is required.' }) // Ensure at least one participant
    .refine(participants => {
        const totalPercentage = participants.reduce((total, participant) => total + participant.share, 0);
        return totalPercentage === 100;
    }, {
        message: 'The total percentage must add up to 100%.',
    }),
});

// Schema for exact expense
exports.addExactExpenseSchema = z.object({
    description: z.string().trim().min(1, { message: 'Description is required.' }), // Ensure description is not empty
    amount: z.number().positive({ message: 'Amount must be greater than 0.' }), // Validate that amount is positive
    participants: z.array(
        z.object({
            email: z.string().email({ message: 'Enter a valid email address!' }), // Validate email
            share: z.number().positive({ message: 'Share must be greater than 0.' }) // Validate exact share amount
        })
    )
    .min(1, { message: 'At least one participant is required.' }) // Ensure at least one participant
});









