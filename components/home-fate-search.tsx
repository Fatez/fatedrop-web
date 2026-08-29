export function HomeFateSearch() {
  return <section className="home-fate-search section-shell" aria-labelledby="home-fate-search-title">
    <div className="home-fate-search-copy">
      <p>FATEFIND · NETWORK SEARCH</p>
      <h2 id="home-fate-search-title">Find what you&apos;re chasing.</h2>
      <span>Search FateDrop&apos;s observed retailer network for cards, sets and products, then inspect the evidence before you buy.</span>
    </div>

    <form action="/dashboard/search" method="get" className="home-fate-search-form">
      <label>
        <span aria-hidden="true">⌕</span>
        <input name="q" aria-label="Search cards, sets or retailers" placeholder="Search cards, sets or retailers…" required />
      </label>
      <button type="submit">SEARCH FATE <b>→</b></button>
    </form>

    <div className="home-fate-search-proof" aria-label="FateDrop search benefits">
      <span><i>70+</i> MAJOR + INDIE RETAILERS</span>
      <b aria-hidden="true" />
      <span><i>LIVE</i> STOCK SIGNALS</span>
      <b aria-hidden="true" />
      <span><i>↗</i> DIRECT RETAILER LINKS</span>
    </div>

    <style>{`
      .home-fate-search{position:relative;isolation:isolate;overflow:hidden;width:min(1560px,calc(100% - 32px));margin:18px auto 0;padding:clamp(30px,4vw,54px);border:1px solid #493c46;border-radius:24px;background:radial-gradient(circle at 76% 18%,rgba(126,87,143,.13),transparent 28%),radial-gradient(circle at 18% 88%,rgba(115,91,74,.12),transparent 31%),linear-gradient(135deg,#161219 0%,#181418 52%,#17130f 100%);box-shadow:0 24px 70px rgba(0,0,0,.28)}
      .home-fate-search:after{content:'';position:absolute;z-index:-1;right:-120px;top:-155px;width:390px;height:390px;border:1px solid rgba(182,151,125,.09);border-radius:48% 52% 39% 61%;transform:rotate(28deg)}
      .home-fate-search-copy{text-align:center}.home-fate-search-copy>p{margin:0 0 10px;color:#9f7f8f;font-size:8px;font-weight:900;letter-spacing:.18em}.home-fate-search-copy h2{margin:0;color:#eadfd7;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.8rem,5vw,5.6rem);font-weight:500;line-height:.94;letter-spacing:-.052em}.home-fate-search-copy>span{display:block;max-width:790px;margin:16px auto 0;color:#9c908d;font-size:12px;line-height:1.65}
      .home-fate-search-form{max-width:1140px;margin:32px auto 0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:8px;border:1px solid #5b4854;border-radius:14px;background:#100d11;box-shadow:inset 0 1px rgba(255,255,255,.025),0 10px 32px rgba(0,0,0,.2)}
      .home-fate-search-form label{min-width:0;height:56px;display:grid;grid-template-columns:42px minmax(0,1fr);align-items:center;border:1px solid #30272d;border-radius:10px;background:#151116}.home-fate-search-form label>span{display:grid;place-items:center;color:#8d7481;font-size:20px}.home-fate-search-form input{width:100%;height:100%;padding:0 15px 0 0;border:0;outline:0;background:transparent;color:#eadfd7;font-size:14px}.home-fate-search-form input::placeholder{color:#756a6d}.home-fate-search-form input:focus-visible{outline:0}.home-fate-search-form label:focus-within{border-color:#806778;box-shadow:0 0 0 1px #806778}
      .home-fate-search-form button{min-width:190px;height:56px;padding:0 22px;border:1px solid #8d7363;border-radius:10px;background:linear-gradient(135deg,#72586b 0%,#735b4a 100%);color:#f0e5dd;font-size:9px;font-weight:900;letter-spacing:.12em;box-shadow:inset 0 1px rgba(255,255,255,.07),0 8px 24px rgba(0,0,0,.2)}.home-fate-search-form button b{margin-left:8px;color:#d7c1af;font-size:13px}.home-fate-search-form button:hover{border-color:#a28773;background:linear-gradient(135deg,#7a5f72 0%,#7a604e 100%)}
      .home-fate-search-proof{margin:24px auto 0;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px 22px;color:#877a79;font-size:7px;font-weight:900;letter-spacing:.1em}.home-fate-search-proof span{display:flex;align-items:center;gap:8px}.home-fate-search-proof span i{display:grid;place-items:center;min-width:28px;height:28px;padding:0 6px;border:1px solid #5c4b50;border-radius:50%;color:#b6977d;background:#171216;font-size:7px;font-style:normal}.home-fate-search-proof>b{width:1px;height:26px;background:#3c3235}
      @media(max-width:720px){.home-fate-search{width:calc(100% - 18px);padding:28px 18px;border-radius:18px}.home-fate-search-copy h2{font-size:clamp(2.6rem,12vw,4rem)}.home-fate-search-form{grid-template-columns:1fr;margin-top:25px}.home-fate-search-form button{width:100%}.home-fate-search-proof{display:grid;grid-template-columns:1fr;justify-items:start;max-width:320px}.home-fate-search-proof>b{display:none}}
    `}</style>
  </section>;
}
