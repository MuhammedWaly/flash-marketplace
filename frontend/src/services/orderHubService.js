import * as signalR from '@microsoft/signalr';

/**
 * OrderHubService
 * Singleton service managing real-time WebSocket connection to the ASP.NET Core SignalR OrderHub.
 */
class OrderHubService {
  constructor() {
    this.connection = null;
    this.orderReceivedListeners = new Set();
    this.statusChangedListeners = new Set();
    this.connectionStatusListeners = new Set();
    this.isConnecting = false;
    this.currentRestaurantId = null;
  }

  getHubUrl() {
    const envApi = import.meta.env.VITE_API_URL;
    if (envApi && envApi.startsWith('http')) {
      return envApi.replace(/\/api\/?$/, '') + '/hubs/orders';
    }
    // In dev / Vite proxy, use relative path which is proxied with WebSocket support
    return '/hubs/orders';
  }

  async start() {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return this.connection;
    }

    if (this.isConnecting) {
      return;
    }

    const token = localStorage.getItem('foodmarketplace_auth_token');
    if (!token) {
      return null;
    }

    try {
      this.isConnecting = true;
      this.notifyStatus('connecting');

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.getHubUrl(), {
          accessTokenFactory: () => localStorage.getItem('foodmarketplace_auth_token') || '',
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Setup inbound event handlers
      this.connection.on('OrderReceived', (order) => {
        this.orderReceivedListeners.forEach((listener) => {
          try {
            listener(order);
          } catch (e) {
            console.error('Error in OrderReceived listener:', e);
          }
        });
      });

      this.connection.on('OrderStatusChanged', (payload) => {
        this.statusChangedListeners.forEach((listener) => {
          try {
            listener(payload);
          } catch (e) {
            console.error('Error in OrderStatusChanged listener:', e);
          }
        });
      });

      // Reconnect lifecycle hooks
      this.connection.onreconnecting(() => {
        this.notifyStatus('reconnecting');
      });

      this.connection.onreconnected(async () => {
        this.notifyStatus('connected');
        // Re-join restaurant room if vendor was joined
        if (this.currentRestaurantId) {
          await this.joinRestaurant(this.currentRestaurantId);
        }
      });

      this.connection.onclose(() => {
        this.notifyStatus('disconnected');
      });

      await this.connection.start();
      this.notifyStatus('connected');

      // If restaurant ID was requested before connection completed
      if (this.currentRestaurantId) {
        await this.joinRestaurant(this.currentRestaurantId);
      }

      return this.connection;
    } catch (err) {
      console.warn('SignalR connection failed:', err?.message || err);
      this.notifyStatus('disconnected');
      return null;
    } finally {
      this.isConnecting = false;
    }
  }

  async stop() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (err) {
        console.warn('SignalR disconnect error:', err);
      }
      this.connection = null;
      this.notifyStatus('disconnected');
    }
  }

  async joinRestaurant(restaurantId) {
    this.currentRestaurantId = restaurantId;
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinRestaurantGroup', String(restaurantId));
      } catch (err) {
        console.warn('Failed to join restaurant room:', err);
      }
    }
  }

  async leaveRestaurant(restaurantId) {
    if (this.currentRestaurantId === restaurantId) {
      this.currentRestaurantId = null;
    }
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveRestaurantGroup', String(restaurantId));
      } catch (err) {
        console.warn('Failed to leave restaurant room:', err);
      }
    }
  }

  async joinOrder(orderId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinOrderGroup', String(orderId));
      } catch (err) {
        console.warn('Failed to join order room:', err);
      }
    }
  }

  onOrderReceived(callback) {
    this.orderReceivedListeners.add(callback);
    return () => this.orderReceivedListeners.delete(callback);
  }

  onOrderStatusChanged(callback) {
    this.statusChangedListeners.add(callback);
    return () => this.statusChangedListeners.delete(callback);
  }

  onConnectionStatus(callback) {
    this.connectionStatusListeners.add(callback);
    return () => this.connectionStatusListeners.delete(callback);
  }

  notifyStatus(status) {
    this.connectionStatusListeners.forEach((fn) => {
      try {
        fn(status);
      } catch (e) {
        console.error(e);
      }
    });
  }

  isConnected() {
    return this.connection && this.connection.state === signalR.HubConnectionState.Connected;
  }
}

export const orderHubService = new OrderHubService();
