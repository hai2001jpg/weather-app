require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const authRouter = require('../src/api/auth').default;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use('/api', authRouter);

app.get('/', (req, res) => {
  res.send('API is running');
});

// debugging: log the DATABASE_URL
// console.log('DATABASE_URL:', process.env.DATABASE_URL);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});