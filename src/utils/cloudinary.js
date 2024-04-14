import {v2 as cloudinary} from "cloudinary";

import fs from "fs"; 

          
cloudinary.config({ 
  cloud_name: Process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async(localFilePath)=>{
    try{
        if(!localhost) return null;

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        }) 
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    }catch(err){
        // fs.unlinkSync(localFilePath)
        return null;
    }
} 
export {uploadOnCloudinary};