import dotenv from 'dotenv';
import { BackgroundWorker } from './worker.js';

dotenv.config();

console.log('👷 FitTrack AI Worker process starting...');

const worker = new BackgroundWorker();
worker.start(60000);

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n[Worker] Caught SIGINT signal. Shutting down gracefully...');
  worker.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Worker] Caught SIGTERM signal. Shutting down gracefully...');
  worker.stop();
  process.exit(0);
});
