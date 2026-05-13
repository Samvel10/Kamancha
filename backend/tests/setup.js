require('dotenv').config({ path: '.env' });

// Redirect MongoDB to test database to protect production data
if (process.env.MONGODB_URI) {
  process.env.MONGODB_URI = process.env.MONGODB_URI.replace(/\/([^/?]+)(\?.*)?$/, '/kamancha_test$2');
}

jest.setTimeout(30000);
