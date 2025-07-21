import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar } from 'react-bootstrap';

const DIFFICULTY_LEVELS = {
  easy: {
    numRange: 10, // -10 ~ 10
    time: 15,
  },
  medium: {
    numRange: 20, // -20 ~ 20
    time: 10,
  },
  hard: {
    numRange: 30, // -30 ~ 30
    time: 7,
  },
};

function App() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0); // Initialized dynamically
  const timerRef = useRef(null);
  const inputRef = useRef(null); // Ref for the input field
  const [correctAnswer, setCorrectAnswer] = useState(0); // New state for correct answer
  const [quizState, setQuizState] = useState('playing'); // New state: 'playing', 'feedback'
  const [lastSubmissionWasCorrect, setLastSubmissionWasCorrect] = useState(false); // New state

  const [difficulty, setDifficulty] = useState(() => {
    return localStorage.getItem('mathQuizDifficulty') || 'medium';
  });
  const [quizResults, setQuizResults] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mathQuizResults')) || [];
    } catch (e) {
      console.error("Failed to parse quiz results from localStorage", e);
      return [];
    }
  });
  const [highScores, setHighScores] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mathQuizHighScores')) || [];
    } catch (e) {
      console.error("Failed to parse high scores from localStorage", e);
      return [];
    }
  });

  // Save states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mathQuizDifficulty', difficulty);
  }, [difficulty]);

  useEffect(() => {
    localStorage.setItem('mathQuizResults', JSON.stringify(quizResults));
  }, [quizResults]);

  useEffect(() => {
    localStorage.setItem('mathQuizHighScores', JSON.stringify(highScores));
  }, [highScores]);

  const calculateCorrectAnswer = useCallback((n1, n2, op) => {
    switch (op) {
      case '+': return n1 + n2;
      case '-': return n1 - n2;
      case '*': return n1 * n2;
      case '/': return Math.round(n1 / n2); // Assuming integer division for quiz
      default: return 0;
    }
  }, []);

  const generateProblem = useCallback(() => {
    const currentDifficulty = DIFFICULTY_LEVELS[difficulty];
    const numRange = currentDifficulty.numRange;
    const maxTime = currentDifficulty.time;

    const operators = ['+', '-', '*', '/'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let n1 = Math.floor(Math.random() * (numRange * 2 + 1)) - numRange;
    let n2 = Math.floor(Math.random() * (numRange * 2 + 1)) - numRange;

    if (op === '/') {
      while (n2 === 0 || n1 % n2 !== 0) {
        n1 = Math.floor(Math.random() * (numRange * 2 + 1)) - numRange;
        n2 = Math.floor(Math.random() * (numRange * 2 + 1)) - numRange;
      }
    }

    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setAnswer('');
    setMessage('');
    setRemainingTime(maxTime);
    setCorrectAnswer(calculateCorrectAnswer(n1, n2, op)); // Store correct answer
    setQuizState('playing'); // Reset quiz state
    setLastSubmissionWasCorrect(false); // Reset this state
  }, [calculateCorrectAnswer, difficulty]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  useEffect(() => {
    if (quizState === 'playing') { // Only run timer if quiz is in playing state
      if (remainingTime > 0) {
        timerRef.current = setTimeout(() => {
          setRemainingTime(remainingTime - 1);
        }, 1000);
      } else { // remainingTime is 0 and quizState is playing
        setMessage('시간 초과!');
        clearTimeout(timerRef.current); // Stop the timer
        // Do NOT change quizState here, allow user to still answer
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [remainingTime, quizState]);

  useEffect(() => {
    if (quizState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [quizState]);

  const checkAnswer = (e) => {
    e.preventDefault();
    // Allow submission even if time is up, but disable if already in feedback state
    if (quizState === 'feedback') return;

    let currentPoints = 0;
    const isCorrect = (parseInt(answer) === correctAnswer);
    const timeTaken = DIFFICULTY_LEVELS[difficulty].time - remainingTime;

    if (isCorrect) {
      clearTimeout(timerRef.current);
      if (remainingTime > 0) { // Only award points if answered within time
        currentPoints = Math.max(1, remainingTime);
        setMessage(`정답입니다! (+${currentPoints}점)`);
      } else { // Answered correctly after time up
        currentPoints = 1; // Award 1 point for correct answer after time up
        setMessage(`정답입니다! (시간 초과 후 +${currentPoints}점)`);
      }
      setScore(prevScore => prevScore + currentPoints);
      setLastSubmissionWasCorrect(true); // Set to true for correct answer
      setQuizState('feedback'); // Set state to feedback to show message and disable input
      setTimeout(() => {
        generateProblem(); // Move to next problem after a short delay
      }, 1000); // 1 second delay to show score message
    } else {
      setMessage(`오답입니다. 정답은 ${correctAnswer} 입니다.`); // Show correct answer on incorrect submission
      setLastSubmissionWasCorrect(false); // Set to false for incorrect answer
      setQuizState('feedback'); // Set state to feedback
      clearTimeout(timerRef.current);
    }

    // Record quiz result for statistics
    setQuizResults(prevResults => [...prevResults, {
      isCorrect,
      timeTaken,
      difficulty,
      timestamp: new Date().toISOString(),
    }]);
  };

  const handleNextProblem = () => {
    generateProblem();
  };

  const handleToggleSign = () => {
    if (quizState === 'feedback') return; // Do not allow sign toggle in feedback state
    if (answer === '') {
      setAnswer('-');
    } else {
      const num = parseInt(answer);
      if (!isNaN(num)) {
        setAnswer(String(-num));
      } else if (answer === '-') {
        setAnswer(''); // If only '-', clear it
      }
    }
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
    setScore(0); // Reset score on difficulty change
    setQuizResults([]); // Clear results on difficulty change
    generateProblem(); // Generate new problem with new difficulty
  };

  const saveHighScore = async () => {
    const playerName = prompt("이름을 입력하세요:");
    if (playerName) {
      const newHighScore = { name: playerName, score: score, date: new Date().toLocaleDateString() };
      try {
        const response = await fetch('/.netlify/functions/add-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newHighScore),
        });
        if (response.ok) {
          alert(`최고 점수가 저장되었습니다: ${playerName} - ${score}점`);
          // Re-fetch high scores to update the list
          fetchHighScores();
        } else {
          alert('최고 점수 저장에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error saving high score:', error);
        alert('최고 점수 저장 중 오류가 발생했습니다.');
      }
    }
  };

  const fetchHighScores = useCallback(async () => {
    try {
      const response = await fetch('/.netlify/functions/get-scores');
      if (response.ok) {
        const data = await response.json();
        setHighScores(data);
      } else {
        console.error('Failed to fetch high scores');
      }
    } catch (error) {
      console.error('Error fetching high scores:', error);
    }
  }, []);

  useEffect(() => {
    fetchHighScores();
  }, [fetchHighScores]);

  // Calculate statistics
  const totalQuestions = quizResults.length;
  const correctAnswers = quizResults.filter(r => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;
  const averageTime = totalQuestions > 0 ? (quizResults.reduce((sum, r) => sum + r.timeTaken, 0) / totalQuestions).toFixed(1) : 0;

  return (
    <div className="container mt-5">
      <h1>정수 연산 퀴즈</h1>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">난이도 선택</h5>
          <div onChange={handleDifficultyChange}>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="difficultyOptions" id="easy" value="easy" checked={difficulty === 'easy'} />
              <label className="form-check-label" htmlFor="easy">쉬움</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="difficultyOptions" id="medium" value="medium" checked={difficulty === 'medium'} />
              <label className="form-check-label" htmlFor="medium">보통</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="difficultyOptions" id="hard" value="hard" checked={difficulty === 'hard'} />
              <label className="form-check-label" htmlFor="hard">어려움</label>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <span>남은 시간: {remainingTime}초</span>
            <ProgressBar
              now={(remainingTime / DIFFICULTY_LEVELS[difficulty].time) * 100}
              variant={remainingTime > (DIFFICULTY_LEVELS[difficulty].time / 2) ? 'success' : remainingTime > (DIFFICULTY_LEVELS[difficulty].time / 4) ? 'warning' : 'danger'}
            />
          </div>
          <h2 className="card-title">문제: {num1} {operator === '/' ? '÷' : operator} {num2 < 0 ? `(${num2})` : num2}</h2>
          <form onSubmit={checkAnswer}>
            <div className="form-group d-flex">
              <input
                type="text"
                inputmode="numeric"
                className="form-control me-2"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="정답을 입력하세요"
                ref={inputRef} // Attach ref to the input field
                disabled={quizState === 'feedback'} // Disable input when feedback is shown
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleToggleSign}
                disabled={quizState === 'feedback'}
              >
                +/-
              </button>
            </div>
            <button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={quizState === 'feedback'} // Disable submit button when feedback is shown
            >
              제출
            </button>
          </form>
          {message && <p className="mt-3">{message}</p>}
          {quizState === 'feedback' && !lastSubmissionWasCorrect ? ( // Show next problem button only when feedback is shown and it was NOT a correct submission
            <button
              type="button"
              className="btn btn-secondary mt-3"
              onClick={handleNextProblem}
            >
              다음 문제
            </button>
          ) : null}
          <p className="mt-3">현재 점수: {score}</p>
          <button className="btn btn-info mt-3" onClick={saveHighScore}>최고 점수 저장</button>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">학습 통계</h5>
          <p>총 문제: {totalQuestions}</p>
          <p>정답 수: {correctAnswers}</p>
          <p>정확도: {accuracy}%</p>
          <p>평균 풀이 시간: {averageTime}초</p>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">최고 점수</h5>
          {highScores.length === 0 ? (
            <p>아직 최고 점수가 없습니다.</p>
          ) : (
            <ul className="list-group">
              {highScores.map((hs, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {hs.name} - {hs.score}점
                  <span className="badge bg-primary rounded-pill">{hs.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;