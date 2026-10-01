import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/products";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryFromUrl = searchParams.get("category");

  const [category, setCategory] = useState(
    categoryFromUrl || "All"
  );

  const categories = [
    "All",
    "Laptops",
    "Audio",
    "Keyboards",
    "Mice",
    "Monitors",
    "Storage"
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Keep category in sync with the URL
  useEffect(() => {
    setCategory(categoryFromUrl || "All");
  }, [categoryFromUrl]);

  const handleCategoryChange = (value) => {
    setCategory(value);

    if (value === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: value });
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.brand
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [products, search, category, sort]);

  return (
    <main className="products-page">

      {/* HEADER */}

      <section className="products-header">
        <p className="eyebrow">TECHNEST STORE</p>

        <h1>
          {category === "All"
            ? "All products"
            : category}
        </h1>

        <p>
          Explore our collection of carefully selected
          technology.
        </p>
      </section>

      {/* CONTROLS */}

      <section className="products-controls">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="search-input"
        />

        <select
          value={category}
          onChange={(e) =>
            handleCategoryChange(e.target.value)
          }
        >
          {categories.map((item) => (
            <option
              value={item}
              key={item}
            >
              {item}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
        >
          <option value="default">
            Sort by
          </option>

          <option value="low">
            Price: Low to High
          </option>

          <option value="high">
            Price: High to Low
          </option>

          <option value="name">
            Name
          </option>
        </select>

      </section>

      {/* RESULTS */}

      <section className="products-results">

        {loading && (
          <div className="empty-results">
            <h2>Loading products...</h2>
          </div>
        )}

        {error && (
          <div className="empty-results">
            <h2>{error}</h2>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="result-count">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </p>

            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      product={product}
                      key={product._id}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="empty-results">
                <h2>
                  No products found
                </h2>

                <p>
                  Try another search or category.
                </p>
              </div>
            )}
          </>
        )}

      </section>

    </main>
  );
}

export default Products;