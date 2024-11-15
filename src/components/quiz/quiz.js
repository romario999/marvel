import React, { useState, useEffect, useCallback } from 'react';
import useMarvelService from '../../services/MarvelService'; 
import './quiz.css'; // Імпорт стилів
import Spinner from '../spinner/Spinner';

const Quiz = () => {
    const [characters, setCharacters] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [shuffledAnswers, setShuffledAnswers] = useState([]);
    const [isAnswering, setIsAnswering] = useState(false); // Додано: прапорець для контролю вибору відповіді
    const { getCharacterPhotoAndName } = useMarvelService();

    // Функція для генерації випадкового порядку елементів
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Функція для генерації варіантів відповідей
    const shuffleAnswers = useCallback((currentQuestion) => {
        if (!currentQuestion || !currentQuestion.name) {
            return [];
        }
        const answers = [...characters]
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map((char) => char.name);

        if (!answers.includes(currentQuestion.name)) {
            answers[Math.floor(Math.random() * answers.length)] = currentQuestion.name;
        }

        return answers;
    }, [characters]);

    const loadCharacters = useCallback(async () => {
        if (characters.length === 0) {
            const chars = await getCharacterPhotoAndName();
            setCharacters(chars);
        }
    }, [characters, getCharacterPhotoAndName]);

    const generateQuestions = useCallback(() => {
        if (characters.length > 0 && questions.length === 0) { // Генерація запитань лише один раз
            const selectedQuestions = shuffleArray(characters).slice(0, 10);
            setQuestions(selectedQuestions);
        }
    }, [characters, questions]);

    const handleAnswer = (answer) => {
        if (isAnswering) return; // Запобігаємо повторному вибору під час обробки

        setIsAnswering(true); // Встановлюємо прапорець, що вибір здійснено
        if (answer === questions[currentQuestionIndex]?.name) {
            setScore(prevScore => prevScore + 1);
        }
        setSelectedAnswer(answer);

        setTimeout(() => {
            setSelectedAnswer(null);
            setCurrentQuestionIndex(prevIndex => {
                const nextIndex = prevIndex + 1;
                // Генерація нових варіантів відповідей після переходу
                if (nextIndex < questions.length) {
                    setShuffledAnswers(shuffleAnswers(questions[nextIndex]));
                }
                return nextIndex; // Повертаємо новий індекс
            });
            setIsAnswering(false); // Скидаємо прапорець після переходу до наступного питання
        }, 1000);
    };

    useEffect(() => {
        loadCharacters();
    }, [loadCharacters]);

    useEffect(() => {
        generateQuestions(); // Генерація запитань лише коли персонажі завантажені
    }, [characters, generateQuestions]);

    useEffect(() => {
        if (questions.length > 0 && !isAnswering) {
            const currentQuestion = questions[currentQuestionIndex];
            if (shuffledAnswers.length === 0) { // Генерація варіантів лише при переході до нового питання
                setShuffledAnswers(shuffleAnswers(currentQuestion));
            }
        }
    }, [currentQuestionIndex, questions, isAnswering, shuffledAnswers.length, shuffleAnswers]); // shuffleAnswers додано

    if (characters.length === 0) {
        return <Spinner />;
    }

    if (currentQuestionIndex >= 10) {
        return <div style={{ fontSize: 32 }}>Your score: {score}/10</div>;
    }

    const currentCharacter = questions[currentQuestionIndex];

    if (!currentCharacter) {
        return <Spinner />;
    }

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h2>Marvel Quiz</h2>
                <p>Question {currentQuestionIndex + 1} of 10</p>
            </div>
            <img className="character-image" src={currentCharacter.thumbnail} alt={currentCharacter.name} />
            <p>Who is this character?</p>
            {shuffledAnswers.map((answer) => (
                <button
                    key={answer}
                    onClick={() => handleAnswer(answer)}
                    disabled={isAnswering} // Вимкнення кнопки під час обробки
                    className={`answer-button ${
                        selectedAnswer
                            ? answer === currentCharacter.name
                                ? 'correct'
                                : answer === selectedAnswer
                                ? 'incorrect'
                                : ''
                            : ''
                    }`}
                >
                    {answer}
                </button>
            ))}
        </div>
    );
};

export default Quiz;
