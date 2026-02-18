import React from 'react';
import './ChatMessage.css';

function ChatMessage({ message }) {
  const { role, content, type } = message;
  const sender = role === 'user' ? 'You' : 'Assistant';

  if (type === 'json') {
    return (
      <div className={`message ${role}-message`}>
        <strong>{sender}:</strong>
        <div className="json-response">
          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="json-field">
              <span className="json-label">{key}:</span>
              {typeof value === 'object' ? (
                <pre className="json-value">{JSON.stringify(value, null, 2)}</pre>
              ) : (
                <p className="json-value">{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`message ${role}-message`}>
      <strong>{sender}:</strong>
      <p>{content}</p>
    </div>
  );
}

export default ChatMessage;
