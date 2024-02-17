import mongoose, { Schema } from 'mongoose';
import { IShipPositionDocument } from '../interfaces/ShipPosition';

export const ShipPositionSchema = new Schema<IShipPositionDocument>({
  playerId: String,
  coordinates: [String],
});

ShipPositionSchema.statics.findByPlayerId = function (id: String) {
  return this.findOne({ playerId: id });
};

export const ShipPosition = mongoose.model<IShipPositionDocument>(
  'ShipPosition',
  ShipPositionSchema
);
