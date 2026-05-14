import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as messagesApi from '../api/messages';
import { Client } from '@stomp/stompjs';

export default function Chat({ projectId }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const userIdRef = useRef(user?.id);

  userIdRef.current = user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const client = new Client({
      brokerURL: `ws://localhost:8080/ws?token=${token}`,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/project/${projectId}`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.senderId !== userIdRef.current) {
            setMessages(prev => [...prev, data]);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false)
    });

    clientRef.current?.deactivate();
    client.activate();
    clientRef.current = client;

    messagesApi.getMessageHistory(projectId)
      .then(res => {
        setMessages(res.data);
        setTimeout(scrollToBottom, 100);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      client.deactivate();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !clientRef.current?.connected) return;

    const msgPayload = { content: text, fileUrl: null, fileName: null };

    const optimistic = {
      id: Date.now(),
      projectId,
      senderId: user?.id,
      senderName: user?.email || 'You',
      content: text,
      sentAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimistic]);

    clientRef.current.publish({
      destination: `/app/chat/${projectId}`,
      body: JSON.stringify(msgPayload)
    });

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) return <div className="loading-screen">Loading messages...</div>;

  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Team Chat</h2>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected ? '#22c55e' : '#ef4444',
          display: 'inline-block'
        }} />
        <span style={{ fontSize: 12, color: '#64748b' }}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`chat-message ${msg.senderId === user?.id ? 'own' : 'other'}`}
            >
              {msg.senderId !== user?.id && (
                <div className="sender">{msg.senderName}</div>
              )}
              <div>{msg.content}</div>
              <div className="time">{formatTime(msg.sentAt)}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? 'Type a message...' : 'Reconnecting...'}
            disabled={!connected}
          />
          <button className="btn btn-primary btn-sm" onClick={sendMessage} disabled={!connected || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
