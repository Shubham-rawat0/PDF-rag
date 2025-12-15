# PDF-RAG – AI-Powered PDF Question Answering System

PDF-RAG is a developer-friendly Retrieval-Augmented Generation (RAG) application that allows users to upload PDF documents and ask natural-language questions about their content. The system extracts text from PDFs, converts it into vector embeddings, stores them in a vector database, and uses an LLM to generate accurate, context-aware answers.
# Features
🔹 PDF Upload & Processing

Upload PDF files via REST API

Background processing using a job queue

Automatic text extraction from PDFs

🔹 Text Chunking & Embeddings

Splits PDF content into semantic chunks

Generates vector embeddings using OpenAI Embeddings

Stores embeddings in Qdrant vector database

🔹 Semantic Search (RAG)

Converts user queries into embeddings

Retrieves top-K relevant chunks from Qdrant

Ensures answers are grounded in document context

🔹 AI-Powered Chat

Uses OpenAI Chat Completion API

Answers strictly based on retrieved PDF content

Prevents hallucinations with context-restricted prompts

🔹 Asynchronous & Scalable

PDF ingestion handled by BullMQ workers

Server remains responsive during heavy processing

Suitable for large documents and multiple uploads

# Tech Stack
Frontend	          Next.js
Backend             Node.js + Express
Queue               BullMQ
Vector-Database    	Qdrant (Self-hosted)
Embeddings	        OpenAI Embeddings
LLM	                OpenAI Chat API
PDF Parsing	        LangChain PDFLoader
Text Splitting	    LangChain Text Splitters

# How It Works
1️⃣ PDF Upload

User uploads a PDF file through the /upload/pdf endpoint.

The file is:

Saved locally

Added to a BullMQ job queue for background processing

2️⃣ Background PDF Ingestion (Worker)

The worker:

Loads the PDF using PDFLoader

Splits text into overlapping chunks

Converts chunks into vector embeddings

Stores embeddings in Qdrant

This step runs once per PDF.

3️⃣ User Query & Retrieval

When a user asks a question:

The query is converted into an embedding

Qdrant performs semantic similarity search

Top-K relevant chunks are retrieved

4️⃣ Context-Aware Answer Generation

The retrieved chunks are passed to the LLM with a strict system prompt:

Answer only from the provided context

Say “Not found in document” if information is missing

The response is returned to the frontend chat UI.

# Run Locally

Anyone can clone and run the project:

git clone https://github.com/Shubham-rawat0/PDF-rag.git
cd PDF-rag
npm install
Start required services
Redis / Valkey ,Qdrant



