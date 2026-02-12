export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
}

export enum AppMode {
  HOME = 'HOME',
  CHAT = 'CHAT',
  VOICE = 'VOICE'
}

export interface LiveConnectionState {
  isConnected: boolean;
  isListening: boolean;
  error: string | null;
  volume: number; // For visualization
}