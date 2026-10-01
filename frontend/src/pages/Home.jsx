import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/products";

function Home() {
  const categories = [
    "Laptops",
    "Audio",
    "Keyboards",
    "Mice",
    "Monitors",
    "Storage"
  ];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Show only the first 6 products on the homepage
  const featuredProducts = products.slice(0, 6);

  return (
    <main>
      {/* HERO */}

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            TECHNOLOGY, THOUGHTFULLY CHOSEN
          </p>

          <h1>
            Upgrade your
            <br />
            <span>everyday.</span>
          </h1>

          <p className="hero-text">
            Discover carefully selected technology designed
            to make your work, creativity and everyday life
            better.
          </p>

          <Link to="/products" className="primary-button">
            Explore products →
          </Link>
        </div>

        <div className="hero-decoration">
          <div className="hero-circle">
            TECH
          </div>
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="categories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SHOP BY CATEGORY</p>
            <h2>Find your tech</h2>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${encodeURIComponent(category)}`}
              className="category-card"
              key={category}
            >
              <span>{category}</span>
              <span>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}

      <section className="featured">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED FOR YOU</p>
            <h2>Featured products</h2>
          </div>

          <Link to="/products" className="view-all">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="empty-results">
            <h2>Loading products...</h2>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                product={product}
                key={product._id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <h2>No products available</h2>
            <p>Please check back soon.</p>
          </div>
        )}
      </section>

      {/* PROMO */}

      <section className="promo">
        <div>
          <p className="eyebrow">WHY TECHNEST?</p>

          <h2>
            Good technology
            <br />
            shouldn't be complicated.
          </h2>
        </div>

        <p>
          We make it easier to discover technology that
          actually fits your needs — without the endless
          scrolling and confusing specifications.
        </p>
      </section>
    </main>
  );
}

export default Home;