'use client';

import { useState, useRef, useEffect } from 'react';
import { Zap, Clock, RefreshCw, BarChart2, Award } from 'lucide-react';

export default function Home() {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{ cps: number; clicks: number } | null>(null);
  const [testDuration, setTestDuration] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const testStartTime = useRef<number | null>(null);
  const clickAreaRef = useRef<HTMLDivElement>(null);
  const [bestScore, setBestScore] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem('bestCPS') || '0');
    }
    return 0;
  });

  const startTest = () => {
    if (isRunning) return;
    
    // Reset all test states
    setClicks(0);
    setResults(null);
    setShowResults(false);
    setTimeLeft(testDuration);
    
    // Start the test
    testStartTime.current = Date.now();
    setIsRunning(true);
  };

  const handleClick = () => {
    // Only count clicks if the test is running
    if (isRunning) {
      setClicks(prev => prev + 1);
    }
  };

  const resetTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setTimeLeft(testDuration);
    setClicks(0);
    setResults(null);
    setShowResults(false);
  };

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else if (isRunning) {
      clearInterval(timerRef.current!);
      const totalTime = (Date.now() - testStartTime.current!) / 1000;
      const cps = clicks / totalTime;
      const result = { cps, clicks };
      setResults(result);
      setShowResults(true);
      setIsRunning(false);
      
      // Update best score if current is better
      if (cps > (bestScore || 0)) {
        setBestScore(parseFloat(cps.toFixed(2)));
        if (typeof window !== 'undefined') {
          localStorage.setItem('bestCPS', cps.toFixed(2));
        }
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, isRunning, clicks, bestScore]);

  const getButtonText = () => {
    if (!isRunning && !showResults) return 'Click to Start';
    if (isRunning) return 'Keep Clicking!';
    return 'Click to Restart';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 text-white">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Zap className="w-8 h-8" />
            CPS Test Pro
          </h1>
          <p className="text-center text-pink-100 mt-1">Test your mouse clicking speed</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-pink-500">{clicks}</div>
            <div className="text-gray-500 text-sm">Clicks</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-pink-500">
              {isRunning ? timeLeft.toFixed(1) : testDuration}.0s
            </div>
            <div className="text-gray-500 text-sm">Time Left</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-pink-500">
              {bestScore ? bestScore.toFixed(1) : '--'}
            </div>
            <div className="text-gray-500 text-sm">Best CPS</div>
          </div>
        </div>

        {/* Click Area */}
        <div className="p-6">
          <div 
            ref={clickAreaRef}
            onClick={handleClick}
            className={`h-64 rounded-xl border-4 border-dashed flex items-center justify-center transition-all duration-200 ${
              isRunning 
                ? 'bg-red-50 border-red-200 hover:bg-red-100 cursor-pointer' 
                : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-75'
            }`}
          >
            <div className="text-center">
              {isRunning ? (
                <>
                  <div className="text-2xl font-semibold text-gray-700 mb-2">
                    Keep Clicking!
                  </div>
                  <div className="text-4xl font-bold text-pink-600 mt-2">
                    {clicks}
                  </div>
                </>
              ) : showResults ? (
                <div className="text-gray-500">Click "Start Test" to try again</div>
              ) : (
                <div className="text-gray-500">Click "Start Test" to begin</div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="duration" className="text-sm font-medium text-gray-700">
                Test Duration:
              </label>
              <select
                id="duration"
                value={testDuration}
                onChange={(e) => setTestDuration(Number(e.target.value))}
                disabled={isRunning}
                className="rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-sm"
              >
                {[1, 3, 5, 10, 15, 30, 60].map((sec) => (
                  <option key={sec} value={sec}>
                    {sec} second{sec !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={resetTest}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
              {isRunning ? (
                <button
                  onClick={resetTest}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Stop Test
                </button>
              ) : (
                <button
                  onClick={startTest}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Start Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {showResults && results && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-t">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                Test Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <BarChart2 className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-3xl font-bold text-blue-600">{results.cps.toFixed(2)}</div>
                  <div className="text-gray-600">Clicks Per Second</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <Clock className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <div className="text-3xl font-bold text-green-600">{testDuration}s</div>
                  <div className="text-gray-600">Test Duration</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <Award className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <div className="text-3xl font-bold text-yellow-600">{results.clicks}</div>
                  <div className="text-gray-600">Total Clicks</div>
                </div>
              </div>
              
              {bestScore !== null && results.cps >= bestScore && results.cps > 0 && (
                <div className="mt-6 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
                  <div className="font-medium text-yellow-800">🏆 New Personal Best! 🏆</div>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-4">
                  {results.cps < 5 ? 'Keep practicing! ' : 
                   results.cps < 10 ? 'Good job! ' : 
                   results.cps < 15 ? 'Excellent clicking! ' : 
                   'Incredible speed! '}
                  {results.cps < 5 ? 'Aim for at least 5 CPS for a good score.' : 
                   'Try different clicking techniques to improve further!'}
                </p>
                <button
                  onClick={resetTest}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Created with ❤️ using Next.js, TypeScript, and Tailwind CSS</p>
        <p className="mt-1">Click anywhere in the box above to start testing your CPS!</p>
      </footer>
    </main>
  );
}
