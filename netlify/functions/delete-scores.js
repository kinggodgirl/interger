const { Client } = require('pg');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    await client.query('DELETE FROM high_scores'); // Delete all scores

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'All high scores deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting scores:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete scores' }),
    };
  } finally {
    await client.end();
  }
};
