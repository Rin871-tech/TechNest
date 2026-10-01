import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
  } = useCart();

  const getProductId = (item) => item._id || item.id;

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <p className="eyebrow">YOUR CART</p>
          <h1>Your cart is empty</h1>
          <p>Add some products to get started.</p>

          <Link to="/products" className="primary-button">
            Browse Products →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <section className="cart-header">
        <p className="eyebrow">YOUR CART</p>
        <h1>Shopping Cart</h1>
        <p>
          {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
        </p>
      </section>

      <section className="cart-container">
        <div className="cart-items">
          {cart.map((item) => {
            const productId = getProductId(item);

            return (
              <div className="cart-item" key={productId}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-image"
                />

                <div className="cart-item-info">
                  <span className="product-category">
                    {item.category}
                  </span>

                  <h3>{item.name}</h3>

                  <p>
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          updateQuantity(
                            productId,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            productId,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-button"
                      onClick={() => removeFromCart(productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <strong className="cart-item-total">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </strong>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>
              ₹{subtotal.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <strong>FREE</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>
              ₹{subtotal.toLocaleString("en-IN")}
            </strong>
          </div>

          <Link
            to="/checkout"
            className="checkout-button"
          >
            Proceed to Checkout →
          </Link>

          <Link
            to="/products"
            className="continue-shopping"
          >
            ← Continue Shopping
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default Cart;