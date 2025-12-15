import { Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
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
      console.log(`PDF loaded. Pages: ${docs.length}`);

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

      console.log(" Adding documents to vector store...");
      const splitter = new CharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await splitter.splitDocuments(docs);
      await vectorStore.addDocuments(splitDocs);
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
