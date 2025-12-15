import ChatComponent from "./components/chat";
import FileUploadComponent from "./components/file-upload";



export default function Home() {
  return (
    <div className="min-h-screen w-screen flex">
      <div className="w-[30vw] min-h-screen items-center p-4 flex justify-center">
        <FileUploadComponent />
      </div>

      <div className="w-[70vw] min-h-screen border-l-2">
        <ChatComponent/>
      </div>
    </div>
  );
}
