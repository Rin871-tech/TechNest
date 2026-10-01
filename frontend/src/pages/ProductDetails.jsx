import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProduct } from "../api/products";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (error) {
        console.error(error);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="not-found">
        <h1>Loading product...</h1>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="not-found">
        <h1>Product not found</h1>

        <Link to="/products">
          ← Back to products
        </Link>
      </main>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${product.name} added to cart!`);
  };

  return (
    <main className="product-details">
      <Link
        to="/products"
        className="back-link"
      >
        ← Back to products
      </Link>

      <section className="product-details-container">

        <div className="details-image">
          <img
            src={product.image}
            alt={product.name}
          />
        </div>

        <div className="details-content">

          <p className="eyebrow">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <p className="brand">
            by {product.brand}
          </p>

          <div className="details-price">
            ₹{product.price.toLocaleString("en-IN")}
          </div>

          <p className="details-description">
            {product.description}
          </p>

          <div className="quantity-section">

            <span>Quantity</span>

            <div className="quantity-control">

              <button
                onClick={() =>
                  setQuantity(
                    Math.max(1, quantity - 1)
                  )
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() =>
                  setQuantity(quantity + 1)
                }
              >
                +
              </button>

            </div>

          </div>

          <button
            className="add-cart-button"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

          <div className="product-features">

            <div>
              <strong>✓</strong>
              <span>Secure checkout</span>
            </div>

            <div>
              <strong>✓</strong>
              <span>Fast delivery</span>
            </div>

            <div>
              <strong>✓</strong>
              <span>Genuine products</span>
            </div>

          </div>

        </div>

      </section>
    </main>
  );
}

export default ProductDetails;