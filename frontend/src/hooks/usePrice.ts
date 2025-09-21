import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useWebSocket } from './useWebSocket';
import { apiService } from '../services/api';
import { PriceData, PriceUpdateMessage } from '../types';
import { PRICE_UPDATE_INTERVAL, WS_EVENTS } from '../config/constants';

export const usePrice = () => {
  const { priceData, setPriceData } = useAppStore();
  const { lastMessage } = useWebSocket();

  // Fetch initial price data
  const query = useQuery({
    queryKey: ['price'],
    queryFn: async (): Promise<PriceData> => {
      const response = await apiService.get('/stats/price?hours=1');
      return response.data.current;
    },
    refetchInterval: PRICE_UPDATE_INTERVAL,
    staleTime: PRICE_UPDATE_INTERVAL / 2,
  });

  // Update store when query data changes
  useEffect(() => {
    if (query.data) {
      setPriceData(query.data);
    }
  }, [query.data, setPriceData]);

  // Handle real-time price updates via WebSocket
  useEffect(() => {
    if (lastMessage?.type === WS_EVENTS.PRICE_UPDATE) {
      const priceUpdate = lastMessage.data as PriceUpdateMessage;
      
      const updatedPrice: PriceData = {
        price: parseFloat(priceUpdate.price),
        change24h: priceUpdate.change24h,
        volume24h: priceData?.volume24h || 0,
        marketCap: priceData?.marketCap || 0,
        lastUpdated: new Date().toISOString(),
      };
      
      setPriceData(updatedPrice);
    }
  }, [lastMessage, priceData, setPriceData]);

  return {
    data: priceData || query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
