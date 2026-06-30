import React, { useState } from 'react';
import { FaPaperPlane, FaRobot, FaTimes } from 'react-icons/fa';
import api from '../services/api';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chao!\nToi co the ho tro ban hoc tap nhu the nao?',
    },
  ]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        message: trimmedMessage,
        history: messages.map((item) => ({
          role: item.sender === 'bot' ? 'assistant' : 'user',
          content: item.text,
        })),
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: response.data.reply || 'Toi chua co cau tra loi phu hop.',
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: error.response?.data?.message || 'Dang co loi khi ket noi AI. Ban thu lai sau nhe.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open chatbot"
        title="Open chatbot"
      >
        <FaRobot />
      </button>
    );
  }

  return (
    <aside className="chatbot-widget" aria-label="Chatbot assistant">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <span className="chatbot-avatar">
            <FaRobot />
          </span>
          <div>
            <strong>ChatBot</strong>
            <span>Online</span>
          </div>
        </div>
        <button
          type="button"
          className="chatbot-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close chatbot"
          title="Close chatbot"
        >
          <FaTimes />
        </button>
      </div>

      <div className="chatbot-body">
        {messages.map((item) => (
          <div className={`chatbot-message-row ${item.sender}`} key={item.id}>
            {item.sender === 'bot' && (
              <span className="chatbot-mini-avatar">
                <FaRobot />
              </span>
            )}
            <div className="chatbot-bubble">{item.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chatbot-message-row bot">
            <span className="chatbot-mini-avatar">
              <FaRobot />
            </span>
            <div className="chatbot-bubble chatbot-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <form className="chatbot-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your message..."
          aria-label="Type your message"
          disabled={isLoading}
        />
        <button type="submit" aria-label="Send message" title="Send message" disabled={isLoading}>
          <FaPaperPlane />
        </button>
      </form>
    </aside>
  );
};

export default ChatBox;
