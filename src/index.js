import {app} from "./app.js";
import dotenv from "dotenv";
import { connectdb } from "./db/index.js";

dotenv.config({
    path : '../env'
});

connectdb()
.then(()=>{
    app.on('error',(error)=>{
        console.log('ERRR ' , error);
        throw error;  
    });
    app.listen(process.env.PORT || 4000 , ()=>{
        console.log('Server is running at port : ', process.env.PORT);
    });
})
.catch((error)=>{
    console.log('MongoDB connection error : ', error);
})