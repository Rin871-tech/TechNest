import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          TechNest
        </Link>

        {/* Navigation */}
        <div className="navbar-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/cart">
            Cart

            {cart.length > 0 && (
              <span className="cart-count">
                {cart.length}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/account">
                {user.name}
              </Link>

              {/* Admin link only for ADMIN users */}
              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="admin-nav-link"
                >
                  Admin
                </Link>
              )}

              <button
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>
            </>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;