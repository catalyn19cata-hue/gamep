const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const PORT = 3000;

const tiktokUsername = 'sa_fim_mai_destepti';

const tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

let horses = {
  romania: 0,
  italy: 0,
  france: 0,
  germany: 0
};

function randomBoost() {
  return Math.floor(Math.random() * 20) + 5;
}

// CONNECT TIKTOK

tiktokLiveConnection.connect()
  .then(state => {
    console.log(`Connected to roomId ${state.roomId}`);
  })
  .catch(err => {
    console.error('TikTok connection failed:', err);
  });

// GIFT EVENTS

tiktokLiveConnection.on('gift', data => {

  console.log(`${data.uniqueId} sent ${data.giftName}`);

  // EXEMPLE
  // Rose => Romania
  // TikTok => Italy
  // Galaxy => France
  // Lion => Germany

  if (data.giftName === 'Rose') {
    horses.romania += randomBoost();
  }

  if (data.giftName === 'TikTok') {
    horses.italy += randomBoost();
  }

  if (data.giftName === 'Galaxy') {
    horses.france += randomBoost();
  }

  if (data.giftName === 'Lion') {
    horses.germany += randomBoost();
  }

  io.emit('updateRace', horses);
});

// COMMENT EVENTS

tiktokLiveConnection.on('chat', data => {

  const msg = data.comment.toLowerCase();

  if (msg === 'romania') {
    horses.romania += 5;
  }

  if (msg === 'italy') {
    horses.italy += 5;
  }

  if (msg === 'france') {
    horses.france += 5;
  }

  if (msg === 'germany') {
    horses.germany += 5;
  }

  io.emit('updateRace', horses);
});

io.on('connection', socket => {
  console.log('Browser connected');

  socket.emit('updateRace', horses);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});