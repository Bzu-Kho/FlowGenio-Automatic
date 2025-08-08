// Simple in-memory EventBus for FlowForge
class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }

  publish(eventType, payload) {
    if (this.handlers.has(eventType)) {
      for (const handler of this.handlers.get(eventType)) {
        try {
          handler(payload);
        } catch (err) {
          // Improved: log error with context
          import('../observability/logger.js').then(({ default: logger }) => {
            logger.error(`EventBus handler error for event: ${eventType}`, {
              error: err.message,
              stack: err.stack,
            });
          });
        }
      }
    }
  }
}

const eventBus = new EventBus();
export default eventBus;
