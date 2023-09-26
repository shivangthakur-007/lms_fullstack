import mongoose from "mongoose";

mongoose.set('strictQuery', false);

const connectionToDB=async()=>{
  try {
    const {connection}=await mongoose.connect(
        process.env.MONGO_URI || `mongodb+srv://thakurshivang579:57575751@cluster0.aj8hrur.mongodb.net/`
    );
    if (connection) {
        console.log(`Connected to Mongodb: ${connection.host}`)
    }
  }
    catch (e) {
    console.log(e)
    process.exit(1);
  }  
}

export default connectionToDB;

