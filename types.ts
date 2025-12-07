
export interface Song {
  id: string;
  title: string;
  artist: string;
  isDuet: boolean;
  genre: string;
  duration: string;
}

export interface QueueEntry {
  id: string;
  songId: string;
  singerName: string;
  photo?: string;
  comments?: string;
  timestamp: number;
  status: 'waiting' | 'now_playing' | 'history';
}

export interface RequestEntry {
  id: string;
  songTitle: string;
  artist: string;
  requesterName?: string;
  timestamp: number;
}

export type ViewState = 'SONG_LIST' | 'SUBMIT_SONG' | 'QUEUE' | 'HOST_LOGIN' | 'HOST_DASHBOARD';

export type SortOption = 'ARTIST' | 'TITLE' | 'DUET';

export enum ImageSize {
  Size1K = '1K',
  Size2K = '2K',
  Size4K = '4K'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}
