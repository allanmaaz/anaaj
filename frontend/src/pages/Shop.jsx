import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products,  setProducts]  = useState([]);
  const [states,    setStates]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState(searchParams.get('category') || 'all');
  const [stateFilter,setStateFilter] = useState('all');
  const [sort,      setSort]      = useState('default');

  // Load all products once
  useEffect(() => {
    api.getProducts()
      .then(data => {
        setProducts(data.products || []);
        setStates(data.states || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive displayed list
  const displayed = (() => {
    let list = [...products];
    // category filter
    if (catFilter !== 'all') {
      list = list.filter(p => String(p.categoryId) === catFilter ||
                              p.categoryName === catFilter);
    }
    // state filter
    if (stateFilter !== 'all') list = list.filter(p => p.originState === stateFilter);
    // search
    if (search.trim().length >= 2) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) ||
                              (p.description && p.description.toLowerCase().includes(q)));
    }
    // sort
    if (sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
    if (sort === 'freshness')  list.sort((a,b) => (b.freshnessScore||0) - (a.freshnessScore||0));
    if (sort === 'rating')     list.sort((a,b) => (b.avgRating||0) - (a.avgRating||0));
    return list;
  })();

  // Unique category names for filter chips
  const categories = [...new Set(products.map(p => p.categoryName).filter(Boolean))];

  return (
    <div className="section" style={{ paddingTop:'2rem' }}>
      {/* Search + Sort */}
      <div style={{ display:'flex',gap:'1rem',flexWrap:'wrap',alignItems:'center',marginBottom:'1.5rem' }}>
        <div className="search-wrap" style={{ flex:1,minWidth:'200px' }}>
          <span className="search-icon">🔍</span>
          <input
            className="search-bar"
            id="main-search"
            type="text"
            placeholder="Search rice, dal, millet…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="search-shortcut">⌘K</span>
        </div>
        <select
          className="status-select"
          style={{ padding:'0.65rem 1rem' }}
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="freshness">Freshness</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Category Chips */}
      <div className="filter-row">
        <button
          className={`filter-chip ${catFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCatFilter('all')}
        >All Products</button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${catFilter === cat ? 'active' : ''}`}
            onClick={() => setCatFilter(cat)}
          >{cat}</button>
        ))}
      </div>

      {/* State Chips */}
      {states.length > 0 && (
        <div className="filter-row">
          <button
            className={`filter-chip ${stateFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStateFilter('all')}
          >📍 All States</button>
          {states.map(s => (
            <button
              key={s}
              className={`filter-chip ${stateFilter === s ? 'active' : ''}`}
              onClick={() => setStateFilter(s)}
            >📍 {s}</button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading && <div className="spinner" />}
      {!loading && displayed.length === 0 && (
        <div style={{ textAlign:'center',padding:'4rem',color:'var(--text-muted)' }}>
          <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>🔍</div>
          <div>No products found matching your search.</div>
          <button className="btn btn-glass mt-2" onClick={() => { setSearch(''); setCatFilter('all'); setStateFilter('all'); }}>
            Clear Filters
          </button>
        </div>
      )}
      {!loading && displayed.length > 0 && (
        <>
          <div className="product-grid">
            {displayed.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div style={{ fontSize:'0.8rem',color:'var(--text-muted)',marginTop:'1rem' }}>
            Showing {displayed.length} product{displayed.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}
