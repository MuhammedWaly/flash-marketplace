import { useState, useEffect, useRef } from 'react';
import { orderHubService } from '../services/orderHubService';
import { useAuth } from '../context/AuthContext';

/**
 * useOrderHub Hook
 * Connects component to SignalR order events with auto cleanup.
 */
export function useOrderHub({ onOrderReceived, onOrderStatusChanged, restaurantId } = {}) {
  const { isAuthenticated, token } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState(
    orderHubService.isConnected() ? 'connected' : 'disconnected'
  );

  const onOrderReceivedRef = useRef(onOrderReceived);
  const onOrderStatusChangedRef = useRef(onOrderStatusChanged);

  useEffect(() => {
    onOrderReceivedRef.current = onOrderReceived;
  }, [onOrderReceived]);

  useEffect(() => {
    onOrderStatusChangedRef.current = onOrderStatusChanged;
  }, [onOrderStatusChanged]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      orderHubService.stop();
      setConnectionStatus('disconnected');
      return;
    }

    let unsubscribeStatus = orderHubService.onConnectionStatus((status) => {
      setConnectionStatus(status);
    });

    let unsubscribeOrder = orderHubService.onOrderReceived((order) => {
      if (onOrderReceivedRef.current) {
        onOrderReceivedRef.current(order);
      }
    });

    let unsubscribeStatusChanged = orderHubService.onOrderStatusChanged((payload) => {
      if (onOrderStatusChangedRef.current) {
        onOrderStatusChangedRef.current(payload);
      }
    });

    orderHubService.start().then(() => {
      if (restaurantId) {
        orderHubService.joinRestaurant(restaurantId);
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeOrder();
      unsubscribeStatusChanged();
      if (restaurantId) {
        orderHubService.leaveRestaurant(restaurantId);
      }
    };
  }, [isAuthenticated, token, restaurantId]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    joinOrder: (id) => orderHubService.joinOrder(id),
    joinRestaurant: (id) => orderHubService.joinRestaurant(id),
  };
}
