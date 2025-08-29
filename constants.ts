
import { Player } from './types';

export const BOARD_SIZE = 8;
export const PLAYER_X = Player.X;
export const PLAYER_O = Player.O;
export const AI_PLAYER = Player.O;
export const HUMAN_PLAYER = Player.X;

export const POSITIONAL_VALUE_MAP: number[][] = [
    [3, 4, 5, 7, 7, 5, 4, 3],
    [4, 6, 8, 10, 10, 8, 6, 4],
    [5, 8, 11, 13, 13, 11, 8, 5],
    [7, 10, 13, 16, 16, 13, 10, 7],
    [7, 10, 13, 16, 16, 13, 10, 7],
    [5, 8, 11, 13, 13, 11, 8, 5],
    [4, 6, 8, 10, 10, 8, 6, 4],
    [3, 4, 5, 7, 7, 5, 4, 3]
];
