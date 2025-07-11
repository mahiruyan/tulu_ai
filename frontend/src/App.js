import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import { AuthProvider, useAuth } from "./AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Quiz data for each scene
const QUIZ_DATA = {
  "am_scene1": {
    questions: [
      {
        id: 1,
        question: "What does 'seviyorum' mean?",
        options: ["I hate", "I love", "I see", "I want"],
        correct: 1,
        explanation: "'Seviyorum' means 'I love' in Turkish."
      },
      {
        id: 2,
        question: "What does 'yasak' mean?",
        options: ["allowed", "forbidden", "beautiful", "happy"],
        correct: 1,
        explanation: "'Yasak' means 'forbidden' in Turkish."
      },
      {
        id: 3,
        question: "What does 'kalbim' mean?",
        options: ["my head", "my hand", "my heart", "my house"],
        correct: 2,
        explanation: "'Kalbim' means 'my heart' in Turkish."
      },
      {
        id: 4,
        question: "What does 'dinlemiyor' mean?",
        options: ["doesn't listen", "doesn't see", "doesn't want", "doesn't know"],
        correct: 0,
        explanation: "'Dinlemiyor' means 'doesn't listen' in Turkish."
      }
    ]
  },
  "am_scene2": {
    questions: [
      {
        id: 1,
        question: "What does 'hanım' mean?",
        options: ["sir", "madam", "child", "friend"],
        correct: 1,
        explanation: "'Hanım' means 'madam' or 'lady' in Turkish."
      },
      {
        id: 2,
        question: "What does 'davranış' mean?",
        options: ["behavior", "clothing", "food", "money"],
        correct: 0,
        explanation: "'Davranış' means 'behavior' in Turkish."
      },
      {
        id: 3,
        question: "What does 'ailemize' mean?",
        options: ["to our house", "to our car", "to our family", "to our work"],
        correct: 2,
        explanation: "'Ailemize' means 'to our family' in Turkish."
      },
      {
        id: 4,
        question: "What does 'zarar' mean?",
        options: ["help", "harm", "happiness", "health"],
        correct: 1,
        explanation: "'Zarar' means 'harm' in Turkish."
      }
    ]
  },
  "am_scene3": {
    questions: [
      {
        id: 1,
        question: "What does 'dayanamıyorum' mean?",
        options: ["I can't bear it", "I can't see it", "I can't hear it", "I can't find it"],
        correct: 0,
        explanation: "'Dayanamıyorum' means 'I can't bear it' in Turkish."
      },
      {
        id: 2,
        question: "What does 'acı' mean?",
        options: ["joy", "pain", "love", "hope"],
        correct: 1,
        explanation: "'Acı' means 'pain' in Turkish."
      },
      {
        id: 3,
        question: "What does 'gitmek' mean?",
        options: ["to come", "to stay", "to leave", "to sleep"],
        correct: 2,
        explanation: "'Gitmek' means 'to leave' or 'to go' in Turkish."
      }
    ]
  },
  "ks_scene1": {
    questions: [
      {
        id: 1,
        question: "What does 'kaderimsin' mean?",
        options: ["my friend", "my enemy", "my destiny", "my teacher"],
        correct: 2,
        explanation: "'Kaderimsin' means 'you are my destiny' in Turkish."
      },
      {
        id: 2,
        question: "What does 'anda' mean?",
        options: ["moment", "hour", "day", "year"],
        correct: 0,
        explanation: "'Anda' means 'moment' in Turkish."
      },
      {
        id: 3,
        question: "What does 'anladım' mean?",
        options: ["I forgot", "I understood", "I saw", "I heard"],
        correct: 1,
        explanation: "'Anladım' means 'I understood' in Turkish."
      }
    ]
  },
  "ks_scene2": {
    questions: [
      {
        id: 1,
        question: "What does 'evlenmek' mean?",
        options: ["to work", "to marry", "to travel", "to study"],
        correct: 1,
        explanation: "'Evlenmek' means 'to marry' in Turkish."
      },
      {
        id: 2,
        question: "What does 'başkasına' mean?",
        options: ["to myself", "to you", "to someone else", "to us"],
        correct: 2,
        explanation: "'Başkasına' means 'to someone else' in Turkish."
      },
      {
        id: 3,
        question: "What does 'ait' mean?",
        options: ["lost", "found", "belongs", "broken"],
        correct: 2,
        explanation: "'Ait' means 'belongs' in Turkish."
      }
    ]
  },
  "ks_scene3": {
    questions: [
      {
        id: 1,
        question: "What does 'feda' mean?",
        options: ["save", "sacrifice", "protect", "hide"],
        correct: 1,
        explanation: "'Feda' means 'sacrifice' in Turkish."
      },
      {
        id: 2,
        question: "What does 'gücü' mean?",
        options: ["weakness", "power", "sadness", "beauty"],
        correct: 1,
        explanation: "'Gücü' means 'power' in Turkish."
      },
      {
        id: 3,
        question: "What does 'sevdiğim' mean?",
        options: ["the one I hate", "the one I love", "the one I know", "the one I see"],
        correct: 1,
        explanation: "'Sevdiğim' means 'the one I love' in Turkish."
      }
    ]
  },
  "my_scene1": {
    questions: [
      {
        id: 1,
        question: "What does 'hazretleri' mean?",
        options: ["his majesty", "his friend", "his enemy", "his servant"],
        correct: 0,
        explanation: "'Hazretleri' means 'his majesty' in Turkish."
      },
      {
        id: 2,
        question: "What does 'entrika' mean?",
        options: ["party", "intrigue", "celebration", "meeting"],
        correct: 1,
        explanation: "'Entrika' means 'intrigue' in Turkish."
      },
      {
        id: 3,
        question: "What does 'dikkatli' mean?",
        options: ["careless", "careful", "happy", "sad"],
        correct: 1,
        explanation: "'Dikkatli' means 'careful' in Turkish."
      }
    ]
  },
  "my_scene2": {
    questions: [
      {
        id: 1,
        question: "What does 'güçlü' mean?",
        options: ["weak", "powerful", "small", "quiet"],
        correct: 1,
        explanation: "'Güçlü' means 'powerful' in Turkish."
      },
      {
        id: 2,
        question: "What does 'kimse' mean?",
        options: ["everyone", "someone", "no one", "anyone"],
        correct: 2,
        explanation: "'Kimse' means 'no one' in Turkish."
      },
      {
        id: 3,
        question: "What does 'karşı' mean?",
        options: ["with", "against", "for", "without"],
        correct: 1,
        explanation: "'Karşı' means 'against' in Turkish."
      }
    ]
  },
  "my_scene3": {
    questions: [
      {
        id: 1,
        question: "What does 'ferman' mean?",
        options: ["letter", "decree", "book", "map"],
        correct: 1,
        explanation: "'Ferman' means 'decree' in Turkish."
      },
      {
        id: 2,
        question: "What does 'imzalamak' mean?",
        options: ["to read", "to write", "to sign", "to speak"],
        correct: 2,
        explanation: "'İmzalamak' means 'to sign' in Turkish."
      },
      {
        id: 3,
        question: "What does 'adalet' mean?",
        options: ["injustice", "justice", "peace", "war"],
        correct: 1,
        explanation: "'Adalet' means 'justice' in Turkish."
      }
    ]
  }
};

// Turkish TV Series data
const TV_SERIES_DATA = [
  {
    id: "ask-i-memnu",
    title: "Aşk-ı Memnu",
    description: "Learn Turkish through this classic drama about forbidden love",
    color: "from-red-500 to-pink-500",
    scenes: [
      {
        id: "am_scene1",
        title: "Romantic Confession",
        videoUrl: "https://youtu.be/DateteeaXfY?si=nMFYlWqtVvtI-CfR",
        embedId: "DateteeaXfY",
        transcript: [
          { text: "Seni", translation: "You (object)" },
          { text: "çok", translation: "very much" },
          { text: "seviyorum", translation: "I love" },
          { text: "Behlül.", translation: "Behlül." },
          { text: "Bu", translation: "This" },
          { text: "aşk", translation: "love" },
          { text: "yasak", translation: "forbidden" },
          { text: "ama", translation: "but" },
          { text: "kalbim", translation: "my heart" },
          { text: "dinlemiyor.", translation: "doesn't listen." }
        ]
      },
      {
        id: "am_scene2", 
        title: "Family Drama",
        videoUrl: "https://youtu.be/KaTt0wDnI70?si=xGMF5Az3Woyr1eub",
        embedId: "KaTt0wDnI70",
        transcript: [
          { text: "Bihter", translation: "Bihter" },
          { text: "hanım,", translation: "madam," },
          { text: "bu", translation: "this" },
          { text: "davranış", translation: "behavior" },
          { text: "kabul", translation: "acceptable" },
          { text: "edilemez.", translation: "cannot be." },
          { text: "Ailemize", translation: "To our family" },
          { text: "zarar", translation: "harm" },
          { text: "veriyorsunuz.", translation: "you are causing." }
        ]
      },
      {
        id: "am_scene3",
        title: "Heartbreak",
        videoUrl: "https://youtu.be/J21L5UyrNGU?si=KJ",
        embedId: "J21L5UyrNGU",
        transcript: [
          { text: "Artık", translation: "Anymore" },
          { text: "dayanamıyorum.", translation: "I can't bear it." },
          { text: "Bu", translation: "This" },
          { text: "acı", translation: "pain" },
          { text: "çok", translation: "very" },
          { text: "büyük.", translation: "big." },
          { text: "Gitmek", translation: "To leave" },
          { text: "zorundayım.", translation: "I have to." }
        ]
      }
    ]
  },
  {
    id: "kara-sevda",
    title: "Kara Sevda",
    description: "Experience intense emotions through this passionate love story",
    color: "from-purple-500 to-indigo-500",
    scenes: [
      {
        id: "ks_scene1",
        title: "First Love",
        videoUrl: "https://youtu.be/sample1",
        embedId: "sample1",
        transcript: [
          { text: "Kemal,", translation: "Kemal," },
          { text: "seni", translation: "you (object)" },
          { text: "ilk", translation: "first" },
          { text: "gördüğüm", translation: "I saw" },
          { text: "anda", translation: "moment" },
          { text: "anladım.", translation: "I understood." },
          { text: "Sen", translation: "You" },
          { text: "benim", translation: "my" },
          { text: "kaderimsin.", translation: "destiny." }
        ]
      },
      {
        id: "ks_scene2",
        title: "Jealousy",
        videoUrl: "https://youtu.be/sample2", 
        embedId: "sample2",
        transcript: [
          { text: "Nihan", translation: "Nihan" },
          { text: "ile", translation: "with" },
          { text: "evlenmek", translation: "to marry" },
          { text: "istemiyorum.", translation: "I don't want." },
          { text: "Kalbim", translation: "My heart" },
          { text: "başkasına", translation: "to someone else" },
          { text: "ait.", translation: "belongs." }
        ]
      },
      {
        id: "ks_scene3",
        title: "Sacrifice",
        videoUrl: "https://youtu.be/sample3",
        embedId: "sample3", 
        transcript: [
          { text: "Sevdiğim", translation: "The one I love" },
          { text: "için", translation: "for" },
          { text: "her", translation: "every" },
          { text: "şeyi", translation: "thing" },
          { text: "feda", translation: "sacrifice" },
          { text: "ederim.", translation: "I would." },
          { text: "Bu", translation: "This" },
          { text: "aşkın", translation: "love's" },
          { text: "gücü.", translation: "power." }
        ]
      }
    ]
  },
  {
    id: "muhtesem-yuzyil",
    title: "Magnificent Century",
    description: "Learn Ottoman Turkish and historical vocabulary",
    color: "from-yellow-500 to-orange-500",
    scenes: [
      {
        id: "my_scene1",
        title: "Palace Intrigue",
        videoUrl: "https://youtu.be/sample4",
        embedId: "sample4",
        transcript: [
          { text: "Sultan", translation: "Sultan" },
          { text: "Süleyman", translation: "Süleyman" },
          { text: "hazretleri,", translation: "his majesty," },
          { text: "sarayda", translation: "in the palace" },
          { text: "entrika", translation: "intrigue" },
          { text: "var.", translation: "there is." },
          { text: "Dikkatli", translation: "Careful" },
          { text: "olmalısınız.", translation: "you must be." }
        ]
      },
      {
        id: "my_scene2",
        title: "Hürrem's Power",
        videoUrl: "https://youtu.be/sample5",
        embedId: "sample5",
        transcript: [
          { text: "Hürrem", translation: "Hürrem" },
          { text: "Sultan", translation: "Sultan" },
          { text: "artık", translation: "now" },
          { text: "çok", translation: "very" },
          { text: "güçlü.", translation: "powerful." },
          { text: "Kimse", translation: "No one" },
          { text: "ona", translation: "to her" },
          { text: "karşı", translation: "against" },
          { text: "gelemez.", translation: "can come." }
        ]
      },
      {
        id: "my_scene3",
        title: "Royal Decree",
        videoUrl: "https://youtu.be/sample6",
        embedId: "sample6",
        transcript: [
          { text: "Padişahım,", translation: "My Sultan," },
          { text: "ferman", translation: "decree" },
          { text: "hazır.", translation: "is ready." },
          { text: "İmzalamak", translation: "To sign" },
          { text: "için", translation: "for" },
          { text: "bekliyoruz.", translation: "we wait." },
          { text: "Adalet", translation: "Justice" },
          { text: "yerini", translation: "its place" },
          { text: "bulacak.", translation: "will find." }
        ]
      }
    ]
  }
];

// Extended Turkish word dictionary
const EXTENDED_TURKISH_WORDS = {
  // Love and emotions
  "seni": { meaning: "you (object)", pronunciation: "sen-i", example: "Seni çok seviyorum." },
  "seviyorum": { meaning: "I love", pronunciation: "se-vi-yo-rum", example: "Seni seviyorum." },
  "aşk": { meaning: "love", pronunciation: "ashk", example: "Aşk acı verir." },
  "kalbim": { meaning: "my heart", pronunciation: "kal-bim", example: "Kalbim seni seçti." },
  "acı": { meaning: "pain", pronunciation: "a-juh", example: "Bu acı çok büyük." },
  "sevdiğim": { meaning: "the one I love", pronunciation: "sev-di-im", example: "Sevdiğim kişi sen." },
  
  // Family and relationships
  "ailemize": { meaning: "to our family", pronunciation: "ai-le-mi-ze", example: "Ailemize hoş geldin." },
  "hanım": { meaning: "madam/lady", pronunciation: "ha-nım", example: "Ayşe hanım geldi." },
  "evlenmek": { meaning: "to marry", pronunciation: "ev-len-mek", example: "Evlenmek istiyorum." },
  
  // Royal and historical
  "sultan": { meaning: "sultan", pronunciation: "sul-tan", example: "Sultan sarayda yaşar." },
  "hazretleri": { meaning: "his majesty", pronunciation: "haz-ret-le-ri", example: "Sultan hazretleri geldi." },
  "sarayda": { meaning: "in the palace", pronunciation: "sa-ray-da", example: "Sarayda yaşıyorum." },
  "padişahım": { meaning: "my sultan", pronunciation: "pa-di-sha-hım", example: "Padişahım, emriniz?" },
  "ferman": { meaning: "decree", pronunciation: "fer-man", example: "Ferman imzalandı." },
  
  // Common words
  "çok": { meaning: "very much", pronunciation: "chok", example: "Çok güzel." },
  "ama": { meaning: "but", pronunciation: "a-ma", example: "Güzel ama pahalı." },
  "artık": { meaning: "anymore/now", pronunciation: "ar-tık", example: "Artık gitmek istiyorum." },
  "için": { meaning: "for", pronunciation: "i-chin", example: "Sen için yaparım." },
  "ile": { meaning: "with", pronunciation: "i-le", example: "Seninle gelmek istiyorum." },
  "var": { meaning: "there is", pronunciation: "var", example: "Evde süt var." },
  "büyük": { meaning: "big", pronunciation: "bü-yük", example: "Büyük bir ev." },
  "güçlü": { meaning: "powerful", pronunciation: "güch-lü", example: "Çok güçlü bir adam." },
  "kimse": { meaning: "no one", pronunciation: "kim-se", example: "Kimse bilmiyor." },
  "adalet": { meaning: "justice", pronunciation: "a-da-let", example: "Adalet için savaşıyorum." },
  "dikkatli": { meaning: "careful", pronunciation: "dik-kat-li", example: "Dikkatli ol!" },
  
  // Existing words from original dictionary
  "günaydın": { meaning: "good morning", pronunciation: "goo-nay-duhn", example: "Günaydın! Nasılsın?" },
  "kahvaltı": { meaning: "breakfast", pronunciation: "kah-val-tuh", example: "Kahvaltı yapmak istiyorum." },
  "merhaba": { meaning: "hello", pronunciation: "mer-ha-ba", example: "Merhaba! Nasılsın?" },
  "teşekkür": { meaning: "thank you", pronunciation: "teh-shek-kur", example: "Teşekkür ederim!" },
  "evet": { meaning: "yes", pronunciation: "eh-vet", example: "Evet, doğru." },
  "abla": { meaning: "older sister", pronunciation: "ab-la", example: "Ablam çok güzel." },
  "güzel": { meaning: "beautiful/nice", pronunciation: "gue-zel", example: "Bu çok güzel!" },
  "pahalı": { meaning: "expensive", pronunciation: "pa-ha-luh", example: "Bu çok pahalı." },
  "indirim": { meaning: "discount", pronunciation: "in-di-rim", example: "Size indirim yapabilirim." },
  "memnun": { meaning: "pleased/happy", pronunciation: "mem-nun", example: "Memnun oldum." }
};

// Quiz Component
const QuizComponent = ({ sceneId, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const quiz = QUIZ_DATA[sceneId];
  
  if (!quiz) return null;
  
  const handleAnswerSelect = (questionId, selectedOption) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
    setShowExplanation(true);
    
    // Auto advance to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setShowExplanation(false);
      } else {
        // Calculate final score
        const totalCorrect = quiz.questions.reduce((acc, question) => {
          return acc + (selectedAnswers[question.id] === question.correct ? 1 : 0);
        }, 0);
        // Add the current question if correct
        if (selectedOption === quiz.questions[currentQuestion].correct) {
          setScore(totalCorrect + 1);
        } else {
          setScore(totalCorrect);
        }
        setTimeout(() => {
          setShowResults(true);
        }, 1000);
      }
    }, 2000);
  };
  
  const currentQ = quiz.questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQ.id];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {!showResults ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Mini Quiz</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                <span>Progress: {Math.round((currentQuestion / quiz.questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentQuestion / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">{currentQ.question}</h4>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQ.id, index)}
                    disabled={selectedAnswer !== undefined}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === undefined 
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        : selectedAnswer === index
                          ? index === currentQ.correct 
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-red-500 bg-red-50 text-red-800'
                          : index === currentQ.correct
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            
            {showExplanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  {selectedAnswer === currentQ.correct ? (
                    <span className="text-green-600 font-semibold">✓ Correct!</span>
                  ) : (
                    <span className="text-red-600 font-semibold">✗ Incorrect</span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{currentQ.explanation}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {score}/{quiz.questions.length}
              </div>
              <p className="text-gray-600">
                {score === quiz.questions.length 
                  ? "Perfect! You mastered all the words!"
                  : score >= quiz.questions.length * 0.8
                    ? "Great job! You're learning well!"
                    : "Good effort! Keep practicing!"}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// TV Series Learning Component
// TV Series Learning Component - Now as a dedicated page
const TVSeriesLearning = () => {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordData, setWordData] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const handleWordClick = (word) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
    setSelectedWord(word);
    
    if (EXTENDED_TURKISH_WORDS[cleanWord]) {
      setWordData({
        word: word,
        meaning: EXTENDED_TURKISH_WORDS[cleanWord].meaning,
        pronunciation: EXTENDED_TURKISH_WORDS[cleanWord].pronunciation,
        example: EXTENDED_TURKISH_WORDS[cleanWord].example
      });
    } else {
      setWordData({
        word: word,
        meaning: "Word not found in dictionary",
        pronunciation: "N/A",
        example: "N/A"
      });
    }
  };

  const handleTakeQuiz = (sceneId) => {
    setActiveQuiz(sceneId);
  };

  if (!selectedSeries) {
    // Show series selection cards
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">🎬 Learn Turkish with TV Series</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master Turkish through authentic scenes from popular Turkish dramas. 
              Choose your favorite series and start learning!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TV_SERIES_DATA.map((series) => (
              <div
                key={series.id}
                onClick={() => setSelectedSeries(series)}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className={`h-32 bg-gradient-to-r ${series.color} flex items-center justify-center`}>
                  <div className="text-white text-6xl">
                    {series.id === 'ask-i-memnu' ? '💔' : 
                     series.id === 'kara-sevda' ? '💜' : '👑'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{series.title}</h3>
                  <p className="text-gray-600 mb-4">{series.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{series.scenes.length} scenes</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Start Learning
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show selected series scenes
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setSelectedSeries(null)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Series Selection</span>
          </button>
          
          <div className={`px-6 py-3 rounded-full bg-gradient-to-r ${selectedSeries.color} text-white`}>
            <h2 className="text-xl font-bold">{selectedSeries.title}</h2>
          </div>
        </div>

        {/* Series description */}
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {selectedSeries.description}
          </p>
        </div>

        {/* Scenes grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {selectedSeries.scenes.map((scene) => (
            <div key={scene.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${scene.embedId}`}
                  title={scene.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              
              <div className="p-6">
                <h4 className="text-xl font-bold mb-4">{scene.title}</h4>
                
                {/* Interactive Transcript */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold mb-3 text-gray-700">Interactive Transcript:</h5>
                  <div className="text-lg leading-relaxed mb-3">
                    {scene.transcript.map((word, index) => (
                      <span key={index} className="inline-block">
                        <span
                          onClick={() => handleWordClick(word.text)}
                          className="cursor-pointer hover:bg-yellow-200 hover:underline mr-2 p-1 rounded transition-colors"
                        >
                          {word.text}
                        </span>
                        {index < scene.transcript.length - 1 && ' '}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-gray-200 text-gray-600 text-sm">
                    <strong>Translation:</strong> {scene.transcript.map(word => word.translation).join(' ')}
                  </div>
                </div>

                {/* Take Quiz Button */}
                <button
                  onClick={() => handleTakeQuiz(scene.id)}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105"
                >
                  🧠 Take Quiz ({QUIZ_DATA[scene.id]?.questions.length || 0} questions)
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quiz Modal */}
        {activeQuiz && (
          <QuizComponent
            sceneId={activeQuiz}
            onClose={() => setActiveQuiz(null)}
          />
        )}

        {/* Word Popup */}
        {selectedWord && wordData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Word Information</h3>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Word:</span> {wordData.word}
                </div>
                <div>
                  <span className="font-semibold">Meaning:</span> {wordData.meaning}
                </div>
                <div>
                  <span className="font-semibold">Pronunciation:</span> {wordData.pronunciation}
                </div>
                <div>
                  <span className="font-semibold">Example:</span> {wordData.example}
                </div>
              </div>
              <button
                onClick={() => setSelectedWord(null)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = ['Home', 'Learn with TV Series', 'Tulu Tutor', 'Tulu Store', 'Visit Turkey'];
  
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          🇹🇷 Tulu
        </div>
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// Home Component - Cleaned up version
const Home = () => {
  const [scenes, setScenes] = useState([]);
  const [selectedScene, setSelectedScene] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScenes();
  }, []);

  const fetchScenes = async () => {
    try {
      const response = await axios.get(`${API}/scenes`);
      setScenes(response.data.scenes);
      setSelectedScene(response.data.scenes[0]); // Select first scene by default
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scenes:', error);
      setLoading(false);
    }
  };

  const handleWordClick = async (word) => {
    try {
      setSelectedWord(word);
      const response = await axios.get(`${API}/word/${word}`);
      setWordData(response.data);
    } catch (error) {
      console.error('Word not found:', error);
      setWordData({
        word: word,
        meaning: "Word not found in dictionary",
        pronunciation: "N/A",
        example: "N/A"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Learn Turkish with TV Series</h1>
          <p className="text-xl mb-8">Master Turkish through authentic dialogues and cultural context</p>
          <div className="w-full max-w-4xl mx-auto">
            <img 
              src="https://images.unsplash.com/photo-1698852785697-d3a395832e03?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHx0dXJraXNoJTIwY3VsdHVyZXxlbnwwfHx8Ymx1ZXwxNzUyMjE5MzY3fDA&ixlib=rb-4.1.0&q=85"
              alt="Turkish Culture"
              className="w-full h-64 object-cover rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Scene Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Practice with Sample Scenes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedScene?.id === scene.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-semibold text-lg">{scene.title}</h3>
                <p className="text-gray-600 text-sm mt-1">Turkish TV Scene</p>
              </button>
            ))}
          </div>
        </div>

        {/* Video Player and Transcript */}
        {selectedScene && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Player */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{selectedScene.title}</h3>
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  key={selectedScene.id}
                  controls
                  className="w-full h-64"
                  src={selectedScene.video_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Interactive Transcript */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Interactive Transcript</h3>
              <div className="bg-white rounded-lg p-4 shadow-lg max-h-64 overflow-y-auto">
                {selectedScene.transcript.map((line, index) => (
                  <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                    <div className="text-lg font-medium mb-2">
                      {line.text.split(' ').map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          onClick={() => handleWordClick(word.replace(/[.,!?]/g, ''))}
                          className="cursor-pointer hover:bg-yellow-200 hover:underline mr-1 p-1 rounded"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                    <div className="text-gray-600">{line.translation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action for TV Series */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for More Advanced Learning?</h2>
          <p className="text-lg mb-6">
            Explore our complete Turkish TV series collection with interactive quizzes and comprehensive lessons!
          </p>
          <button
            onClick={() => window.location.href = '#tv-series'}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            🎬 Explore TV Series Collection
          </button>
        </div>

        {/* Word Popup */}
        {selectedWord && wordData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Word Information</h3>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Word:</span> {wordData.word}
                </div>
                <div>
                  <span className="font-semibold">Meaning:</span> {wordData.meaning}
                </div>
                <div>
                  <span className="font-semibold">Pronunciation:</span> {wordData.pronunciation}
                </div>
                <div>
                  <span className="font-semibold">Example:</span> {wordData.example}
                </div>
              </div>
              <button
                onClick={() => setSelectedWord(null)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Tulu Tutor Component
const TuluTutor = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Merhaba! 👋 I'm Tulu, your Turkish language tutor. Ask me anything about Turkish words, grammar, pronunciation, or culture!",
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/tutor`, {
        question: currentMessage,
        session_id: sessionId
      });
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Error asking tutor:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I couldn\'t process your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "What does 'abla' mean?",
    "How do you say 'thank you' in Turkish?",
    "Explain Turkish sentence structure",
    "What's the difference between 'var' and 'yok'?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-lg shadow-lg p-6 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Tulu Tutor</h1>
                <p className="text-gray-600 text-sm">Your Turkish Language Assistant</p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-white shadow-lg">
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg chat-bubble ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-lg'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none shadow-md'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg max-w-xs shadow-md rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full typing-dot"></div>
                    </div>
                    <span className="text-gray-500 text-sm">Tulu is typing...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask about Turkish words, grammar, or culture..."
                  className="flex-1 p-3 border border-gray-300 rounded-full chat-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !currentMessage.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed send-button"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="bg-white rounded-b-lg shadow-lg p-6">
            <h3 className="font-semibold mb-3 text-gray-800">Quick Questions:</h3>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMessage(question)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tulu Store Component (Blurred Coming Soon)
const TuluStore = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="relative">
          {/* Blurred Content */}
          <div className="filter blur-sm">
            <h1 className="text-3xl font-bold mb-6">🛍️ Tulu Store</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <h3 className="font-bold text-lg mb-2">Turkish Product {item}</h3>
                  <p className="text-gray-600 mb-4">Authentic Turkish merchandise and cultural items</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">₺{item * 25}</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Coming Soon! 🚀</h2>
              <p className="text-gray-600 mb-4">
                We're preparing an amazing collection of Turkish cultural products, 
                books, and merchandise to enhance your learning experience.
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
                Notify Me When Available
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Visit Turkey Component (Blurred Coming Soon)
const VisitTurkey = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="relative">
          {/* Blurred Content */}
          <div className="filter blur-sm">
            <h1 className="text-3xl font-bold mb-6">✈️ Visit Turkey</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Flight Booking */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">✈️ Flight Booking</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">From</label>
                      <input type="text" className="w-full p-2 border rounded" placeholder="New York" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">To</label>
                      <input type="text" className="w-full p-2 border rounded" placeholder="Istanbul" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Departure</label>
                      <input type="date" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Return</label>
                      <input type="date" className="w-full p-2 border rounded" />
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
                    Search Flights
                  </button>
                </div>
              </div>

              {/* Hotel Booking */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">🏨 Hotel Booking</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination</label>
                    <input type="text" className="w-full p-2 border rounded" placeholder="Istanbul, Turkey" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-in</label>
                      <input type="date" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-out</label>
                      <input type="date" className="w-full p-2 border rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Guests</label>
                    <select className="w-full p-2 border rounded">
                      <option>1 Guest</option>
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4 Guests</option>
                    </select>
                  </div>
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg">
                    Search Hotels
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Destinations */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Popular Turkish Destinations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Istanbul', 'Cappadocia', 'Antalya', 'Izmir', 'Ankara', 'Bursa'].map((city) => (
                  <div key={city} className="bg-white rounded-lg shadow-lg p-4">
                    <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                    <h3 className="font-bold text-lg">{city}</h3>
                    <p className="text-gray-600 text-sm">Discover the beauty of {city}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Coming Soon! 🇹🇷</h2>
              <p className="text-gray-600 mb-4">
                We're partnering with Turkish travel agencies to bring you 
                the best deals on flights, hotels, and cultural experiences in Turkey.
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg">
                Get Early Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <Home />;
      case 'Learn with TV Series':
        return <TVSeriesLearning />;
      case 'Tulu Tutor':
        return <TuluTutor />;
      case 'Tulu Store':
        return <TuluStore />;
      case 'Visit Turkey':
        return <VisitTurkey />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
      
      {/* TV Series Learning Section */}
      <TVSeriesLearning />
    </div>
  );
}

export default App;