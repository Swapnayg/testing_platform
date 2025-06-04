import cron from 'node-cron';

console.log('📅 Cron file loaded');

cron.schedule('*/1 * * * *', () => {
  console.log('✅ Running every minute');
});
