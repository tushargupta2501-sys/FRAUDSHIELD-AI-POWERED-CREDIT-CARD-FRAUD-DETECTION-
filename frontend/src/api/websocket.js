export class TransactionWebSocket {
  constructor(onMessageCallback, onStatusChangeCallback) {
    this.url = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/ws/transactions');
    this.onMessage = onMessageCallback;
    this.onStatusChange = onStatusChangeCallback;
    this.ws = null;
    this.reconnectInterval = 3000;
    this.isClosedManually = false;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        if (this.onStatusChange) this.onStatusChange(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessage) this.onMessage(data);
        } catch (e) {
          console.error("WS Parse error:", e);
        }
      };

      this.ws.onclose = () => {
        if (this.onStatusChange) this.onStatusChange(false);
        if (!this.isClosedManually) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = (err) => {
        if (this.onStatusChange) this.onStatusChange(false);
      };
    } catch (e) {
      if (this.onStatusChange) this.onStatusChange(false);
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  disconnect() {
    this.isClosedManually = true;
    if (this.ws) {
      this.ws.close();
    }
  }
}
