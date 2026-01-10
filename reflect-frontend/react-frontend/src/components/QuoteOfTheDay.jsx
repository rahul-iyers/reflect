import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const QUOTES = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair"
  },
  {
    text: "Success is not how high you have climbed, but how you make a positive difference to the world.",
    author: "Roy T. Bennett"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    text: "In the middle of every difficulty lies opportunity.",
    author: "Albert Einstein"
  },
  {
    text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown"
  },
  {
    text: "Great things never come from comfort zones.",
    author: "Unknown"
  },
  {
    text: "Dream it. Wish it. Do it.",
    author: "Unknown"
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery"
  },
  {
    text: "Little things make big days.",
    author: "Unknown"
  }
];

export default function QuoteOfTheDay({ onClose }) {
  const { timeOfDay } = useTheme();
  const [quote, setQuote] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Get quote based on current date (same quote for the whole day)
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const quoteIndex = dayOfYear % QUOTES.length;
    setQuote(QUOTES[quoteIndex]);

    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      if (onClose) onClose();
    }, 500);
  };

  if (!shouldRender || !quote) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative max-w-2xl w-full transition-all duration-700 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* Quote Card */}
        <div className={`relative rounded-3xl p-12 border-2 shadow-2xl ${
          timeOfDay === 'morning'
            ? 'bg-gradient-to-br from-zinc-900 via-blue-950/20 to-zinc-900 border-blue-400/30 shadow-blue-500/20'
            : 'bg-gradient-to-br from-zinc-900 via-amber-950/20 to-zinc-900 border-amber-400/30 shadow-amber-500/20'
        }`}>
          {/* Decorative glow */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl ${
              timeOfDay === 'morning' ? 'bg-blue-500/10' : 'bg-amber-500/10'
            }`}></div>
            <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl ${
              timeOfDay === 'morning' ? 'bg-sky-500/10' : 'bg-orange-500/10'
            }`}></div>
          </div>

          <div className="relative">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                timeOfDay === 'morning'
                  ? 'bg-gradient-to-br from-blue-400 to-sky-500 shadow-blue-500/30'
                  : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
              }`}>
                <Sparkles className="text-zinc-900" size={32} />
              </div>
            </div>

            {/* Label */}
            <div className="text-center mb-6">
              <p className={`text-sm font-semibold tracking-wider uppercase ${
                timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'
              }`}>
                Quote of the Day
              </p>
            </div>

            {/* Quote */}
            <blockquote className="text-center space-y-6">
              <p className="text-2xl md:text-3xl font-serif italic text-zinc-100 leading-relaxed">
                "{quote.text}"
              </p>
              <footer>
                <cite className={`text-lg font-medium not-italic ${
                  timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'
                }`}>
                  — {quote.author}
                </cite>
              </footer>
            </blockquote>

            {/* Dismiss hint */}
            <div className="mt-10 text-center">
              <button
                onClick={handleClose}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  timeOfDay === 'morning'
                    ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                Continue to Reflect
              </button>
            </div>
          </div>
        </div>

        {/* Subtle animation: floating sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full animate-pulse ${
                timeOfDay === 'morning' ? 'bg-blue-400' : 'bg-amber-400'
              }`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
