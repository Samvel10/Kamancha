const app = require('./app');
const { connectAll } = require('./config/db');

const PORT = process.env.PORT || 4000;

connectAll()
  .then(() => {
    app.listen(PORT, () => {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Kamancha API running on port ${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
