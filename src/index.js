// require('dotenv').config({path: './env'})
import dotenv from 'dotenv';
dotenv.config({
  path: './.env'
});
import {dbConnect} from "./db/index.js";
import {app} from "./app.js"

const port = process.env.PORT || 3001
dbConnect().then(()=>{
  app.listen(port , ()=>{
    console.log(`server is runnung at port : ${port}`)
  })
})
.catch((error)=>{
  console.log("Error while connecting to the database", error);
})
