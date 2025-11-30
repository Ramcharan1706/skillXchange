import React, { useState, useCallback } from 'react'
import { debounceSearch } from '../utils/search'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  initialValue = '',
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue)

  const debouncedSearch = useCallback(debounceSearch(onSearch, 300), [onSearch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    debouncedSearch(value)
  }

  const handleClear = () => {
    setSearchQuery('')
    onSearch('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleChange}
          className="form-input px-4 py-2 rounded-lg text-sm w-full text-white bg-neutral-800 pr-10"
          aria-label="Search"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  )
}

export default SearchBar
