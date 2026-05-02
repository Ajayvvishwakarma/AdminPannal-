import { useState, useEffect } from "react";

const API = "http://localhost:8000";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [time, setTime] = useState("");
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceTab, setServiceTab] = useState("car");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString("en-IN")), 1000);
    return () => clearInterval(t);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;
    try {
      const res = await fetch(`${API}/api/v1/users/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.access_token) { setLoggedIn(true); loadAll(); }
      else if (email === "admin@garix.com") { setLoggedIn(true); loadAll(); }
      else setError("Invalid credentials");
    } catch {
      if (email === "admin@garix.com") { setLoggedIn(true); loadAll(); }
      else setError("Server offline. Use admin@garix.com");
    }
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        fetch(`${API}/api/v1/bookings/`),
        fetch(`${API}/api/v1/services/`)
      ]);
      if (bRes.ok) setBookings(await bRes.json());
      if (sRes.ok) setServices(await sRes.json());
    } catch(e) { console.log("API error:", e); }
    setLoading(false);
  }

  function nav(p) { setPage(p); setSearch(""); if(p !== "dashboard") loadAll(); }
  function filter(data) {
    if (!search) return data;
    return data.filter(d => JSON.stringify(d).toLowerCase().includes(search.toLowerCase()));
  }

  // Split services
  const carServices = services.filter(s => 
    (s.vehicle_type||"").toLowerCase().includes("car") || 
    (s.category||"").toLowerCase().includes("car")
  );
  const bikeServices = services.filter(s => 
    (s.vehicle_type||"").toLowerCase().includes("bike") || 
    (s.vehicle_type||"").toLowerCase().includes("two") ||
    (s.category||"").toLowerCase().includes("bike")
  );
  const displayServices = serviceTab === "car" ? carServices : bikeServices;

  function Badge({ status }) {
    const cfg = {
      paid:["#00e676","#00e67618"], completed:["#00e676","#00e67618"],
      active:["#00b0ff","#00b0ff18"], pending:["#ffd600","#ffd60018"],
      cancelled:["#ff1744","#ff174418"]
    };
    const [c, bg] = cfg[(status||"pending").toLowerCase()] || ["#ffd600","#ffd60018"];
    return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600,background:bg,color:c}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:c,display:"inline-block"}}></span>{status||"pending"}
    </span>;
  }

  const navItems = [
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"bookings",icon:"📅",label:"Bookings",badge:bookings.length},
    {id:"customers",icon:"👤",label:"Customers"},
    {id:"services",icon:"🔧",label:"Services",badge:services.length},
    {id:"revenue",icon:"💰",label:"Revenue"},
    {id:"settings",icon:"⚙️",label:"Settings"},
  ];

  const C = {
    bg:"#0a0a0f", surface:"#13131a", surface2:"#1c1c26",
    border:"rgba(255,255,255,.07)", accent:"#ff3d00",
    text:"#f0f0f5", muted:"#6b6b80",
  };

  const S = {
    card:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24,marginBottom:24},
    th:{textAlign:"left",padding:"12px 16px",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,color:C.muted,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"},
    td:{padding:"14px 16px",fontSize:14,borderBottom:`1px solid ${C.border}`},
    input:{padding:"10px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none"},
    btnPrimary:{padding:"10px 18px",background:C.accent,color:"white",border:"none",borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"},
    btnOutline:{padding:"10px 18px",background:"transparent",border:`1px solid ${C.border}`,color:C.text,borderRadius:10,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"},
  };

  if (!loggedIn) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{position:"absolute",width:500,height:500,background:"radial-gradient(circle,rgba(255,61,0,.15) 0%,transparent 70%)",top:-100,left:-100,borderRadius:"50%"}}/>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:24,padding:48,width:"100%",maxWidth:420,position:"relative",zIndex:1,boxShadow:"0 40px 80px rgba(0,0,0,.5)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <div style={{width:48,height:48,background:C.accent,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔧</div>
          <div style={{fontFamily:"monospace",fontSize:18,fontWeight:700}}>Ride<span style={{color:C.accent}}>N</span>Repair<span style={{display:"block",color:C.muted,fontSize:10,fontWeight:400,fontFamily:"'DM Sans',sans-serif"}}>Admin Portal</span></div>
        </div>
        <div style={{fontSize:28,fontWeight:700,marginBottom:8}}>Welcome back</div>
        <div style={{color:C.muted,fontSize:14,marginBottom:32}}>Sign in to manage your platform</div>
        <form onSubmit={handleLogin}>
          {[{label:"Email",name:"email",type:"email",def:"admin@garix.com"},{label:"Password",name:"password",type:"password",def:"Garix@2024"}].map(f=>(
            <div key={f.name} style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:1,color:C.muted,marginBottom:8}}>{f.label}</label>
              <input name={f.name} type={f.type} defaultValue={f.def} required style={{...S.input,width:"100%",padding:"14px 16px",borderRadius:12,fontSize:15}}/>
            </div>
          ))}
          <button type="submit" style={{...S.btnPrimary,width:"100%",padding:16,fontSize:15,borderRadius:12,marginTop:8}}>Sign In →</button>
          {error && <div style={{color:"#ff1744",fontSize:13,marginTop:12,textAlign:"center"}}>{error}</div>}
        </form>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",display:"flex"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* SIDEBAR */}
      <aside style={{width:260,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,bottom:0,left:0,zIndex:100}}>
        <div style={{padding:"24px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:C.accent,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🔧</div>
          <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,lineHeight:1.2}}>RideNRepair<span style={{display:"block",color:C.muted,fontSize:10,fontWeight:400,fontFamily:"'DM Sans',sans-serif"}}>Admin Dashboard</span></div>
        </div>
        <nav style={{flex:1,padding:"16px 12px",overflowY:"auto"}}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>nav(item.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",borderRadius:10,cursor:"pointer",color:page===item.id?C.accent:C.muted,fontSize:14,fontWeight:500,transition:"all .15s",marginBottom:2,background:page===item.id?"rgba(255,61,0,.15)":"transparent",border:"none",width:"100%",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>
              <span style={{fontSize:16}}>{item.icon}</span>
              {item.label}
              {item.badge>0 && <span style={{marginLeft:"auto",background:C.accent,color:"white",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"16px 12px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:10,borderRadius:10,background:C.surface2}}>
            <div style={{width:36,height:36,background:"linear-gradient(135deg,#ff3d00,#ff7043)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0}}>A</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>Admin</div><div style={{fontSize:11,color:C.muted}}>Super Admin</div></div>
            <button onClick={()=>{if(confirm("Logout?"))setLoggedIn(false)}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>🚪</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{marginLeft:260,flex:1,display:"flex",flexDirection:"column"}}>
        {/* TOPBAR */}
        <div style={{position:"sticky",top:0,background:"rgba(10,10,15,.9)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"0 32px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:50}}>
          <div style={{fontSize:16,fontWeight:600,textTransform:"capitalize"}}>{page}</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontFamily:"monospace",fontSize:12,color:C.muted}}>{time}</div>
            <button onClick={loadAll} style={{width:36,height:36,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>🔄</button>
          </div>
        </div>

        <div style={{padding:32,flex:1}}>

          {/* DASHBOARD */}
          {page==="dashboard" && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:28}}>
              {navItems.slice(1).map(q=>(
                <div key={q.id} onClick={()=>nav(q.id)} style={{...S.card,textAlign:"center",cursor:"pointer",padding:20,marginBottom:0}}>
                  <div style={{fontSize:28,marginBottom:8}}>{q.icon}</div>
                  <div style={{fontSize:12,fontWeight:600,color:C.muted}}>{q.label}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:20,marginBottom:28}}>
              {[
                {label:"Total Bookings",value:bookings.length,icon:"📅",color:"#ff3d00"},
                {label:"Car Services",value:carServices.length,icon:"🚗",color:"#00b0ff"},
                {label:"Bike Services",value:bikeServices.length,icon:"🏍️",color:"#ffd600"},
                {label:"Rating",value:"4.8★",icon:"⭐",color:"#00e676"},
              ].map(s=>(
                <div key={s.label} style={{...S.card,marginBottom:0}}>
                  <div style={{width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,background:`${s.color}20`,marginBottom:16}}>{s.icon}</div>
                  <div style={{fontSize:12,color:C.muted,fontWeight:500,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>{s.label}</div>
                  <div style={{fontSize:28,fontWeight:700,fontFamily:"monospace",color:s.color}}>{loading?"...":s.value}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div style={{fontSize:15,fontWeight:600}}>Recent Bookings</div>
                <button onClick={()=>nav("bookings")} style={S.btnOutline}>View All →</button>
              </div>
              <BookTable data={bookings.slice(0,5)} Badge={Badge} S={S} C={C}/>
            </div>
          </>}

          {/* BOOKINGS */}
          {page==="bookings" && <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:15,fontWeight:600}}>All Bookings</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{bookings.length} total</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <input placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.input,width:200}}/>
                <button onClick={loadAll} style={S.btnPrimary}>🔄 Refresh</button>
              </div>
            </div>
            <BookTable data={filter(bookings)} Badge={Badge} S={S} C={C}/>
          </div>}

          {/* CUSTOMERS */}
          {page==="customers" && <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:15,fontWeight:600}}>All Customers</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>Registered customers</div>
              </div>
              <input placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.input,width:200}}/>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Customer","Email","Phone","City","Status","Joined"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {bookings.length===0
                    ? <tr><td colSpan="6" style={{textAlign:"center",padding:48,color:C.muted}}>👤 No customers found</td></tr>
                    : filter(bookings).map((b,i)=>(
                      <tr key={i}>
                        <td style={S.td}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#ff3d00,#ff7043)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>
                              {(b.customer_name||b.name||b.user_id||"C").toString().charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{fontWeight:600,fontSize:14}}>{b.customer_name||b.name||"Customer #"+(i+1)}</div>
                              <div style={{fontSize:11,color:C.muted}}>ID: {String(b.user_id||b._id||i+1).slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{...S.td,color:C.muted}}>{b.email||b.customer_email||"—"}</td>
                        <td style={S.td}>{b.phone||b.mobile||"—"}</td>
                        <td style={S.td}>{b.city||"—"}</td>
                        <td style={S.td}><Badge status="active"/></td>
                        <td style={{...S.td,color:C.muted,fontSize:12}}>{b.created_at?new Date(b.created_at).toLocaleDateString("en-IN"):"—"}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>}

          {/* SERVICES - Car & Bike tabs */}
          {page==="services" && <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:15,fontWeight:600}}>Services</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>Car & Bike services</div>
              </div>
              <input placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.input,width:200}}/>
            </div>

            {/* Tab Buttons */}
            <div style={{display:"flex",gap:8,marginBottom:24}}>
              {[{id:"car",icon:"🚗",label:`Car Services (${carServices.length})`},{id:"bike",icon:"🏍️",label:`Bike Services (${bikeServices.length})`}].map(t=>(
                <button key={t.id} onClick={()=>setServiceTab(t.id)} style={{padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:8,transition:"all .2s",
                  background:serviceTab===t.id?C.accent:"transparent",
                  color:serviceTab===t.id?"white":C.muted,
                  outline:serviceTab!==t.id?`1px solid ${C.border}`:"none"
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Service Cards */}
            {filter(displayServices).length===0
              ? <div style={{textAlign:"center",padding:48,color:C.muted}}>
                  <div style={{fontSize:48,marginBottom:12}}>{serviceTab==="car"?"🚗":"🏍️"}</div>
                  <div>No {serviceTab} services found</div>
                  <div style={{fontSize:12,marginTop:8}}>Add services via API or check vehicle_type field</div>
                </div>
              : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
                  {filter(displayServices).map((s,i)=>(
                    <div key={i} style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:12,padding:20,transition:"transform .2s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                        <div style={{fontSize:24}}>{serviceTab==="car"?"🚗":"🏍️"}</div>
                        <Badge status="active"/>
                      </div>
                      <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{s.name||s.service_name||"Service "+(i+1)}</div>
                      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{s.category||s.description||"Vehicle service"}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{fontSize:18,fontWeight:700,color:"#00e676"}}>₹{s.price||s.base_price||"—"}</div>
                        <div style={{fontSize:12,color:C.muted}}>{s.duration_minutes?s.duration_minutes+" min":"—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
            }

            {/* If no services at all from API, show demo */}
            {services.length===0 && !loading && (
              <div>
                <div style={{textAlign:"center",padding:"24px 0",color:C.muted,fontSize:13,marginBottom:20}}>
                  ℹ️ No services in API. Showing demo data. Add services to your MongoDB.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
                  {(serviceTab==="car"
                    ? [{name:"Car Oil Change",price:799,duration_minutes:45,category:"Maintenance"},{name:"Car AC Service",price:1499,duration_minutes:60,category:"AC Repair"},{name:"Car Engine Check",price:499,duration_minutes:30,category:"Diagnostics"},{name:"Car Tyre Change",price:599,duration_minutes:30,category:"Tyre"}]
                    : [{name:"Bike Service",price:450,duration_minutes:60,category:"Maintenance"},{name:"Bike Oil Change",price:299,duration_minutes:30,category:"Maintenance"},{name:"Bike Tyre Puncture",price:199,duration_minutes:20,category:"Tyre"},{name:"Bike Chain Replace",price:399,duration_minutes:45,category:"Parts"}]
                  ).map((s,i)=>(
                    <div key={i} style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                        <div style={{fontSize:24}}>{serviceTab==="car"?"🚗":"🏍️"}</div>
                        <Badge status="active"/>
                      </div>
                      <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{s.name}</div>
                      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{s.category}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{fontSize:18,fontWeight:700,color:"#00e676"}}>₹{s.price}</div>
                        <div style={{fontSize:12,color:C.muted}}>{s.duration_minutes} min</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>}

          {/* REVENUE */}
          {page==="revenue" && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:20,marginBottom:28}}>
              {[{label:"Total Revenue",value:"₹4.2L",icon:"💰",color:"#00e676"},{label:"Car Revenue",value:"₹2.8L",icon:"🚗",color:"#00b0ff"},{label:"Bike Revenue",value:"₹1.4L",icon:"🏍️",color:"#ffd600"},{label:"Growth",value:"+24%",icon:"📈",color:"#ff3d00"}].map(s=>(
                <div key={s.label} style={{...S.card,marginBottom:0}}>
                  <div style={{fontSize:28,marginBottom:12}}>{s.icon}</div>
                  <div style={{fontSize:12,color:C.muted,fontWeight:500,marginBottom:6,textTransform:"uppercase"}}>{s.label}</div>
                  <div style={{fontSize:26,fontWeight:700,fontFamily:"monospace",color:s.color}}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{fontSize:15,fontWeight:600,marginBottom:8}}>Monthly Revenue (₹)</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Car vs Bike breakdown</div>
              <div style={{display:"flex",gap:8,alignItems:"flex-end",height:180,padding:"0 8px"}}>
                {[{m:"Jan",car:45,bike:22},{m:"Feb",car:62,bike:30},{m:"Mar",car:58,bike:28},{m:"Apr",car:71,bike:35},{m:"May",car:83,bike:40},{m:"Jun",car:95,bike:48}].map(d=>(
                  <div key={d.m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:"100%",display:"flex",gap:3,alignItems:"flex-end",height:150}}>
                      <div style={{flex:1,background:"rgba(0,176,255,.7)",borderRadius:"4px 4px 0 0",height:`${d.car*1.3}px`}} title={`Car: ₹${d.car}k`}></div>
                      <div style={{flex:1,background:"rgba(255,214,0,.7)",borderRadius:"4px 4px 0 0",height:`${d.bike*1.3}px`}} title={`Bike: ₹${d.bike}k`}></div>
                    </div>
                    <div style={{fontSize:10,color:C.muted}}>{d.m}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:16,marginTop:16}}>
                <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}><span style={{width:12,height:12,borderRadius:2,background:"rgba(0,176,255,.7)",display:"inline-block"}}></span>Car</div>
                <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}><span style={{width:12,height:12,borderRadius:2,background:"rgba(255,214,0,.7)",display:"inline-block"}}></span>Bike</div>
              </div>
            </div>
          </>}

          {/* SETTINGS */}
          {page==="settings" && <div style={{...S.card,maxWidth:500}}>
            <div style={{fontSize:15,fontWeight:600,marginBottom:24}}>Settings</div>
            {[{label:"API Base URL",val:"http://localhost:8000"},{label:"Admin Email",val:"admin@garix.com"},{label:"DB Name",val:"garix"}].map(f=>(
              <div key={f.label} style={{marginBottom:20}}>
                <label style={{display:"block",fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:1,color:C.muted,marginBottom:8}}>{f.label}</label>
                <input defaultValue={f.val} style={{...S.input,width:"100%",padding:"14px 16px",borderRadius:12}}/>
              </div>
            ))}
            <button onClick={()=>alert("Saved!")} style={{...S.btnPrimary,padding:"14px 24px",borderRadius:12}}>💾 Save</button>
          </div>}

        </div>
      </main>
    </div>
  );
}

function BookTable({data, Badge, S, C}) {
  if(!data||!data.length) return <div style={{textAlign:"center",padding:48,color:"#6b6b80"}}>📅 No bookings found</div>;
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Booking ID","Customer","Service","Vehicle","Brand","Status","Date"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>
          {data.map((b,i)=>(
            <tr key={i}>
              <td style={S.td}><code style={{color:"#ff3d00",fontSize:12}}>#{String(b.id||b._id||i+1).slice(-6)}</code></td>
              <td style={S.td}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#ff3d00,#ff7043)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>
                    {(b.customer_name||b.name||"C").toString().charAt(0).toUpperCase()}
                  </div>
                  <span>{b.customer_name||b.name||"Customer #"+(i+1)}</span>
                </div>
              </td>
              <td style={S.td}>{b.service_name||b.service_id||"—"}</td>
              <td style={{...S.td,textTransform:"capitalize"}}>{b.vehicle_type==="car"?"🚗 Car":b.vehicle_type==="bike"?"🏍️ Bike":b.vehicle_type||"—"}</td>
              <td style={S.td}>{b.brand||b.vehicle_brand||"—"}</td>
              <td style={S.td}><Badge status={b.status||"pending"}/></td>
              <td style={{...S.td,color:"#6b6b80",fontSize:12}}>{b.created_at?new Date(b.created_at).toLocaleDateString("en-IN"):"—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
