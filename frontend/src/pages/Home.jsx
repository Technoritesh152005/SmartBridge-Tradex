import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Home() {
  const { user } = useSelector((state) => state.auth);

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-copy">
            <p className="eyebrow">TRADEX / MARKET PRACTICE, ELEVATED</p>
            <h1>Build conviction before you put capital to work.</h1>
            <p className="hero-lede">
              A focused paper trading workspace for learning the market, testing your instincts, and
              making every decision measurable.
            </p>
            <div className="hero-actions">
              <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
                {user ? 'Open dashboard' : 'Start with $100k'} <span aria-hidden="true">-&gt;</span>
              </Link>
              <Link to={user ? '/stocks' : '/login'} className="text-link">
                {user ? 'Explore markets' : 'Sign in to TradeX'} <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="hero-proof">
              <span><strong>01</strong> Virtual capital</span>
              <span><strong>02</strong> Real market context</span>
              <span><strong>03</strong> Clear performance</span>
            </div>
          </div>

          <div className="market-window" aria-label="TradeX market preview">
            <div className="window-topline"><span className="live-dot" /> Market pulse <span>NYSE · 16:00 ET</span></div>
            <div className="market-title"><div><span className="ticker-label">PORTFOLIO VALUE</span><strong>$124,680.40</strong></div><span className="gain">+18.42%</span></div>
            <div className="market-chart"><span className="chart-line" /><span className="chart-label chart-label-one">$125k</span><span className="chart-label chart-label-two">$100k</span></div>
            <div className="market-list">
              <div><span className="stock-symbol">NVDA</span><span className="stock-price">$135.58</span><span className="gain">+4.12%</span></div>
              <div><span className="stock-symbol">AAPL</span><span className="stock-price">$227.16</span><span className="gain">+1.86%</span></div>
              <div><span className="stock-symbol">TSLA</span><span className="stock-price">$341.37</span><span className="loss">-0.74%</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section" id="features">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">THE TRADEX EDGE</p><h2>Everything you need to trade with intent.</h2></div>
          <div className="feature-grid">
            <article className="feature-item"><span className="feature-number">01</span><h3>Practice without pressure</h3><p>Start with $100,000 in virtual funds and test real buy and sell decisions without risking your savings.</p></article>
            <article className="feature-item"><span className="feature-number">02</span><h3>See the full picture</h3><p>Follow prices, daily moves, historical charts, and a personal watchlist in one calm workspace.</p></article>
            <article className="feature-item"><span className="feature-number">03</span><h3>Learn from your ledger</h3><p>Track holdings, returns, and transaction history so every strategy leaves useful evidence behind.</p></article>
          </div>
        </div>
      </section>
      <section className="closing-section"><div className="container"><p className="eyebrow">YOUR NEXT MOVE</p><h2>Make it a considered one.</h2><Link to={user ? '/dashboard' : '/register'} className="btn btn-dark">Enter TradeX <span aria-hidden="true">-&gt;</span></Link></div></section>
    </main>
  );
}

export default Home;
