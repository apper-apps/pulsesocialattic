import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserService } from "@/services/api/userService";
import ApperIcon from "@/components/ApperIcon";
import UserCard from "@/components/molecules/UserCard";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const UserSearchBar = ({ className }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await UserService.search(query);
        setResults(searchResults.slice(0, 8)); // Limit to 8 results
        setIsOpen(searchResults.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleUserSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const handleUserSelect = (user) => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    toast.success(`Navigating to ${user.displayName}'s profile`);
    navigate(`/profile/${user.username}`);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <Input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          variant="search"
          className="pr-10"
          aria-label="Search for users"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <ApperIcon 
              name="Loader2" 
              className="w-4 h-4 text-gray-400 animate-spin" 
            />
          ) : (
            <ApperIcon 
              name="Search" 
              className="w-4 h-4 text-gray-400" 
            />
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Search results"
        >
          {results.map((user, index) => (
            <div
              key={user.id}
              className={cn(
                "p-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                selectedIndex === index
                  ? "bg-primary/5 border-primary/20"
                  : "hover:bg-gray-50"
              )}
              onClick={() => handleUserSelect(user)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <UserCard
                user={user}
                className="hover:scale-100" // Disable hover scale in dropdown
              />
            </div>
          ))}
          
          {query.trim() && results.length === 0 && !isLoading && (
            <div className="p-4 text-center text-gray-500">
              <ApperIcon name="Search" className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No users found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchBar;