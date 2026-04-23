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
    <div className="section animate-in" style={{ paddingTop:'2.5rem' }}>
      {/* Search Pill */}
      <div className="shop-controls-pill stagger-1">
        <div className="search-wrap-pill">
          <input
            className="search-input-pill"
            type="text"
            placeholder="What are you looking for?"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button 
            type="button"
            className={`pill-search-btn ${(catFilter!=='all' || stateFilter!=='all' || sort!=='default' || drawerOpen) ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setDrawerOpen(!drawerOpen); }}
          >
             <span>⚙ Tune</span>
          </button>
        </div>
      </div>

       {/* Filter Drawer (Slide-out Overlay) */}
      <div className={`filter-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}>
        <div className="filter-drawer" onClick={e => e.stopPropagation()}>
          <div className="filter-drawer-header">
            <h2 className="filter-drawer-title">Tune Results</h2>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
          </div>

          <div className="filter-drawer-body">
            {/* Sort */}
            <div className="filter-section">
              <label className="filter-section-label">Sort By</label>
              <div className="filter-grid">
                {[
                  { val:'default',    label:'Default' },
                  { val:'price-asc',  label:'Price: Low→High' },
                  { val:'price-desc', label:'Price: High→Low' },
                  { val:'freshness',  label:'Freshness' },
                  { val:'rating',     label:'Top Rated' },
                ].map(s => (
                  <button key={s.val}
                    className={`filter-pill ${sort === s.val ? 'active' : ''}`}
                    onClick={() => setSort(s.val)}
                  >{s.label}</button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="filter-section">
              <label className="filter-section-label">Categories</label>
              <div className="filter-grid">
                <button
                  className={`filter-pill ${catFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCatFilter('all')}
                >All Products</button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`filter-pill ${catFilter === cat ? 'active' : ''}`}
                    onClick={() => setCatFilter(cat)}
                  >{cat}</button>
                ))}
              </div>
            </div>

            {/* Origin State */}
            {states.length > 0 && (
              <div className="filter-section">
                <label className="filter-section-label">Origin State</label>
                <div className="filter-grid">
                  <button
                    className={`filter-pill ${stateFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStateFilter('all')}
                  >All States</button>
                  {states.map(s => (
                    <button
                      key={s}
                      className={`filter-pill ${stateFilter === s ? 'active' : ''}`}
                      onClick={() => setStateFilter(s)}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sticky Bottom Actions */}
          <div className="filter-drawer-actions">
            <button className="btn btn-primary btn-block btn-lg" onClick={() => setDrawerOpen(false)}>
              Show {displayed.length} Results
            </button>
            <button 
              className="btn btn-glass btn-block" style={{marginTop:'0.75rem'}}
              onClick={() => { clearAllFilters(); setDrawerOpen(false); }}
            >
              Reset All
            </button>
          </div>
        </div>
      </div>

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
        <div className="animate-in stagger-2">
          <div className="product-grid">
            {displayed.map((p, idx) => <ProductCard key={p.id} product={p} className={`stagger-${(idx % 3) + 1}`} />)}
          </div>
          <div style={{ fontSize:'0.8rem',color:'var(--text-muted)',marginTop:'2rem', textAlign:'center', opacity:0.6 }}>
            Showing {displayed.length} premium products
          </div>
        </div>
      )}
    </div>
  );
}
