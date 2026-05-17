import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as messagesApi from '../api/messages';
import { Client } from '@stomp/stompjs';
import { IconMessageSquare, IconX } from './Icons';

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
          if (data.type === 'MESSAGE_DELETED') {
            setMessages(prev => prev.filter(m => m.id !== data.messageId));
          } else if (data.senderId === userIdRef.current) {
            setMessages(prev => {
              const idx = [...prev].reverse().findIndex(m =>
                m.content === data.content && typeof m.id === 'number' && m.id > 1700000000000
              );
              if (idx === -1) return [...prev, data];
              const realIdx = prev.length - 1 - idx;
              const updated = [...prev];
              updated[realIdx] = data;
              return updated;
            });
          } else {
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
      .catch(() => { })
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

  const handleDeleteMessage = async (messageId) => {
    try {
      await messagesApi.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message', err);
    }
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

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading messages...</div>;

  return (
    <div>
      <div className="chat-container">
        <div className="chat-header">
          <h2>Team Chat</h2>
          <span className={`chat-status-dot ${connected ? 'connected' : 'disconnected'}`} />
          <span className="chat-status-text">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><IconMessageSquare /></div>
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
              <div className="time-row">
                <span className="time">{formatTime(msg.sentAt)}</span>
                {msg.senderId === user?.id && (
                  <button
                    className="msg-delete-btn"
                    onClick={() => handleDeleteMessage(msg.id)}
                    title="Delete message"
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>
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
