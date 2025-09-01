
export enum Player {
  X = 'X',
  O = 'O',
}

export type CellState = Player | null;
export type BoardState = CellState[][];

export type Move = { r: number; c: number };
export type WinInfo = Move[] | null;

export enum GameMode {
  PvC = 'pvc',
  PvP = 'pvp',
}

export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  Expert = 'expert',
  Learning = 'learning',
}

export interface GameMemory {
  wins: { moves: string }[];
  losses: { moves: string }[];
}

export interface MoveHistoryItem {
  player: Player;
  r: number;
  c: number;
}
