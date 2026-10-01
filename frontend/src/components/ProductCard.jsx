import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
      </div>

      <div className="product-info">
        <span className="product-category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <div className="product-footer">
          <strong>₹{product.price.toLocaleString("en-IN")}</strong>

          <Link
            to={`/products/${product._id}`}
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;