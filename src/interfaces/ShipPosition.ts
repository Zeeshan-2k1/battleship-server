import { Document } from 'mongoose';

export interface IShipPositionDocument extends Document {
  playerId: string;
  coordinates: IShipCoordinates[];
}

export interface IShipCoordinates {
  i: number;
  j: number;
  color: string;
}
