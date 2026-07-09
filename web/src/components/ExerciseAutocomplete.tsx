import { useEffect, useRef, useState } from 'react';
import { searchExercises } from '../lib/api';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ExerciseAutocomplete({ value, onChange, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<{ id: number | null; name: string }[]>([]);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      setVisible(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const results = await searchExercises(value);
      setSuggestions(results.slice(0, 8));
      setVisible(results.length > 0);
      setActiveIndex(-1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function select(name: string) {
    onChange(name);
    setVisible(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!visible || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex].name);
    } else if (e.key === 'Escape') {
      setVisible(false);
    }
  }

  return (
    <div className="relative flex-1">
      <input
        type="text"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setVisible(false), 150)}
        onFocus={() => suggestions.length > 0 && setVisible(true)}
        className={className}
        required
      />
      {visible && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-card-border bg-card shadow-2xl">
          {suggestions.map((s, i) => (
            <div
              key={`${s.id}-${s.name}`}
              onMouseDown={(e) => {
                e.preventDefault();
                select(s.name);
              }}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === activeIndex ? 'bg-accent/15' : 'hover:bg-accent/10'
              }`}
            >
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
