const Complaint = require('../models/Complaint');

const runAutoEscalation = async () => {
    try {
        console.log('⏰ [AutoEscalation] Running auto-escalation checks...');
        
        // 1. Escalate Low -> Medium (after 4 days)
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
        
        const lowToMediumComplaints = await Complaint.find({
            status: 'Submitted',
            priority: 'Low',
            priorityChangedAt: { $lt: fourDaysAgo }
        });
        
        for (const complaint of lowToMediumComplaints) {
            complaint.priority = 'Medium';
            complaint.priorityChangedAt = new Date();
            await complaint.save();
            console.log(`🚀 [AutoEscalation] Escalated complaint "${complaint.title}" (${complaint._id}) from Low to Medium`);
        }
        
        // 2. Escalate Medium -> High (after 2 days)
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        const mediumToHighComplaints = await Complaint.find({
            status: 'Submitted',
            priority: 'Medium',
            priorityChangedAt: { $lt: twoDaysAgo }
        });
        
        for (const complaint of mediumToHighComplaints) {
            complaint.priority = 'High';
            complaint.priorityChangedAt = new Date();
            await complaint.save();
            console.log(`🔥 [AutoEscalation] Escalated complaint "${complaint.title}" (${complaint._id}) from Medium to High`);
        }
        
        console.log(`✅ [AutoEscalation] Auto-escalation checks completed. Low->Med: ${lowToMediumComplaints.length}, Med->High: ${mediumToHighComplaints.length}`);
        return {
            lowToMedium: lowToMediumComplaints.length,
            mediumToHigh: mediumToHighComplaints.length
        };
    } catch (error) {
        console.error('❌ [AutoEscalation] Error running auto-escalation:', error);
        throw error;
    }
};

// Start the scheduler
const startEscalationScheduler = () => {
    // Run immediately on startup (with a small delay to ensure DB connection is ready)
    setTimeout(runAutoEscalation, 5000);
    
    // Run periodically (every 1 hour)
    setInterval(runAutoEscalation, 60 * 60 * 1000);
};

module.exports = {
    runAutoEscalation,
    startEscalationScheduler
};
