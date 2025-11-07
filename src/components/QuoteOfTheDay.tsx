import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const quotes = [
  "The secret of getting ahead is getting started.",
  "Write what should not be forgotten.",
  "Your story is what you have, what you will always have.",
  "Today is a new beginning, a chance to turn your failures into achievements.",
  "Every day is a fresh start, make it count.",
  "The best time for new beginnings is now.",
  "Your thoughts shape your vision. Your vision shapes your reality.",
  "Document your journey, celebrate your growth.",
  "Small daily improvements over time lead to stunning results.",
  "Life is a story, make yours worth reading.",
];

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const today = new Date().toDateString();
    const lastQuoteDate = localStorage.getItem('quoteDate');
    
    if (lastQuoteDate !== today) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
      localStorage.setItem('quoteDate', today);
      localStorage.setItem('dailyQuote', randomQuote);
    } else {
      setQuote(localStorage.getItem('dailyQuote') || quotes[0]);
    }
  }, []);

  if (!quote) return null;

  return (
    <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-purple-400 mb-1">Quote of the Day</p>
          <p className="text-white/80 text-sm italic">&ldquo;{quote}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
