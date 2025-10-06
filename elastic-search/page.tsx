'use client';

import { useState, useEffect } from 'react';

interface Product {
  _id: string;
  _source: {
    name: string;
    description: string;
    price: string;
    category: string;
    storeId: string;
    createdAt: string;
  };
  _score: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search/products?q=${encodeURIComponent(searchQuery)}&storeId=sample-store`);
      const data = await response.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Live search with 3-second debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 1000);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear results immediately if input is empty
    if (!value.trim()) {
      setResults([]);
      setTotal(0);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search products... (auto-search after 3 seconds)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Results Count */}
        {total > 0 && (
          <p className="text-gray-600 mb-6">
            Found {total} products for "{query}"
          </p>
        )}

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {product._source.name}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Score: {product._score.toFixed(1)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {product._source.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">
                  ${product._source.price}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(product._source.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* No Results */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found for "{query}"</p>
            <p className="text-gray-400 text-sm mt-2">Try different keywords or check spelling</p>
          </div>
        )}

        {/* Sample Searches */}
        {!query && (
          <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Try these searches:</h2>
            <div className="flex flex-wrap gap-2">
              {['laptop', 'headphones', 'gaming', 'wireless', 'coffee', 'smartphone'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    performSearch(term);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}