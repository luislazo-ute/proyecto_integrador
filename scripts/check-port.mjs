import net from 'node:net';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 5173);

const socket = net.createConnection({ host, port });
socket.setTimeout(2000);

socket.on('connect', () => {
  console.log(`OK connected ${host}:${port}`);
  socket.end();
});

socket.on('timeout', () => {
  console.error(`TIMEOUT ${host}:${port}`);
  socket.destroy();
  process.exit(1);
});

socket.on('error', (e) => {
  console.error(`ERROR ${host}:${port} ${e.code || ''} ${e.message}`);
  process.exit(1);
});
