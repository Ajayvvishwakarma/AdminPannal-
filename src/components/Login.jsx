import { useState } from "react";

export default function Login({ setIsLogged }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setIsLogged(true);
    }, 1000);
  };

  return (
    <div className="login-section">
      <div className="login-box">
        <h2>Admin Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="admin@ridenrepair.com"
            className="form-input"
          />
          <input
            type="password"
            placeholder="password"
            className="form-input"
          />

          <button className="btn-login">
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}