import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  field: string; // Field name for autocomplete data fetching
  placeholder?: string;
  required?: boolean;
  className?: string;
  type?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  name,
  value,
  onChange,
  field,
  placeholder,
  required = false,
  className = "",
  type = "text"
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch autocomplete data on mount
  useEffect(() => {
    let mounted = true;
    const fetchAutocompleteData = async () => {
      try {
        // For large datasets, consider implementing server-side filtering:
        // Pass the current value as a search term to the fetch function and fetch filtered results only.
        const result = await window.electronAPI.getAutocompleteData(field);
        if (mounted && result.success) {
          setAllOptions(result.data);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error fetching autocomplete data:', error);
        }
      }
    };
    fetchAutocompleteData();
    return () => {
      mounted = false;
    };
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    setShowSuggestions(true);
    setActiveSuggestion(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const syntheticEvent = {
      target: { name, value: suggestion }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        e.preventDefault();
        if (activeSuggestion >= 0) {
          handleSuggestionClick(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }, 150);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions && suggestions.length > 0}
        aria-controls={`${id}-suggestions-listbox`}
        aria-activedescendant={
          showSuggestions && activeSuggestion >= 0
            ? `${id}-suggestion-${activeSuggestion}`
            : undefined
        }
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id={`${id}-suggestions-listbox`}
          role="listbox"
          className="absolute z-50 w-full bg-surface border border-card-stroke rounded mt-1 max-h-40 overflow-y-auto shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              id={`${id}-suggestion-${index}`}
              role="option"
              aria-selected={index === activeSuggestion}
              className={`p-2 cursor-pointer text-on-surface hover:bg-surface-variant ${
                index === activeSuggestion ? 'bg-surface-variant' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;