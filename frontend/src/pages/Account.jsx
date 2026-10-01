import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Account() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <main className="account-page">
      <section className="account-container">
        <div className="account-header">
          <p className="eyebrow">TECHNEST ACCOUNT</p>

          <h1>Welcome, {user?.name?.split(" ")[0] || "there"}.</h1>

          <p>
            Manage your account, orders and shopping activity.
          </p>
        </div>

        <div className="account-grid">

          {/* Profile */}
          <div className="account-card profile-card">
            <div className="account-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <p className="card-label">ACCOUNT</p>
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
            </div>
          </div>

          {/* Orders */}
          <Link to="/orders" className="account-card account-link-card">
            <div className="account-card-icon">📦</div>

            <div>
              <p className="card-label">ORDERS</p>
              <h2>My Orders</h2>
              <p>View your order history and order status.</p>
            </div>

            <span className="account-arrow">→</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="account-card account-link-card">
            <div className="account-card-icon">🛒</div>

            <div>
              <p className="card-label">SHOPPING</p>
              <h2>Shopping Cart</h2>
              <p>
                {totalItems === 0
                  ? "Your cart is currently empty."
                  : `${totalItems} ${
                      totalItems === 1 ? "item" : "items"
                    } in your cart.`}
              </p>
            </div>

            <span className="account-arrow">→</span>
          </Link>

          {/* Continue Shopping */}
          <Link
            to="/products"
            className="account-card account-link-card"
          >
            <div className="account-card-icon">⌕</div>

            <div>
              <p className="card-label">EXPLORE</p>
              <h2>Browse Products</h2>
              <p>Explore the latest products from TechNest.</p>
            </div>

            <span className="account-arrow">→</span>
          </Link>

        </div>

        <div className="account-logout">
          <button onClick={logout}>
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}

export default Account;