import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama"; 
import fs from "fs";
import path from "path";
import dotenv from "dotenv"; 

dotenv.config();

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("Job data:", job.data);

    try {
      const data = job.data;
      const pdfPath = path.resolve(data.path.replace(/\\/g, "/"));

      if (!fs.existsSync(pdfPath)) {
        console.error(" PDF file does not exist:", pdfPath);
        return;
      } 

      const loader = new PDFLoader(pdfPath);
      const docs = await loader.load();
      console.log(` PDF loaded. Pages: ${docs.length}`); 

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
  const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 150,
});

      const splitDocs = await splitter.splitDocuments(docs); 
      console.log("Adding documents to vector store...");
      await vectorStore.addDocuments(splitDocs);

      console.log(" PDF successfully indexed");
    } catch (err) {
      console.error(" Worker error:", err);
    }
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
