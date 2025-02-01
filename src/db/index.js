import mongoose  from "mongoose";

const connectdb = async () =>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL, {
            dbName: process.env.DB_NAME,
        });
        console.log(`database connected :- ${connectionInstance.connection.host}`);
    }
    catch(err){
        console.log(`connection failed :- ${err}`);
        process.exit(1);
    }
}

export {connectdb};
