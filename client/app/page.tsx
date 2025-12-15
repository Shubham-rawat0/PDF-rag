import ChatComponent from "./components/chat";
import FileUploadComponent from "./components/file-upload";



export default function Home() {
  return (
    <div className="min-h-screen w-screen flex bg-gray-900 text-white">
      {/* Left panel */}
      <div className="w-[30%] min-h-screen p-6 flex flex-col gap-6 border-r border-gray-700">
        <h1 className="text-xl font-semibold leading-snug h-[40%] mt-10">
          Chat with your PDFs and get accurate answers using local RAG
        </h1>
        <FileUploadComponent />
        <p className="text-sm text-gray-400 mt-10">
          Upload a PDF and ask questions. Answers are generated locally using a
          local LLM.
        </p>
      </div>

      {/* Right panel */}
      <div className="w-[70%] min-h-screen bg-[#efeae2]">
        <ChatComponent />
      </div>
    </div>
  );
}

