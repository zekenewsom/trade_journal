import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
const AutocompleteInput = ({ id, name, value, onChange, field, placeholder, required = false, className = "", type = "text" }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [allOptions, setAllOptions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    // Fetch autocomplete data on mount
    useEffect(() => {
        let isMounted = true;
        const fetchAutocompleteData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await window.electronAPI.getAutocompleteData(field);
                if (isMounted) {
                    if (result.success) {
                        setAllOptions(result.data);
                    } else {
                        setError('Failed to fetch autocomplete data.');
                    }
                }
            }
            catch (error) {
                if (isMounted) {
                    setError('Error fetching autocomplete data.');
                }
                console.error('Error fetching autocomplete data:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchAutocompleteData();
        return () => {
            isMounted = false;
        };
    }, [field]);
    // Filter suggestions based on input value
    useEffect(() => {
        if (value && allOptions.length > 0) {
            const filtered = allOptions.filter(option => option.toLowerCase().includes(value.toLowerCase()));
            setSuggestions(filtered);
        }
        else {
            setSuggestions([]);
        }
    }, [value, allOptions]);
    const handleInputChange = (e) => {
        onChange(e);
        setShowSuggestions(true);
        setActiveSuggestion(-1);
    };
    const handleSuggestionClick = (suggestion) => {
        const syntheticEvent = {
            target: { name, value: suggestion }
        };
        onChange(syntheticEvent);
        setShowSuggestions(false);
        setActiveSuggestion(-1);
    };
    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0)
            return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveSuggestion(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
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
    const handleInputBlur = (e) => {
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
            />
            {loading && (
                <div className="absolute left-0 top-full mt-1 w-full bg-surface border border-card-stroke rounded p-2 text-center text-xs text-secondary">Loading...</div>
            )}
            {error && (
                <div className="absolute left-0 top-full mt-1 w-full bg-error text-on-error border border-error rounded p-2 text-center text-xs">{error}</div>
            )}
            {showSuggestions && suggestions.length > 0 && !loading && !error && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full bg-surface border border-card-stroke rounded mt-1 max-h-40 overflow-y-auto shadow-lg"
                >
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion}
                            className={`p-2 cursor-pointer text-on-surface hover:bg-surface-variant ${index === activeSuggestion ? 'bg-surface-variant' : ''}`}
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
