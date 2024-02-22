import mongoose, { Model, Schema } from 'mongoose';
import { IPlayerDocument, IRoom } from '../interfaces/Entity';

export const PlayerSchema = new Schema<IPlayerDocument>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  shipCoordinates: [
    {
      i: { type: String, required: false },
      j: { type: String, required: false },
      color: { type: String, required: false },
    },
  ],
});

export const RoomSchema = new Schema<IRoom>({
  id: { type: String, required: true },
  players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
});

export const Player: Model<IPlayerDocument> = mongoose.model(
  'Player',
  PlayerSchema
);
export const Room: Model<IRoom> = mongoose.model('Room', RoomSchema);
