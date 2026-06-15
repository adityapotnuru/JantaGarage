const mongoose= require('mongoose');

const connectDB =  async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        //event listeners
        mongoose.connection.on('error',(err)=>{
            console.error(`❌ MongoDB Connection Error`,err);
        });

        mongoose.connection.on('disconnected',()=>{
            console.warn(`⚠️  MongoDB disconnected`);
        });
    } catch(error){
        console.error('❌ MongoDB Connection Failed:', error.message);
    }
};

module.exports = connectDB;