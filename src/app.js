import express from "express"
import cookieParser from "cookie-parse"

const app = express();

app.use(express.json())

app.use(express.urlencoded({extended : true},{limit : "16kb"}))

app.use(express.static("public"))

app.use(express.cookieParser())


export {app}

