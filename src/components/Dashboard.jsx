export default function Dashboard({ setIsLogged }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>RideNRepair</h2>

        <button className="nav-item active">Dashboard</button>
        <button className="nav-item">Bookings</button>
        <button className="nav-item">Users</button>
        <button className="nav-item">Services</button>

        <button
          className="btn-logout"
          onClick={() => setIsLogged(false)}
        >
          Logout
        </button>
      </aside>

      <main className="main">
        <h1>Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">Bookings</div>
          <div className="stat-card">Users</div>
          <div className="stat-card">Services</div>
          <div className="stat-card">Revenue</div>
        </div>
      </main>
    </div>
  );
}