const { Client } = require('pg');

exports.handler = async (event, context) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL, // Use environment variable
    ssl: {
      rejectUnauthorized: false, // Required for Neon's SSL
    },
  });

  try {
    await client.connect();
    const res = await client.query('SELECT name, score, date FROM high_scores ORDER BY score DESC LIMIT 10');
    return {
      statusCode: 200,
      body: JSON.stringify(res.rows),
    };
  } catch (error) {
    console.error('Error fetching scores:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch scores' }),
    };
  } finally {
    await client.end();
  }
};