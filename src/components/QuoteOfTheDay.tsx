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
    <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-6 rounded-2xl border border-primary/20 shadow-soft animate-fade-in">
      <div className="flex items-start gap-3">
        <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1 animate-pulse-glow" />
        <div>
          <p className="text-sm font-semibold text-primary mb-1">Quote of the Day</p>
          <p className="text-foreground italic">&ldquo;{quote}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
