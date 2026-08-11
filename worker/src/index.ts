import dotenv from 'dotenv';

dotenv.config();

console.log('👷 FitTrack AI Worker initialized.');
console.log('⏳ Waiting for background job queues (Redis / BullMQ)...');

// Keep process alive for future background queues
setInterval(() => {
  // Heartbeat
}, 60000);
