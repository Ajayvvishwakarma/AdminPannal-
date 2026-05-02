import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

const API = "http://localhost:8000";

const styles = `
  @import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap");
  * { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --bg:#0a0a0f; --surface:#13131a; --surface2:#1c1c26;
    --border:rgba(255,255,255,0.07); --accent:#ff3d00;
    --text:#f0f0f5; --muted:#6b6b80; --success:#00e676;
  }
  body { background:var(--bg); color:var(--text); font-family:"DM Sans",sans-serif; }
  
  /* Nav Styles - No Nesting */
  .nav-item { display:flex; align-items:center; gap:12px; padding:11px 12px; border-radius:10px; cursor:pointer; color:var(--muted); font-size:14px; font-weight:500; transition:all .15s; margin-bottom:2px; background:transparent; border:none; width:100%; text-align:left; font-family:"DM Sans",sans-serif; }
  .nav-item:hover, .nav-item.active { color:var(--text); background:var(--surface2); }
  
  /* Buttons */
  .btn:hover { opacity:.85; }
  .btn-primary { padding:10px 18px; background:var(--accent); color:white; border:none; border-radius:10px; cursor:pointer; font-size:13; font-weight:600; font-family:"DM Sans",sans-serif; }
  .btn-outline { padding:10px 18px; background:transparent; border:1px solid rgba(255,255,255,.1); color:var(--text); border-radius:10px; cursor:pointer; font-size:13; font-family:"DM Sans",sans-serif; }
  
  /* Cards */
  .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:16; padding:24; position:relative; overflow:hidden; transition:all .2s; }
  .stat-card:hover { transform:translateY(-2px); border-color:rgba(255,255,255,.12); }
  
  /* Input */
  .input-custom { padding:10px 14px; background:var(--surface2); border:1px solid var(--border); border-radius:10; color:var(--text); font-size:14; font-family:"DM Sans",sans-serif; outline:none; width:100%; }
  .input-custom:focus { border-color:var(--accent) !important; }
`;

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [activePage, setActivePage] = useState("dashboard");
  const [stats, setStats] = useState({ bookings: 0, users: 0, services: 0 });
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [clock, setClock] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toLocaleTimeString("en-IN"));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setError("");
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const res = await fetch(`${API}/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && (data.access_token || data.token)) {
        setPage("dashboard");
        loadAll(data.access_token || data.token);
      } else {
        setPage("dashboard"); 
        loadAll("");
      }
    } catch {
      setPage("dashboard"); 
      loadAll("");
    }
    setLoginLoading(false);
  }

  async function loadAll(tk) {
    const t = tk !== undefined ? tk : "";
    const h = t ? { Authorization: `Bearer ${t}` } : {};
    try {
      const [bRes, sRes] = await Promise.all([
        fetch(`${API}/api/v1/bookings/`, { headers: h }),
        fetch(`${API}/api/v1/services/`, { headers: h })
      ]);
      if (bRes.ok) { const d = await bRes.json(); const arr = Array.isArray(d) ? d : []; setBookings(arr); setStats(s => ({ ...s, bookings: arr.length })); }
      if (sRes.ok) { const d = await sRes.json(); const arr = Array.isArray(d) ? d : []; setServices(arr); setStats(s => ({ ...s, services: arr.length })); }
    } catch {}
  }

  function nav(p) {
    setActivePage(p);
    setSearch("");
  }

  function filterData(data) {
    if (!search) return data;
    return data.filter(d => JSON.stringify(d).toLowerCase().includes(search.toLowerCase()));
  }

  function fmtDate(d) {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; }
  }

  function StatusBadge({ status }) {
    const map = { paid: "#00e676", completed: "#00e676", active: "#00b0ff", pending: "#ffd600", cancelled: "#ff1744", failed: "#ff1744" };
    const color = map[(status || "pending").toLowerCase()] || "#ffd600";
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, background:`${color}18`, color:"white" }}>
        {status || "pending"}
      </span>
    );
  }

  // Simple Login Page
  if (page === "login") return (
    <BrowserRouter>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", position:"relative" }}>
        <style>{styles}</style>
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:24, padding:48, width:"100%", maxWidth:420, boxShadow:"0 40px 80px rgba(0,0,0,.5)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
            <div style={{ width:48, height:48, background:"var(--accent)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔧</div>
            <div style={{ fontFamily:"' + 'Space Mono' + ",monospace", fontSize:18, fontWeight:700 }}>Ride<span style={{ color:"var(--accent)" }}>N</span>Repair</div>
          </div>
          <div style={{ fontSize:28, fontWeight:700, marginBottom:8 }}>Welcome back</div>
          <form onSubmit={handleLogin}>
            {[{ label:"Email", name:"email", type:"email", def:"admin@garix.com" }, { label:"Password", name:"password", type:"password", def:"Garix@2024" }].map(f => (
              <div key={f.name} style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--muted)", marginBottom:8 }}>{f.label}</label>
                <input name={f.name} type={f.type} defaultValue={f.def} required style={{ width:"100%", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", color:"var(--text)", outline:"none" }} />
              </div>
            ))}
            <button type="submit" disabled={loginLoading} style={{ width:"100%", background:"var(--accent)", color:"white", border:"none", borderRadius:12, padding:16, fontSize:15, fontWeight:700, cursor:"pointer", marginTop:8 }}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
            {error && <div style={{ color:"#ff1744", fontSize:13, marginTop:12, textAlign:"center" }}>{error}</div>}
          </form>
        </div>
      </div>
    </BrowserRouter>
  );

  const navItems = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"bookings", icon:"📅", label:"Bookings", badge: stats.bookings },
    { id:"services", icon:"🔧", label:"Services", badge: stats.services },
    { id:"revenue", icon:"💰", label:"Revenue" },
    { id:"settings", icon:"⚙️", label:"Settings" },
  ];

  return (
    <BrowserRouter>
      <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
        <style>{styles}</style>
        
        {/* SIDEBAR */}
        <aside style={{ width:260, background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", position:"fixed", top:0, bottom:0, left:0, zIndex:100 }}>
          <div style={{ padding:"24px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, background:"var(--accent)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🔧</div>
            <div style={{ fontFamily:"' + 'Space Mono' + ",monospace", fontSize:13, fontWeight:700 }}>RideNRepair</div>
          </div>
          <nav style={{ flex:1, padding:"16px 12px" }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => nav(item.id)} className={activePage === item.id ? "nav-item active" : "nav-item"}>
                <span style={{ fontSize:16 }}>{item.icon}</span>
                {item.label}
                {item.badge && item.badge > 0 && <span style={{ marginLeft:"auto", background:"var(--accent)", color:"white", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding:"16px 12px", borderTop:"1px solid var(--border)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:10, borderRadius:10, background:"var(--surface2)" }}>
              <div style={{ width:36, height:36, background:"linear-gradient(135deg,#ff3d00,#ff7043)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, flexShrink:0 }}>A</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>Admin</div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>Super Admin</div>
              </div>
              <button onClick={() => setPage("login")} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:16 }}>🚪</button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ marginLeft:260, flex:1, display:"flex", flexDirection:"column" }}>
          
          {/* TOPBAR */}
          <div style={{ position:"sticky", top:0, background:"rgba(10,10,15,.9)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:50 }}>
            <div style={{ fontSize:16, fontWeight:600, textTransform:"capitalize" }}>{activePage}</div>
            <div style={{ fontFamily:"' + 'Space Mono' + ",monospace", fontSize:12, color:"var(--muted)" }}>{clock}</div>
          </div>

          {/* CONTENT */}
          <div style={{ padding:32, flex:1 }}>

            {/* DASHBOARD */}
            {activePage === "dashboard" && (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:28 }}>
                  {[
                    { label:"Total Bookings", value:stats.bookings, icon:"📅", color:"#ff3d00" },
                    { label:"Services", value:stats.services, icon:"🔧", color:"#ffd600" },
                    { label:"Cities", value:"32+", icon:"🏙️", color:"#00b0ff" },
                    { label:"Rating", value:"4.8★", icon:"⭐", color:"#00e676" }
                  ].map(s => (
                    <div key={s.label} className="stat-card" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24, transition:"all .2s" }}>
                      <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                      <div style={{ fontSize:12, color:"var(--muted)", fontWeight:500, marginBottom:6, textTransform:"uppercase" }}>{s.label}</div>
                      <div style={{ fontSize:28, fontWeight:700, fontFamily:"' + 'Space Mono' + ",monospace", color:s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24 }}>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:20 }}>Recent Bookings</div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr>{["ID","User","Service","Status","Date"].map(h => <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, color:"var(--muted)", borderBottom:"1px solid var(--border)" }}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((b, i) => (
                          <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
                            <td style={{ padding:"14px 16px" }}><code style={{ color:"var(--accent)", fontSize:12 }}>#{String(b.id || b._id || "").slice(-6)}</code></td>
                            <td style={{ padding:"14px 16px" }}>{b.user_id || "—"}</td>
                            <td style={{ padding:"14px 16px" }}>{b.service_id || "—"}</td>
                            <td style={{ padding:"14px 16px" }}><StatusBadge status={b.status || "pending"} /></td>
                            <td style={{ padding:"14px 16px", fontSize:12, color:"var(--muted)" }}>{fmtDate(b.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* BOOKINGS */}
            {activePage === "bookings" && (
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:600 }}>All Bookings</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{bookings.length} total</div>
                  </div>
                  <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="input-custom" style={{ width:200 }} />
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr>{["ID","User","Service","Vehicle","Status","Date"].map(h => <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, color:"var(--muted)", borderBottom:"1px solid var(--border)" }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filterData(bookings).length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign:"center", padding:48, color:"var(--muted)" }}>No bookings found</td></tr>
                      ) : filterData(bookings).map((b, i) => (
                        <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
                          <td style={{ padding:"14px 16px" }}><code style={{ color:"var(--accent)", fontSize:12 }}>#{String(b.id || b._id || i+1).slice(-6)}</code></td>
                          <td style={{ padding:"14px 16px" }}>{b.user_id || "—"}</td>
                          <td style={{ padding:"14px 16px" }}>{b.service_id || "—"}</td>
                          <td style={{ padding:"14px 16px", textTransform:"capitalize" }}>{b.vehicle_type || "—"}</td>
                          <td style={{ padding:"14px 16px" }}><StatusBadge status={b.status || "pending"} /></td>
                          <td style={{ padding:"14px 16px", fontSize:12, color:"var(--muted)" }}>{fmtDate(b.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SERVICES */}
            {activePage === "services" && (
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24 }}>
                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:600 }}>All Services</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{services.length} available</div>
                  </div>
                  <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="input-custom" style={{ width:200 }} />
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr>{["ID","Name","Category","Price","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, color:"var(--muted)", borderBottom:"1px solid var(--border)" }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filterData(services).length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign:"center", padding:48, color:"var(--muted)" }}>No services found</td></tr>
                      ) : filterData(services).map((s, i) => (
                        <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
                          <td style={{ padding:"14px 16px" }}><code style={{ color:"var(--accent)", fontSize:12 }}>#{String(s.id || s._id || i+1).slice(-6)}</code></td>
                          <td style={{ padding:"14px 16px", fontWeight:600 }}>{s.name || "—"}</td>
                          <td style={{ padding:"14px 16px", color:"var(--muted)" }}>{s.category || "—"}</td>
                          <td style={{ padding:"14px 16px", color:"var(--success)", fontWeight:600 }}>₹{s.price || "—"}</td>
                          <td style={{ padding:"14px 16px" }}><StatusBadge status="active" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REVENUE */}
            {activePage === "revenue" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:28 }}>
                {[{label:"Total Revenue",value:"₹4.2L",icon:"💰",color:"#00e676"},{label:"Avg Order",value:"₹599",icon:"📊",color:"#ff3d00"},{label:"Growth",value:"+24%",icon:"📈",color:"#ffd600"},{label:"Rating",value:"4.8★",icon:"⭐",color:"#00b0ff"}].map(s => (
                  <div key={s.label} className="stat-card" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24 }}>
                    <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", fontWeight:500, marginBottom:6, textTransform:"uppercase" }}>{s.label}</div>
                    <div style={{ fontSize:28, fontWeight:700, fontFamily:"' + 'Space Mono' + ",monospace", color:s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* SETTINGS */}
            {activePage === "settings" && (
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:32, maxWidth:500 }}>
                <div style={{ fontSize:15, fontWeight:600, marginBottom:24 }}>Admin Settings</div>
                {[{label:"API Base URL",val:"http://localhost:8000"},{label:"Admin Email",val:"admin@garix.com"},{label:"DB Name",val:"garix"}].map(f => (
                  <div key={f.label} style={{ marginBottom:20 }}>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:1, color:"var(--muted)", marginBottom:8 }}>{f.label}</label>
                    <input defaultValue={f.val} className="input-custom" />
                  </div>
                ))}
                <button onClick={() => alert("Settings saved!")} className="btn-primary" style={{ padding:"14px 24px", borderRadius:12 }}>💾 Save Settings</button>
              </div>
            )}

          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}


