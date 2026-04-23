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

  // Fetch states and initial products, plus live polling mapping
  useEffect(() => {
    const fetchLive = () => {
      api.getProducts().then(data => {
        setStates(data.states || []);
        setProducts(data.products || []);
      }).catch(e => console.error("Live fetch error", e));
    };
    
    fetchLive();
    // Real-time background sync every 5 seconds!
    const pollId = setInterval(fetchLive, 5000);
    return () => clearInterval(pollId);
  }, []);

  // Server-side search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true);
      if (search.trim().length >= 1) {
        api.searchProducts(search)
          .then(data => {
            // backend search returns list of products
            setProducts(data || []);
          })
          .catch(e => console.error(e))
          .finally(() => setLoading(false));
      } else {
        // If empty, fetch all again
        api.getProducts()
          .then(data => {
            setProducts(data.products || []);
          })
          .catch(e => console.error(e))
          .finally(() => setLoading(false));
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [search]);

  // Derive displayed list for filters/sort
  const displayed = (() => {
    // Safety: Filter out "Ghost" products (nameless/priceless)
    let list = products.filter(p => p.name && p.price > 0);
    
    // category filter
    if (catFilter !== 'all') {
      list = list.filter(p => String(p.categoryId) === catFilter ||
                              p.categoryName === catFilter);
    }
    // state filter
    if (stateFilter !== 'all') list = list.filter(p => p.originState === stateFilter);
    
    // sort
    if (sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
    if (sort === 'freshness')  list.sort((a,b) => (b.freshnessScore||0) - (a.freshnessScore||0));
    if (sort === 'rating')     list.sort((a,b) => (b.avgRating||0) - (a.avgRating||0));
    return list;
  })();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Unique category names for filter chips
  const categories = [...new Set(products.map(p => p.categoryName).filter(Boolean))];

  const clearAllFilters = () => {
    setCatFilter('all');
    setStateFilter('all');
    setSearch('');
  };

  return (
    <div className="section" style={{ paddingTop:'2.5rem' }}>
      {/* Header with Search + Filter Trigger */}
      <div className="shop-controls-pill">
        <div className="search-wrap-pill">
          <input
            className="search-input-pill"
            type="text"
            placeholder="What are you looking for?"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="pill-divider"></div>
          <select
            className="pill-sort-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="default">Default Sort</option>
            <option value="price-asc">Price: Low-High</option>
            <option value="price-desc">Price: High-Low</option>
            <option value="freshness">Freshness First</option>
            <option value="rating">Top Rated</option>
          </select>
          <button 
            className={`pill-search-btn ${(catFilter!=='all' || stateFilter!=='all' || drawerOpen) ? 'active' : ''}`}
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
             <span>Tune</span>
          </button>
        </div>
      </div>
   {/* Filter Drawer */}
        {drawerOpen && (
          <div className="filter-drawer">
            <div className="filter-group">
              <label className="filter-group-label">Categories</label>
              <div className="filter-grid">
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
            </div>

            {states.length > 0 && (
              <div className="filter-group" style={{ marginTop:'1.5rem' }}>
                <label className="filter-group-label">Origin State</label>
                <div className="filter-grid">
                  <button
                    className={`filter-chip ${stateFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStateFilter('all')}
                  >All States</button>
                  {states.map(s => (
                    <button
                      key={s}
                      className={`filter-chip ${stateFilter === s ? 'active' : ''}`}
                      onClick={() => setStateFilter(s)}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ marginTop:'1.5rem', paddingTop:'1rem', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
              <button className="btn btn-glass btn-block btn-sm" onClick={() => setDrawerOpen(false)}>
                Done
              </button>
            </div>
          </div>
        )}

      {/* Active Filters Bar */}
      {(catFilter!=='all' || stateFilter!=='all' || search) && (
        <div className="active-filters-bar">
          <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginRight:'4px' }}>Active:</span>
          {catFilter !== 'all' && (
            <div className="active-filter-tag">
              {catFilter}
              <span className="remove" onClick={() => setCatFilter('all')}>×</span>
            </div>
          )}
          {stateFilter !== 'all' && (
            <div className="active-filter-tag">
              📍 {stateFilter}
              <span className="remove" onClick={() => setStateFilter('all')}>×</span>
            </div>
          )}
          {search && (
            <div className="active-filter-tag">
              Query: {search}
              <span className="remove" onClick={() => setSearch('')}>×</span>
            </div>
          )}
          <button className="clear-all-btn" onClick={clearAllFilters}>Clear All</button>
        </div>
      )}

      {/* Results */}
      {loading && <div className="spinner" />}
      {!loading && displayed.length === 0 && (
        <div style={{ textAlign:'center',padding:'4rem',color:'var(--text-muted)' }}>
          <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>🔍</div>
          <div style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--text-primary)' }}>No matches found</div>
          <p style={{ marginTop:'0.5rem', opacity:0.7 }}>Try adjusting your filters or search terms.</p>
          <button className="btn btn-glass mt-3" onClick={clearAllFilters}>
            Clear All Filters
          </button>
        </div>
      )}
      {!loading && displayed.length > 0 && (
        <>
          <div className="product-grid">
            {displayed.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div style={{ fontSize:'0.8rem',color:'var(--text-muted)',marginTop:'2rem', textAlign:'center', opacity:0.6 }}>
            Showing {displayed.length} premium products
          </div>
        </>
      )}
    </div>
  );
}
