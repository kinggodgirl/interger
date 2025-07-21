const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join(__dirname, '..', '..', 'scores.json'); // Adjust path to project root

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const newScore = JSON.parse(event.body);
    let scores = [];

    if (fs.existsSync(SCORES_FILE)) {
      const data = fs.readFileSync(SCORES_FILE, 'utf8');
      scores = JSON.parse(data);
    }

    scores.push(newScore);
    const updatedScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);

    fs.writeFileSync(SCORES_FILE, JSON.stringify(updatedScores, null, 2));

    return {
      statusCode: 201,
      body: JSON.stringify(newScore),
    };
  } catch (error) {
    console.error('Error adding score:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to add score' }),
    };
  }
};
