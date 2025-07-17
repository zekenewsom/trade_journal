import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
const AutocompleteInput = ({ id, name, value, onChange, field, placeholder, required = false, className = "", type = "text" }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [allOptions, setAllOptions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    // Fetch autocomplete data on mount
    useEffect(() => {
        const fetchAutocompleteData = async () => {
            try {
                const result = await window.electronAPI.getAutocompleteData(field);
                if (result.success) {
                    setAllOptions(result.data);
                }
            }
            catch (error) {
                console.error('Error fetching autocomplete data:', error);
            }
        };
        fetchAutocompleteData();
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
    return (_jsxs("div", { className: "relative", children: [_jsx("input", { ref: inputRef, type: type, id: id, name: name, value: value, onChange: handleInputChange, onKeyDown: handleKeyDown, onFocus: handleInputFocus, onBlur: handleInputBlur, placeholder: placeholder, required: required, className: className, autoComplete: "off" }), showSuggestions && suggestions.length > 0 && (_jsx("div", { ref: suggestionsRef, className: "absolute z-50 w-full bg-surface border border-card-stroke rounded mt-1 max-h-40 overflow-y-auto shadow-lg", children: suggestions.map((suggestion, index) => (_jsx("div", { className: `p-2 cursor-pointer text-on-surface hover:bg-surface-variant ${index === activeSuggestion ? 'bg-surface-variant' : ''}`, onClick: () => handleSuggestionClick(suggestion), children: suggestion }, suggestion))) }))] }));
};
export default AutocompleteInput;
