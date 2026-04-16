export interface Game {
  id: string;
  name: string;
  playtime: number;
  lastPlayed: string;
  image: string;
  achievements: {
    earned: number;
    total: number;
  };
  description: string;
}

export interface Recommendation {
  title: string;
  artist: string;
  reason: string;
}
