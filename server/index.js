import express from "express"
import cors from "cors"
import multer from "multer"
import fs from "fs";
import { Queue } from "bullmq"; 
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import  OpenAI  from "openai";
import dotenv from "dotenv"

dotenv.config()

const client = new OpenAI({apiKey:process.env.API_KEY})

const queue = new Queue("file-upload-queue",{
        connection :{
            host:"localhost",
            port:"6379"
    }})

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage =multer.diskStorage({
    destination: function (req, file , cb){
        cb(null, "uploads/")
    },
    filename:function (req, file ,cb){
        const uniqueSuffix =Date.now() + '-' + Math.round(Math.random() *1e9)
        cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
})

const upload = multer({storage});

const app=express()
app.use(cors())

app.get("/",(req,res)=>{
    return res.status(200).json({message:"All good"})
})

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  queue.add("file-ready", {
    filename: req.file.originalname,
    destination: req.file.destination,
    path: req.file.path,
  });

  return res.status(200).json({ message: "uploaded" });
});

app.get("/chat",async (req,res)=>{
    const userQuery=req.params.message
    
     const embeddings = new OpenAIEmbeddings({
       apiKey: process.env.API_KEY,
       model: "text-embedding-3-small",
     });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "langchainjs-testing",
      }
    );

    const ret= vectorStore.asRetriever({
        k:2,
    })
    const result =await ret.invoke(userQuery)

    const context = result.map((d) => d.pageContent).join("\n\n");

    const SYSTEM_PROMPT = `
    You are a helpful assistant.
    Answer ONLY from the context below.
    If not found, say "Not found in document".

    Context:
    ${context}
    `;


    const chatResult = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
    });
    return res.json({message:chatResult.choices[0].message.content,docs:result})
})

app.listen(8000,()=>{
    console.log("server on 8000")
})