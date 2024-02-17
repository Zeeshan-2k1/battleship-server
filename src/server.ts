import { configDotenv } from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server, Socket } from 'socket.io';
import {
  CONNECTION_SUCCESS,
  ERROR,
  NOTIFICATION,
  SET_SHIP_POSITION,
  SUCCESS,
} from './constants';
import { IShipCoordinates } from './interfaces/ShipPosition';
import { allowedOrigins, corsConfigs } from './utils/CorsConfig';
import cors from 'cors';
import { IPlayer } from './interfaces/Player';

configDotenv();

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT;

if (DB_URL === undefined) {
  console.log('[db_url] Cannot find DB_URL');
  process.exit(1);
}

const app = express();
//@ts-ignore
app.use(cors(corsConfigs));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins } });

const rooms: Map<string, IPlayer[]> = new Map();

mongoose.connect(DB_URL);

io.on('connection', (socket: Socket) => {
  console.log('[connection] A user is trying to connect');

  const roomId: string = socket.handshake.query.roomId as string;
  const playerName: string = socket.handshake.query.playerName as string;

  if (!rooms.has(roomId)) {
    rooms.set(roomId, [{ name: playerName, socketId: socket.id }]);
  } else {
    const players = rooms.get(roomId) as IPlayer[];
    if (players.length >= 2) {
      console.log('[connection] More than 2 players are trying to connect');
      io.emit(NOTIFICATION, {
        message: 'Room limit reached. Try connecting to different room.',
        type: ERROR,
      });
      socket.disconnect(true);
      return;
    } else if (players.map((player) => player.name).includes(playerName)) {
      console.log(
        '[connection] Player with same name already exists: ',
        playerName
      );
      io.emit(NOTIFICATION, {
        message:
          'Room already have a player with same name. Please try with different name',
        type: ERROR,
      });
      socket.disconnect(true);
      return;
    } else {
      players.push({ name: playerName, socketId: socket.id });
      rooms.set(roomId, players);
    }
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

  socket.on(SET_SHIP_POSITION, async (data: IShipCoordinates[]) => {});

  socket.on('disconnect', () => {
    console.log('[disconnet]: A user disconnected');
    const players = rooms.get(roomId);
    if (players) {
      const index = players.indexOf({ name: playerName, socketId: socket.id });
      if (index !== -1) {
        players?.splice(index, 1);
        rooms.set(roomId, players);
      }
    }
  });

  console.log(roomId, rooms.get(roomId));
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
