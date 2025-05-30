import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
const router = express.Router();

// Enable CORS for all routes in this router
router.use(cors());

// Configure your PostgreSQL connection using connectionString from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Log the DATABASE_URL for debugging
// console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Všetky polia sú povinné.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (name, username, password) VALUES ($1, $2, $3) RETURNING id, username, name',
      [name, username, password]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err); // Log the error for debugging
    if (err.code === '23505') { // unique violation
      res.status(409).json({ error: 'Prihlasovacie meno už existuje.' });
    } else {
      res.status(500).json({ error: 'Nepodarilo sa kontaktovať databázu.' });
    }
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vyžaduje sa prihlasovacie meno a heslo.' });
  }
  try {
    const result = await pool.query(
      'SELECT id, username, name FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Nesprávne údaje.' });
    }

    //console.log(`User with id ${result.rows[0].id} has logged in.`); // Log the user ID for debugging

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: 'Database error.' });
  }
});

// --- User Cities Endpoints ---
// Get all cities for a user
router.get('/cities', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  try {
    const result = await pool.query(
      'SELECT city_key AS "Key", city_name AS "LocalizedName", country_name AS "Country" FROM user_cities WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Nepodarilo sa načítať mestá.' });
  }
});

// Add a city for a user
router.post('/cities', async (req, res) => {
  const { userId, Key, LocalizedName, Country } = req.body;
  if (!userId || !Key || !LocalizedName || !Country) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    await pool.query(
      'INSERT INTO user_cities (user_id, city_key, city_name, country_name) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      [userId, Key, LocalizedName, Country]
    );
    res.status(201).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Nepodarilo sa uložiť mesto.' });
  }
});

// Remove a city for a user
router.delete('/cities/:cityKey', async (req, res) => {
  const userId = req.body.userId;
  const { cityKey } = req.params;
  if (!userId || !cityKey) {
    return res.status(400).json({ error: 'userId and cityKey are required.' });
  }
  try {
    await pool.query(
      'DELETE FROM user_cities WHERE user_id = $1 AND city_key = $2',
      [userId, cityKey]
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Nepodarilo sa odstrániť mesto.' });
  }
});

export default router;