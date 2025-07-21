import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar } from 'react-bootstrap';

const MAX_TIME = 10; // 10초 제한

function App() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [remainingTime, setRemainingTime] = useState(MAX_TIME);
  const timerRef = useRef(null);

  const generateProblem = useCallback(() => {
    const operators = ['+', '-', '*', '/'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let n1 = Math.floor(Math.random() * 31) - 15;
    let n2 = Math.floor(Math.random() * 31) - 15;

    if (op === '/') {
      while (n2 === 0 || n1 % n2 !== 0) {
        n1 = Math.floor(Math.random() * 31) - 15;
        n2 = Math.floor(Math.random() * 31) - 15;
      }
    }

    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setAnswer('');
    setMessage('');
    setRemainingTime(MAX_TIME);
  }, []);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  useEffect(() => {
    if (remainingTime > 0) {
      timerRef.current = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
    } else {
      setMessage('시간 초과! 다음 문제로 넘어갑니다.');
      setTimeout(generateProblem, 1000);
    }

    return () => clearTimeout(timerRef.current);
  }, [remainingTime, generateProblem]);

  const checkAnswer = (e) => {
    e.preventDefault();
    let correctAnswer;
    switch (operator) {
      case '+':
        correctAnswer = num1 + num2;
        break;
      case '-':
        correctAnswer = num1 - num2;
        break;
      case '*':
        correctAnswer = num1 * num2;
        break;
      case '/':
        correctAnswer = Math.round(num1 / num2);
        break;
      default:
        break;
    }

    if (parseInt(answer) === correctAnswer) {
      clearTimeout(timerRef.current);
      const points = Math.max(1, remainingTime);
      setMessage(`정답입니다! (+${points}점)`);
      setScore(score + points);
      setTimeout(generateProblem, 1000);
    } else {
      setMessage(`오답입니다. 정답은 ${correctAnswer} 입니다.`);
    }
  };

  return (
    <div className="container mt-5">
      <h1>정수 연산 퀴즈</h1>
      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <span>남은 시간: {remainingTime}초</span>
            <ProgressBar 
              now={(remainingTime / MAX_TIME) * 100} 
              variant={remainingTime > 5 ? 'success' : remainingTime > 2 ? 'warning' : 'danger'} 
            />
          </div>
          <h2 className="card-title">문제: {num1} {operator === '/' ? '÷' : operator} {num2 < 0 ? `(${num2})` : num2}</h2>
          <form onSubmit={checkAnswer}>
            <div className="form-group">
              <input
                type="number"
                className="form-control"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="정답을 입력하세요"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              제출
            </button>
          </form>
          {message && <p className="mt-3">{message}</p>}
          <p className="mt-3">점수: {score}</p>
        </div>
      </div>
    </div>
  );
}

export default App;