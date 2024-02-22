import { Player, Room } from '.';
import { TOTAL_OCCUPIED_GRIDS } from '../constants';
import { IShipCoordinates } from '../interfaces/Entity';

export const findRoomById = async (id: string) => {
  try {
    const room = await Room.findById(id);
    return room || null;
  } catch (error) {
    console.log('[query]: Room ');
  }

  return null;
};

export const findPlayerByNameInRoom = async (name: string, roomId: string) => {
  try {
    const room = await Room.findOne({ id: roomId }).populate('players').exec();

    if (!room) {
      throw new Error(`Room not found for room id: ${roomId}`);
    }

    const player = room.players.find((player) => player.name === name);
    return player || null;
  } catch (error) {
    console.error(error);
  }

  return null;
};

export const checkIfRoomExists = async (id: string) => {
  try {
    const room = await Room.findById(id);
    if (!room) return false;

    return true;
  } catch (error) {
    console.log('[query]: Error finding room by room id: ', error);
  }

  return false;
};

export const findAllPlayersInRoom = async (id: string) => {
  try {
    const room = await Room.findOne({ id: id }).populate('players').exec();

    if (!room) {
      throw new Error(`Room not found for room id: ${id}`);
    }

    return room.players;
  } catch (error) {
    console.error('Error getting all players in room:', error);
  }

  return null;
};

export const findPlayerAndUpdateShipCoordinate = async (
  playerId: string,
  shipCoordinates: IShipCoordinates[]
) => {
  try {
    const updatedPlayer = await Player.findOneAndUpdate(
      { id: playerId },
      { $set: { shipCoordinates: shipCoordinates } },
      { new: true }
    );

    if (!updatedPlayer) {
      throw new Error('Player not found');
    }

    console.log('Player coordinates updated successfully', updatedPlayer?.name);
  } catch (error) {
    console.log(error);
  }
};

export const isBothPlayerReadyInRoom = async (roomId: string) => {
  try {
    const room = await Room.findOne({ id: roomId }).populate('players').exec();
    if (!room) {
      throw new Error(`Room not found for room id: ${roomId}`);
    }

    return (
      room.players.filter((player) => {
        if (player.shipCoordinates) {
          return +player.shipCoordinates?.length === +TOTAL_OCCUPIED_GRIDS;
        }

        return false;
      }).length === 2
    );
  } catch (error) {
    console.error(
      '[isBothPlayerReadyInRoom]: Error while fetching both player is ready: ',
      error
    );
  }

  return false;
};

export const removePlayer = async (playerId: string) => {
  try {
    const player = await Player.findOne({ id: playerId });
    if (!player) {
      throw new Error('Player not found');
    }

    await Room.updateMany(
      { players: player._id },
      { $pull: { players: player._id } }
    );
    await player.deleteOne();
    console.log('[removePlayer]: Player removed from the room');
  } catch (error) {
    console.error(
      '[removePlayer]: Error while removing player: ',
      playerId,
      error
    );
  }
};
