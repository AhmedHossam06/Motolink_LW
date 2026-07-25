import { useState, useEffect } from "react";
import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import * as api from "../api";
import ProductCard from "../components/ProductCard";

export default function CategoryProducts() {
  const { categoryId } = useParams();
  const { category } = useLoaderData();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getProducts({ categoryId, sort: sort || undefined })
      .then((data) => {
        if (!cancelled) setProducts(data?.content || []);
      })
      .catch((err) => console.warn("Failed to load products:", err.message))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId, sort]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-motolink-blue font-medium mb-4 cursor-pointer"
      >
        ← Back to home
      </button>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="font-display font-bold text-3xl text-motolink-blue-dark">
          {category?.name || "Products"}
        </h1>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-motolink-blue-dark"
        >
          <option value="">Sort by</option>
          <option value="price,asc">Price: low to high</option>
          <option value="price,desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <p className="text-motolink-slate">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-motolink-slate">No products found in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}