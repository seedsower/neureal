import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/appStore';
import { WebSocketMessage } from '../types';
import { WS_URL, WS_EVENTS } from '../config/constants';

export const useWebSocket = () => {
  const { address } = useAccount();
  const { addNotification } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
      
      // Authenticate if wallet is connected
      if (address) {
        socket.emit(WS_EVENTS.AUTHENTICATE, { address });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Message handlers
    socket.on(WS_EVENTS.PRICE_UPDATE, (data) => {
      setLastMessage({ type: WS_EVENTS.PRICE_UPDATE, data, timestamp: Date.now() });
    });

    socket.on(WS_EVENTS.ROUND_STARTED, (data) => {
      setLastMessage({ type: WS_EVENTS.ROUND_STARTED, data, timestamp: Date.now() });
      addNotification({
        type: 'info',
        title: 'New Round Started',
        message: `Round ${data.roundId} has started! Make your prediction now.`,
      });
    });

    socket.on(WS_EVENTS.ROUND_LOCKED, (data) => {
      setLastMessage({ type: WS_EVENTS.ROUND_LOCKED, data, timestamp: Date.now() });
      addNotification({
        type: 'warning',
        title: 'Round Locked',
        message: `Round ${data.roundId} is now locked. No more predictions accepted.`,
      });
    });

    socket.on(WS_EVENTS.ROUND_RESOLVED, (data) => {
      setLastMessage({ type: WS_EVENTS.ROUND_RESOLVED, data, timestamp: Date.now() });
      addNotification({
        type: 'success',
        title: 'Round Resolved',
        message: `Round ${data.roundId} has been resolved. ${data.winningPosition} won!`,
      });
    });

    socket.on(WS_EVENTS.PREDICTION_MADE, (data) => {
      setLastMessage({ type: WS_EVENTS.PREDICTION_MADE, data, timestamp: Date.now() });
    });

    socket.on(WS_EVENTS.PREDICTION_CONFIRMED, (data) => {
      setLastMessage({ type: WS_EVENTS.PREDICTION_CONFIRMED, data, timestamp: Date.now() });
      addNotification({
        type: 'success',
        title: 'Prediction Confirmed',
        message: `Your ${data.position} prediction for ${data.amount} NEURAL has been confirmed!`,
      });
    });

    socket.on(WS_EVENTS.REWARD_CLAIMED, (data) => {
      setLastMessage({ type: WS_EVENTS.REWARD_CLAIMED, data, timestamp: Date.now() });
      addNotification({
        type: 'success',
        title: 'Reward Claimed',
        message: `You've successfully claimed ${data.amount} NEURAL tokens!`,
      });
    });

    socket.on(WS_EVENTS.USER_DATA, (data) => {
      setLastMessage({ type: WS_EVENTS.USER_DATA, data, timestamp: Date.now() });
    });

    socket.on(WS_EVENTS.NOTIFICATION, (data) => {
      addNotification(data);
    });

    socket.on(WS_EVENTS.ERROR, (data) => {
      console.error('WebSocket error:', data);
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: data.message || 'An error occurred with the real-time connection.',
      });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [address, addNotification]);

  // Authenticate when wallet connects
  useEffect(() => {
    if (socketRef.current && isConnected && address) {
      socketRef.current.emit(WS_EVENTS.AUTHENTICATE, { address });
    }
  }, [address, isConnected]);

  // Send message function
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', message);
    }
  }, [isConnected]);

  // Subscribe to rooms
  const subscribe = useCallback((rooms: string[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(WS_EVENTS.SUBSCRIBE, { rooms });
    }
  }, [isConnected]);

  // Unsubscribe from rooms
  const unsubscribe = useCallback((rooms: string[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(WS_EVENTS.UNSUBSCRIBE, { rooms });
    }
  }, [isConnected]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe,
  };
};
