import { configDotenv } from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server, Socket } from 'socket.io';
import { ERROR, SOCKET_EVENTS, SUCCESS } from './constants';
import { IShipCoordinates } from './interfaces/Entity';
import { allowedOrigins, corsConfigs } from './utils/CorsConfig';
import cors from 'cors';
import {
  ConnectionErrorMessage,
  UNEXPECTED_ERROR_MSG,
} from './constants/ErrorMessages';
import { IAcknowledgement } from './interfaces/Entity';
import { Player, Room } from './schema';
import {
  findAllPlayersInRoom,
  findPlayerAndUpdateShipCoordinate,
  isBothPlayerReadyInRoom,
  removePlayer,
} from './schema/query';

configDotenv();

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT;

const {
  ATTACK,
  CONNECTION_SUCCESS,
  NOTIFICATION,
  SET_SHIP_POSITION,
  WON,
  LOSE,
  START,
  TURN,
  NOT_TURN,
} = SOCKET_EVENTS;

if (DB_URL === undefined) {
  console.log('[db_url] Cannot find DB_URL');
  process.exit(1);
}

const app = express();
app.use(cors(corsConfigs as any));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins } });

mongoose
  .connect(DB_URL)
  .then((res) => {
    console.log('[mongodb]: Successfully connected to DB');
  })
  .catch((err) => {
    console.log('[mongodb]: Cannot connect to DB');
    process.exit(1);
  });

io.on('connection', async (socket: Socket) => {
  console.log('[connection] A user is trying to connect');

  const roomId: string = socket.handshake.query.roomId as string;
  const playerName: string = (
    socket.handshake.query.playerName as string
  ).trim();

  try {
    const room = await Room.findOne({ id: roomId });

    if (!room) {
      const player = new Player({
        id: socket.id,
        name: playerName,
        shipCoordinates: null,
      });

      await player.save();
      const room = new Room({
        id: roomId,
        players: [player._id],
      });

      await room.save();
    } else {
      const players = room.players;
      if (players && players.length >= 2) {
        console.log('[connection] More than 2 players are trying to connect');
        socket.emit(NOTIFICATION, {
          message: ConnectionErrorMessage.RoomLimit,
          type: ERROR,
        });
        socket.disconnect(true);
        return;
      } else if (
        players &&
        players.map((player) => player.name).includes(playerName)
      ) {
        console.log(
          '[connection] Player with same name already exists: ',
          playerName
        );
        socket.emit(NOTIFICATION, {
          message: ConnectionErrorMessage.PlayerWithSameName,
          type: ERROR,
        });
        socket.disconnect(true);
        return;
      } else {
        const player = new Player({
          name: playerName,
          id: socket.id,
          shipCoordinates: null,
        });
        await player.save();
        players.push(player);
        await room.save();
      }
    }
  } catch (error) {
    console.log(error);
  }

  socket.join(roomId);
  socket.emit(NOTIFICATION, {
    message: `Player: ${playerName}, connected to Room: ${roomId}`,
    type: SUCCESS,
  });

  socket.emit(CONNECTION_SUCCESS, {
    isConnected: true,
    id: socket.id,
  });

  socket.on(
    SET_SHIP_POSITION,
    async (
      shipPosition: IShipCoordinates[],
      callback: (status: IAcknowledgement) => void
    ) => {
      const status: IAcknowledgement = {
        isSuccess: false,
        message: UNEXPECTED_ERROR_MSG,
        data: null,
      };

      try {
        await findPlayerAndUpdateShipCoordinate(socket.id, shipPosition);
        status.isSuccess = true;
        status.message = 'Successfully set the ship position';
      } catch (error) {
        console.error(
          '[setShipPosition]: Error setting ship positions: ',
          error
        );
      }

      const isBothPlayerReady = await isBothPlayerReadyInRoom(roomId);
      if (isBothPlayerReady) {
        io.to(roomId).emit(START);
        const players = await findAllPlayersInRoom(roomId);
        if (players) {
          Math.random() * 10 >= 5
            ? io.to(players[0].id).emit(TURN)
            : io.to(players[1].id).emit(TURN);
        }
      }
      if (callback) {
        callback(status);
      }
    }
  );

  socket.on(
    ATTACK,
    async (
      attackPosition: IShipCoordinates,
      callback: (status: IAcknowledgement) => void
    ) => {
      const status: IAcknowledgement = {
        isSuccess: false,
        message: 'Miss!!',
        data: null,
      };
      console.log('[attack]: Attack Positions are:', attackPosition);
      try {
        const players = await findAllPlayersInRoom(roomId);
        if (players !== null) {
          const opponent = players.find((player) => player.id !== socket.id);
          if (opponent && opponent.shipCoordinates) {
            const isHit = opponent.shipCoordinates.find(
              (element: IShipCoordinates) => {
                return (
                  +element.i === +attackPosition.i &&
                  +element.j === +attackPosition.j
                );
              }
            );

            if (isHit) {
              status.isSuccess = true;
              status.message = 'Hit!!';
              status.data = isHit.color;

              const opponentsRemainignPositions =
                opponent.shipCoordinates.filter(
                  (element) =>
                    !(
                      +element.i === +attackPosition.i &&
                      +element.j === +attackPosition.j
                    )
                );

              await findPlayerAndUpdateShipCoordinate(
                opponent.id,
                opponentsRemainignPositions
              );
              if (opponentsRemainignPositions.length === 0) {
                socket.emit(WON);
                io.to(opponent.id).emit(LOSE);
              } else {
                io.to(opponent.id).emit(ATTACK, isHit.color);
              }
            }
            socket.emit(NOT_TURN);
            io.to(opponent.id).emit(TURN);
          }
        }
      } catch (error) {
        console.error(error);
      }

      if (callback) {
        callback(status);
      }
    }
  );

  socket.on('disconnect', async () => {
    console.log('[disconnect] A user disconnected');
    await removePlayer(socket.id);
    io.to(roomId).emit(NOTIFICATION, {
      message: 'One Player left the room',
    });
    io.to(roomId).emit(WON);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
