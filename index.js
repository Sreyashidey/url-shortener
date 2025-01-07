const express= require("express");
const app=express();
const{connectToMongoDB}= require("./connect");
const URL= require('./models/url');
const path=require("path");
const cookieParser=require("cookie-parser");
const{checkForAuthentication,restrictTo} =require('./middlewares/auth');

const urlRoute= require('./routes/url'); 
const staticRoute= require("./routes/staticRouter");
const userRoute=require("./routes/user");

const PORT= 8001;

connectToMongoDB('mongodb://localhost:27017/short-url')
.then(()=> console.log('Mongodb connected')
);

app.set("view engine","ejs");
app.set('views',path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(checkForAuthentication);


app.use("/url",restrictTo(["NORMAL",'ADMIN']), urlRoute);
app.use("/",staticRoute);
app.use("/user",userRoute);

app.get("/test", async (req,res) =>{
  const allUrls=await URL.find({});
  return res.end(`
    <html>
    <head></head>
    <body>
    <ol>
    ${allUrls.map(url =>`<li>${url.shortId}</li>`).join('')}
    </body>
    </html>
    `);
})
app.get("/url/:shortId",async (req,res)=>{
  const shortId = req.params.shortId;
  const entry= await URL.findOneAndUpdate({
     shortId
  },{$push: {
    visitHistory: {
        timestamp: Date.now(),
    },
  },
 }
); 
res.redirect(entry.redirectURL);
})

app.listen(PORT,() => console.log(`Server started at PORT: ${PORT}`))