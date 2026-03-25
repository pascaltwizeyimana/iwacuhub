import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiSend, FiUsers, FiSearch, FiUserPlus, FiMessageCircle } from "react-icons/fi";


export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  if (!user) {
    navigate("/login");
    return null;
  }

  const chats = [
    { id: 1, name: "Rwanda Community", avatar: "🇷🇼", lastMessage: "Welcome to IwacuHub!", time: "2m ago", unread: 3 },
    { id: 2, name: "Kigali Creators", avatar: "🏙️", lastMessage: "Great content today!", time: "1h ago", unread: 0 },
    { id: 3, name: "Gorilla Trekking", avatar: "🦍", lastMessage: "Amazing experience!", time: "3h ago", unread: 1 },
  ];

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { text: message, sender: user.username, time: new Date().toLocaleTimeString() }]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex">
        {/* Chat List */}
        <div className="w-80 bg-white dark:bg-gray-800 rounded-l-2xl shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FiMessageCircle /> Messages
            </h2>
            <div className="relative mt-3">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  activeChat?.id === chat.id ? "bg-gray-50 dark:bg-gray-700" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center text-2xl">
                    {chat.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-800 dark:text-white">{chat.name}</span>
                      <span className="text-xs text-gray-500">{chat.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{chat.unread}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-r-2xl shadow-lg flex flex-col">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center text-xl">
                  {activeChat.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">{activeChat.name}</h3>
                  <p className="text-xs text-green-500">Online</p>
                </div>
                <button className="ml-auto text-gray-500 hover:text-gray-700">
                  <FiUserPlus />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === user.username ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs p-3 rounded-2xl ${
                      msg.sender === user.username
                        ? "bg-gradient-to-r from-yellow-400 to-green-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-yellow-400 to-green-500 text-white px-6 rounded-xl hover:shadow-lg transition"
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}