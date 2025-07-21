const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join(__dirname, '..', '..', 'scores.json'); // Adjust path to project root

exports.handler = async (event, context) => {
  try {
    if (!fs.existsSync(SCORES_FILE)) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }
    const data = fs.readFileSync(SCORES_FILE, 'utf8');
    const scores = JSON.parse(data);
    return {
      statusCode: 200,
      body: JSON.stringify(scores),
    };
  } catch (error) {
    console.error('Error reading scores:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to read scores' }),
    };
  }
};
