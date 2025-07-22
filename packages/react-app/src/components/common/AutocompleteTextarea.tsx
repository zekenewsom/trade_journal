import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteTextareaProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  field: string; // Field name for autocomplete data fetching
  placeholder?: string;
  required?: boolean;
  className?: string;
  rows?: number;
}

const AutocompleteTextarea: React.FC<AutocompleteTextareaProps> = ({
  id,
  name,
  value,
  onChange,
  field,
  placeholder,
  required = false,
  className = "",
  rows = 3
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch autocomplete data on mount
  useEffect(() => {
    const fetchAutocompleteData = async () => {
      try {
        const result = await window.electronAPI.getAutocompleteData(field);
        if (result.success) {
          setAllOptions(result.data);
        }
      } catch (error) {
        console.error('Error fetching autocomplete data:', error);
      }
    };

    fetchAutocompleteData();
  }, [field]);

  // Filter suggestions based on input value
  useEffect(() => {
    if (value && allOptions.length > 0) {
      const filtered = allOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value, allOptions]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    setShowSuggestions(true);
    setActiveSuggestion(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const syntheticEvent = {
      target: { name, value: suggestion }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(syntheticEvent);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (activeSuggestion >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
    }
  };

  const handleTextareaFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }, 150);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        onFocus={handleTextareaFocus}
        onBlur={handleTextareaBlur}
        placeholder={placeholder}
        required={required}
        className={className}
        rows={rows}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full bg-surface border border-card-stroke rounded mt-1 max-h-40 overflow-y-auto shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`p-2 cursor-pointer text-on-surface hover:bg-surface-variant text-sm ${
                index === activeSuggestion ? 'bg-surface-variant' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.length > 100 ? `${suggestion.substring(0, 100)}...` : suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteTextarea;