
export interface MarketData {
  pair: string;
  volume: number;
  change24h: number;
  liquidity: number;
  change1h: number;
  change1d: number;
  change1w: number;
}

export interface Signal {
  pair: string;
  pattern: string;
  time: string;
  variation: number;
  liquidity: number;
  isHot?: boolean;
}

export enum HistoryEventType {
  Trade = 'Trade',
  API = 'API',
  System = 'System',
  Alert = 'Alert',
}

export interface HistoryEvent {
  timestamp: string;
  type: HistoryEventType;
  description: string;
}
