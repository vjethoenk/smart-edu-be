// // Example: React Chat Component
// // File: src/features/Chat/ChatWindow.tsx

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import { io, Socket } from 'socket.io-client';
// import './ChatWindow.css';

// interface Message {
//   _id: string;
//   senderId: {
//     _id: string;
//     name: string;
//     email: string;
//     avatar?: string;
//   };
//   receiverId: {
//     _id: string;
//     name: string;
//     email: string;
//     avatar?: string;
//   };
//   message: string;
//   messageType: 'text' | 'image' | 'file';
//   fileUrl?: string;
//   fileName?: string;
//   isRead: boolean;
//   readAt?: string;
//   createdAt: string;
// }

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   avatar?: string;
// }

// const ChatWindow: React.FC = () => {
//   const { courseId, receiverId } = useParams<{
//     courseId: string;
//     receiverId: string;
//   }>();

//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [typingUser, setTypingUser] = useState<string | null>(null);
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [receiver, setReceiver] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Load current user từ token
//   useEffect(() => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         setCurrentUser({
//           _id: payload.sub,
//           email: payload.email,
//           name: payload.name || payload.email,
//           avatar: payload.avatar,
//         });
//       } catch (err) {
//         console.error('Error parsing token:', err);
//       }
//     }
//   }, []);

//   // Kết nối WebSocket
//   useEffect(() => {
//     if (!currentUser) return;

//     const token = localStorage.getItem('access_token');
//     const newSocket = io('http://localhost:3000/chat', {
//       auth: { token },
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       reconnectionAttempts: 5,
//     });

//     // Connection events
//     newSocket.on('connection_success', () => {
//       console.log('✓ Connected to chat server');
//       setIsConnected(true);
//       if (courseId) {
//         newSocket.emit('joinCourse', { courseId });
//         newSocket.emit('joinPrivateChat', {
//           courseId,
//           otherUserId: receiverId,
//         });
//       }
//     });

//     newSocket.on('connect_error', (error) => {
//       console.error('Connection error:', error);
//       setError('Kết nối thất bại. Vui lòng thử lại.');
//     });

//     newSocket.on('disconnect', () => {
//       console.log('Disconnected from chat server');
//       setIsConnected(false);
//     });

//     // Message events
//     newSocket.on('newMessage', (message: Message) => {
//       // Chỉ add message nếu là tin nhắn giữa 2 user này
//       if (
//         (message.senderId._id === currentUser._id &&
//           message.receiverId._id === receiverId) ||
//         (message.senderId._id === receiverId &&
//           message.receiverId._id === currentUser._id)
//       ) {
//         setMessages((prev) => [...prev, message]);
//         scrollToBottom();

//         // Auto mark as read nếu không phải của user
//         if (message.receiverId._id === currentUser._id) {
//           newSocket.emit('markAsRead', { chatId: message._id });
//         }
//       }
//     });

//     newSocket.on('messageSent', (message: Message) => {
//       console.log('Message sent:', message);
//     });

//     newSocket.on('messageError', (error: any) => {
//       console.error('Message error:', error);
//       setError(`Lỗi gửi tin nhắn: ${error.error}`);
//     });

//     // Typing events
//     newSocket.on('userTyping', (data: any) => {
//       if (data.userId !== currentUser._id) {
//         setTypingUser(data.email);
//       }
//     });

//     newSocket.on('userStopTyping', (data: any) => {
//       if (data.userId !== currentUser._id) {
//         setTypingUser(null);
//       }
//     });

//     newSocket.on('messageRead', (data: any) => {
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg._id === data.chatId ? { ...msg, isRead: true } : msg,
//         ),
//       );
//     });

//     setSocket(newSocket);

//     return () => {
//       if (courseId) {
//         newSocket.emit('leaveCourse', { courseId });
//       }
//       newSocket.disconnect();
//     };
//   }, [currentUser, courseId, receiverId]);

//   // Load conversation history
//   useEffect(() => {
//     if (!currentUser || !receiverId) return;

//     const fetchConversation = async () => {
//       try {
//         const token = localStorage.getItem('access_token');
//         const response = await fetch(
//           `/v1/chat/conversation/${courseId}/${receiverId}?limit=50`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );

//         if (!response.ok) throw new Error('Failed to load messages');

//         const data = await response.json();
//         setMessages(data.data || []);

//         // Load receiver info
//         const userToken = localStorage.getItem('access_token');
//         const userResponse = await fetch(`/v1/user/${receiverId}`, {
//           headers: { Authorization: `Bearer ${userToken}` },
//         });

//         if (userResponse.ok) {
//           const userData = await userResponse.json();
//           setReceiver(userData.data || userData);
//         }
//       } catch (err) {
//         console.error('Error loading conversation:', err);
//         setError('Không thể tải cuộc trò chuyện');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConversation();
//   }, [currentUser, courseId, receiverId]);

//   // Scroll to bottom
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Handle input change với typing indicator
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setInputMessage(value);

//     if (!isTyping && socket && value.length > 0) {
//       setIsTyping(true);
//       socket.emit('typing', {
//         courseId,
//         receiverId,
//       });
//     }

//     // Reset typing indicator
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     typingTimeoutRef.current = setTimeout(() => {
//       if (socket && isTyping) {
//         socket.emit('stopTyping', {
//           courseId,
//           receiverId,
//         });
//         setIsTyping(false);
//       }
//     }, 2000);
//   };

//   // Send message
//   const handleSendMessage = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!inputMessage.trim() || !socket) return;

//     socket.emit('sendMessage', {
//       courseId,
//       receiverId,
//       message: inputMessage,
//       messageType: 'text',
//     });

//     setInputMessage('');
//     setIsTyping(false);

//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }
//   };

//   // Format time
//   const formatTime = (date: string) => {
//     return new Date(date).toLocaleTimeString('vi-VN', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   // Format date
//   const formatDate = (date: string) => {
//     return new Date(date).toLocaleDateString('vi-VN');
//   };

//   if (loading) {
//     return <div className="chat-loading">Đang tải...</div>;
//   }

//   return (
//     <div className="chat-container">
//       {/* Header */}
//       <div className="chat-header">
//         <div className="chat-header-info">
//           <img
//             src={receiver?.avatar || '/default-avatar.png'}
//             alt={receiver?.name}
//             className="chat-header-avatar"
//           />
//           <div className="chat-header-text">
//             <h3>{receiver?.name}</h3>
//             <span className={`status ${isConnected ? 'online' : 'offline'}`}>
//               {isConnected ? '● Online' : '● Offline'}
//             </span>
//           </div>
//         </div>
//         <div className="chat-header-actions">
//           <button className="icon-btn" title="Call">
//             📞
//           </button>
//           <button className="icon-btn" title="Video call">
//             📹
//           </button>
//           <button className="icon-btn" title="Info">
//             ℹ️
//           </button>
//         </div>
//       </div>

//       {/* Error message */}
//       {error && (
//         <div className="chat-error">
//           {error}
//           <button onClick={() => setError(null)}>✕</button>
//         </div>
//       )}

//       {/* Messages */}
//       <div className="chat-messages">
//         {messages.length === 0 ? (
//           <div className="chat-empty">
//             <p>Không có tin nhắn nào</p>
//             <p className="text-muted">Bắt đầu cuộc trò chuyện</p>
//           </div>
//         ) : (
//           <>
//             {messages.map((msg, index) => {
//               const showDate =
//                 index === 0 ||
//                 formatDate(msg.createdAt) !==
//                   formatDate(messages[index - 1].createdAt);

//               return (
//                 <React.Fragment key={msg._id}>
//                   {showDate && (
//                     <div className="chat-date-divider">
//                       {formatDate(msg.createdAt)}
//                     </div>
//                   )}

//                   <div
//                     className={`chat-message ${
//                       msg.senderId._id === currentUser?._id
//                         ? 'sent'
//                         : 'received'
//                     }`}
//                   >
//                     {msg.senderId._id !== currentUser?._id && (
//                       <img
//                         src={msg.senderId.avatar || '/default-avatar.png'}
//                         alt={msg.senderId.name}
//                         className="message-avatar"
//                       />
//                     )}

//                     <div className="message-content">
//                       <div className="message-bubble">
//                         {msg.messageType === 'text' && <p>{msg.message}</p>}

//                         {msg.messageType === 'image' && (
//                           <img src={msg.fileUrl} alt="Image" />
//                         )}

//                         {msg.messageType === 'file' && (
//                           <a href={msg.fileUrl} download={msg.fileName}>
//                             📎 {msg.fileName}
//                           </a>
//                         )}
//                       </div>

//                       <div className="message-info">
//                         <span className="message-time">
//                           {formatTime(msg.createdAt)}
//                         </span>
//                         {msg.senderId._id === currentUser?._id && (
//                           <span className="message-status">
//                             {msg.isRead ? '✓✓' : '✓'}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </React.Fragment>
//               );
//             })}

//             {/* Typing indicator */}
//             {typingUser && (
//               <div className="chat-message received">
//                 <div className="message-content">
//                   <div className="typing-indicator">
//                     <span></span>
//                     <span></span>
//                     <span></span>
//                     <p className="typing-text">{typingUser} đang gõ...</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </>
//         )}
//       </div>

//       {/* Input */}
//       <form className="chat-input-form" onSubmit={handleSendMessage}>
//         <div className="chat-input-wrapper">
//           <button
//             type="button"
//             className="icon-btn"
//             title="Attach file"
//             onClick={() => {
//               // File upload logic
//             }}
//           >
//             📎
//           </button>

//           <input
//             type="text"
//             placeholder="Nhập tin nhắn..."
//             value={inputMessage}
//             onChange={handleInputChange}
//             className="chat-input"
//             disabled={!isConnected}
//           />

//           <button
//             type="button"
//             className="icon-btn"
//             title="Emoji"
//             onClick={() => {
//               // Emoji picker logic
//             }}
//           >
//             😊
//           </button>

//           <button
//             type="submit"
//             className="send-btn"
//             disabled={!inputMessage.trim() || !isConnected}
//             title="Send message"
//           >
//             ➤
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ChatWindow;
