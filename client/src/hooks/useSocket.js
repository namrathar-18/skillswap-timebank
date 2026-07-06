import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Shared socket connection authenticated with the member's JWT.
 * Reconnects automatically; consumers subscribe via the returned ref.
 */
export function useSocket(onMessage) {
  const socketRef = useRef(null);
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    const token = localStorage.getItem('skillswap_token');
    const socket = io('/', { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('message:new', (msg) => handlerRef.current?.(msg));

    return () => socket.disconnect();
  }, []);

  return socketRef;
}
