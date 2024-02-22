export const ERROR: string = 'error';
export const SUCCESS: string = 'success';
export const INFO: string = 'info';
export const WARNING: string = 'warning';

export const CARRIER: string = 'Carrier';
export const BATTLESHIP: string = 'Battleship';
export const CRUISER: string = 'Cruiser';
export const SUBMARINE: string = 'Submarine';
export const DESTROYER: string = 'Destroyer';

export const GRID_SIZE: number = 11;

export enum SOCKET_EVENTS {
  NOTIFICATION = 'NOTIFICATION',
  CONNECTION_SUCCESS = 'CONNECTION_SUCCESS',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  SET_SHIP_POSITION = 'SET_SHIP_POSITION',
  ATTACK = 'ATTACK',
  WON = 'WON',
  LOSE = 'LOSE',
  START = 'START',
  TURN = 'TURN',
  NOT_TURN = 'NOT_TURN',
}

export const SHIPS = {
  [CARRIER]: { name: CARRIER, shots: 5, color: 'olive' },
  [BATTLESHIP]: { name: BATTLESHIP, shots: 4, color: 'maroon' },
  [CRUISER]: { name: CRUISER, shots: 3, color: 'orange' },
  [SUBMARINE]: { name: SUBMARINE, shots: 3, color: 'aqua' },
  [DESTROYER]: { name: DESTROYER, shots: 2, color: 'lime' },
};

export const TOTAL_OCCUPIED_GRIDS = Object.values(SHIPS).reduce(
  (a, b) => a + b.shots,
  0
);
