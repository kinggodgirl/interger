const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins

const SCORES_FILE = path.join(__dirname, 'scores.json');

// Helper function to read scores from file
const readScores = () => {
  if (!fs.existsSync(SCORES_FILE)) {
    return [];
  }
  const data = fs.readFileSync(SCORES_FILE);
  return JSON.parse(data);
};

// Helper function to write scores to file
const writeScores = (scores) => {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
};

// API to get all scores
app.get('/api/scores', (req, res) => {
  const scores = readScores();
  res.json(scores);
});

// API to add a new score
app.post('/api/scores', (req, res) => {
  const newScore = req.body;
  const scores = readScores();
  scores.push(newScore);
  // Sort by score descending and keep top 10
  const updatedScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
  writeScores(updatedScores);
  res.status(201).json(newScore);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
