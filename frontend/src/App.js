import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatboxRef = useRef(null);

  const API_BASE_URL = 'https://llm-assistant-haim.onrender.com';

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const parseResponse = (response) => {
    try {
      return { content: JSON.parse(response), isJSON: true };
    } catch {
      return { content: response, isJSON: false };
    }
  };

  const fetchAndAddMessage = async (endpoint, body, userContent) => {
    setError('');
    setLoading(true);

    try {
      setMessages((prev) => [...prev, { role: 'user', content: userContent, type: 'text' }]);

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to get response from server');

      const data = await response.json();
      const { content, isJSON } = parseResponse(data.response);

      setMessages((prev) => [...prev, { role: 'assistant', content, type: isJSON ? 'json' : 'text' }]);
      setInput('');
      setFeedback('');
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    await fetchAndAddMessage('chat', { message: input }, input);
  };

  const sendFeedback = async () => {
    if (!feedback.trim()) return;
    await fetchAndAddMessage('feedback', { feedback }, feedback);
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div className="container">
      <h2>LLM Chat</h2>
      {error && <div className="error">{error}</div>}
      <div className="chatbox" ref={chatboxRef}>
        {messages.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center' }}>Start a conversation...</p>
        ) : (
          messages.map((msg, idx) => <ChatMessage key={idx} message={msg} />)
        )}
        {loading && <p style={{ color: '#999', fontStyle: 'italic' }}>Loading...</p>}
      </div>

      <div className="input-group">
        <input type="text" placeholder="Enter message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => handleKeyPress(e, sendMessage)} disabled={loading} />
        <button onClick={sendMessage} disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</button>
      </div>

      <div className="input-group">
        <input type="text" placeholder="Give feedback (e.g., 'part_c is incorrect')..." value={feedback} onChange={(e) => setFeedback(e.target.value)} onKeyPress={(e) => handleKeyPress(e, sendFeedback)} disabled={loading} />
        <button className="feedback-button" onClick={sendFeedback} disabled={loading}>{loading ? 'Sending...' : 'Send Feedback'}</button>
      </div>
    </div>
  );
}

export default App;
