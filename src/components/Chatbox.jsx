import { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Khởi tạo Gemini AI bằng Key trong file .env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý AI chuyên về thiết bị dầu khí. Tôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Hàm tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Hiển thị tin nhắn của User ngay lập tức
    const newMessages = [...messages, { sender: "user", text: inputMessage }];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      // 2. Chọn Model (Gemini 2.5 Flash cực nhanh và miễn phí)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 3. Gắn "Não" (Prompt) để định hướng AI trả lời cho chuẩn chuyên ngành
      const prompt = `
        Bạn là trợ lý ảo AI chuyên nghiệp của hệ thống quản lý thiết bị dầu khí.
        Nhiệm vụ của bạn là giải đáp ngắn gọn, súc tích và lịch sự các câu hỏi của kỹ sư.
        Câu hỏi của kỹ sư: "${inputMessage}"
      `;

      // 4. Gửi câu hỏi lên Google và chờ kết quả
      const result = await model.generateContent(prompt);
      const botReply = await result.response.text();

      // Hiển thị câu trả lời của AI
      setMessages([...newMessages, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Lỗi AI:", error);
      setMessages([
        ...newMessages,
        {
          sender: "bot",
          text: "Lỗi kết nối đến Google Gemini. Vui lòng kiểm tra lại API Key hoặc mạng internet!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Nút Bong Bóng nổi góc dưới màn hình */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-blue-700 transition-transform hover:scale-110 z-50"
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={28} />}
      </button>

      {/* Khung cửa sổ Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-[#0d1117] border-b border-gray-700 p-4 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-full text-white">
              <FaRobot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Trợ Lý AI</h3>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Sẵn sàng hỗ trợ
              </p>
            </div>
          </div>

          {/* Khu vực hiển thị tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1117]/50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-[#21262d] text-gray-200 border border-gray-700 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Hiệu ứng gõ chữ (Loading) khi chờ AI trả lời */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#21262d] text-gray-400 p-3 rounded-2xl rounded-bl-none text-xs flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  >
                    ●
                  </span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  >
                    ●
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Khu vực nhập câu hỏi */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#161b22] border-t border-gray-700 flex items-center gap-2"
          >
            <input
              type="text"
              className="flex-1 bg-[#0d1117] text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Nhập câu hỏi tại đây..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              <FaPaperPlane size={14} className="-ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
