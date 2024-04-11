import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const dbConnect = async()=>{
    try{
        const connectInstance = await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`)
        console.log(`DB Connected to host: ${connectInstance.connection.host}`);

    }catch(error){
        console.error(`Db connection Error ${error}`);
        process.exit(1)
    }
}
