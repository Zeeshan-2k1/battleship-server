export interface IAcknowledgement {
  isSuccess: boolean;
  message?: string;
  data?: any;
}

export interface IShipCoordinates {
  i: number;
  j: number;
  color: string;
}

export interface IPlayer {
  id: string;
  name: string;
  shipCoordinates?: IShipCoordinates[];
}

export interface IPlayerDocument extends Document, IPlayer {
  shipCoordinates: IShipCoordinates[];
}

export interface IRoom extends Document {
  id: string;
  players: IPlayer[];
}
