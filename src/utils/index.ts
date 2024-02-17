import { GRID_SIZE } from '../constants';
import { IShipCoordinates } from '../interfaces/ShipPosition';

export const checkShipPosition = (indices: IShipCoordinates[]): boolean => {
  let result = true;
  result = indices.every(
    (coordinate) =>
      coordinate.i < GRID_SIZE &&
      coordinate.j < GRID_SIZE &&
      coordinate.i >= 0 &&
      coordinate.j >= 0
  );

  return result;
};
