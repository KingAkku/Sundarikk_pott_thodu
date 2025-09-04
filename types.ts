
export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Click {
  id: number;
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface ScorePopup {
  id: number;
  score: number;
  position: Position;
}
