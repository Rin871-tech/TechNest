import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { totalItems } = useCart();

  const {
    user,
    logout,
    isAuthenticated
  } = useAuth();

  return (
    <nav className="navbar">

      <Link
        to="/"
        className="logo"
      >
        Tech<span>Nest</span>
      </Link>

      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/products">
          Products
        </Link>

        <Link to="/cart">
          Cart

          {totalItems > 0 && (
            <span className="cart-count">
              {totalItems}
            </span>
          )}
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/account">
              Hi, {user?.name?.split(" ")[0]}
            </Link>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            Login
          </Link>
        )}

      </div>

    </nav>
  );
}

export default Navbar;