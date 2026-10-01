import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const {
    login,
    loginWithToken
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get("token");
    const oauthError = searchParams.get("error");

    if (token) {
      setLoading(true);

      loginWithToken(token)
        .then(() => {
          navigate("/");
        })
        .catch((error) => {
          setError(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    if (oauthError) {
      setError(
        "Google login failed. Please try again."
      );
    }
  }, [
    searchParams,
    loginWithToken,
    navigate
  ]);

  // Normal email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);

      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <div className="auth-container">

        <div className="auth-header">

          <p className="eyebrow">
            WELCOME BACK
          </p>

          <h1>
            Log in to TechNest
          </h1>

          <p>
            Access your account and manage
            your TechNest orders.
          </p>

        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* Google Login */}

        <a
         href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
          className="google-button"
        >
          <span className="google-icon">
            G
          </span>

          Continue with Google
        </a>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Email / Password Login */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <label>
            Email

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </label>

          <button
            type="submit"
            className="primary-button auth-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log in →"}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{" "}

          <Link to="/register">
            Create one
          </Link>
        </p>

      </div>

    </main>
  );
}

export default Login;