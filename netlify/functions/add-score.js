const { Client } = require('pg');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL, // Use environment variable
    ssl: {
      rejectUnauthorized: false, // Required for Neon's SSL
    },
  });

  try {
    const { name, score, date } = JSON.parse(event.body);
    await client.connect();
    await client.query('INSERT INTO high_scores(name, score, date) VALUES($1, $2, $3)', [name, score, date]);

    // Optionally, you can fetch and return the top 10 scores after adding
    const res = await client.query('SELECT name, score, date FROM high_scores ORDER BY score DESC LIMIT 10');

    return {
      statusCode: 201,
      body: JSON.stringify(res.rows),
    };
  } catch (error) {
    console.error('Error adding score:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to add score' }),
    };
  } finally {
    await client.end();
  }
};