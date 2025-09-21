import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useWebSocket } from './useWebSocket';
import { apiService } from '../services/api';
import { Round, RoundUpdateMessage } from '../types';
import { REFRESH_INTERVAL, WS_EVENTS } from '../config/constants';

export const useCurrentRound = () => {
  const { currentRound, setCurrentRound } = useAppStore();
  const { lastMessage } = useWebSocket();

  // Fetch current round data
  const query = useQuery({
    queryKey: ['currentRound'],
    queryFn: async (): Promise<Round | null> => {
      const response = await apiService.getCurrentRound();
      return response.data;
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL / 2,
  });

  // Update store when query data changes
  useEffect(() => {
    if (query.data) {
      setCurrentRound(query.data);
    }
  }, [query.data, setCurrentRound]);

  // Handle real-time round updates via WebSocket
  useEffect(() => {
    if (lastMessage?.type === WS_EVENTS.ROUND_STARTED) {
      const roundUpdate = lastMessage.data as RoundUpdateMessage;
      // Refetch current round data when a new round starts
      query.refetch();
    }

    if (lastMessage?.type === WS_EVENTS.ROUND_LOCKED) {
      const roundUpdate = lastMessage.data as RoundUpdateMessage;
      if (currentRound && currentRound.roundId === roundUpdate.roundId) {
        setCurrentRound({
          ...currentRound,
          state: 'LOCKED',
          lockPrice: roundUpdate.lockPrice,
        });
      }
    }

    if (lastMessage?.type === WS_EVENTS.ROUND_RESOLVED) {
      const roundUpdate = lastMessage.data as RoundUpdateMessage;
      if (currentRound && currentRound.roundId === roundUpdate.roundId) {
        setCurrentRound({
          ...currentRound,
          state: 'RESOLVED',
          resolved: true,
          endPrice: roundUpdate.endPrice,
          winningPosition: roundUpdate.winningPosition,
        });
      }
    }
  }, [lastMessage, currentRound, setCurrentRound, query]);

  return {
    data: currentRound || query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
