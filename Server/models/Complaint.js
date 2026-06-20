const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Road Damage', 'Garbage', 'Water Leakage', 'Electricity', 'Others']
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        priorityChangedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Submitted', 'Assigned', 'In Progress', 'Resolved'],
            default: 'Submitted'
        },
        image: {
            type: String,
            default: ''
        },
        latitude: {
            type: Number,
            required: [true, 'Latitude is required']
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required']
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator User reference is required']
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Complaint', complaintSchema);
