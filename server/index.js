import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings, Ollama } from "@langchain/ollama";

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: "6379",
  },
});

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  return res.status(200).json({ message: "All good" });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  queue.add("file-ready", {
    filename: req.file.originalname,
    destination: req.file.destination,
    path: req.file.path,
  });

  return res.status(200).json({ message: "uploaded" });
});

app.get("/chat", async (req, res) => {
  try {
    const userQuery = req.query.message;

    if (!userQuery) {
      return res.status(400).json({ message: "Query is required" });
    }

    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text",
      baseUrl: "http://localhost:11434",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "langchainjs-testing",
      }
    );

    const retriever = vectorStore.asRetriever({ k: 3 });
    
    const result = await retriever.invoke(userQuery);

    if (result.length === 0) {
      return res.json({
        message: "Not found in document",
        docs: [],
      });
    }

    const context = result.map((d) => d.pageContent).join("\n\n");

    const llm = new Ollama({
      model: "phi3",
      baseUrl: "http://localhost:11434",
      temperature: 0.2,
    });

    const answer = await llm.invoke(`
You are a helpful assistant.
Answer ONLY from the context below.
If not found, say "Not found in document".

Context:
${context}

Question:
${userQuery}
`);

    return res.json({
      message: answer,
      docs: result,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(8000, () => {
  console.log("server on 8000");
});
