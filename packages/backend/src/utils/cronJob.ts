import cron from 'node-cron';

// Scheduled tasks placeholder
cron.schedule('0 10 * * *', async () => {
  console.log('[Cron] Daily maintenance job');
});
