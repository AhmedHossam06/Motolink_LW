import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import * as api from "../api";
import { formatPrice, resolveImageUrl } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyProductId, setBusyProductId] = useState(null);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getProducts()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.content || [];
        setProducts(list);
      })
      .catch((err) => setError(err.body?.message || "Couldn't load products."))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickAdd = async (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setBusyProductId(productId);
    try {
      await addToCart(productId, 1);
    } catch {
      // Cart page will surface any real errors on open
    } finally {
      setBusyProductId(null);
    }
  };

  if (loading) {
    return <main className="max-w-7xl mx-auto px-6 py-10 text-motolink-slate">Loading products…</main>;
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-display font-semibold text-motolink-blue hover:underline mb-4 whitespace-nowrap"
      >
        <ArrowLeft size={16} className="shrink-0" />
        <span>Back to home</span>
      </Link>

      <h1 className="font-display font-bold text-2xl sm:text-3xl text-motolink-blue-dark mb-8">
        All products
      </h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {products.length === 0 ? (
        <p className="text-motolink-slate text-center py-16">No products available right now.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product) => {
            const onSale = product.onSale && product.salePrice != null;

            return (
              <div
                key={product.id}
                className="relative bg-white border border-motolink-blue-light rounded-xl overflow-hidden hover:shadow-sm transition-shadow flex flex-col"
              >
                {onSale && (
                  <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[11px] font-display font-bold uppercase tracking-wide px-2 py-1 rounded-md">
                    Sale
                  </span>
                )}

                <Link to={`/product/${product.id}`} className="block aspect-square bg-motolink-blue-light/40">
                  {product.imageUrls?.[0] && (
                    <img
                      src={resolveImageUrl(product.imageUrls[0])}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </Link>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-display font-semibold text-sm sm:text-base text-motolink-blue-dark line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  {product.brand && (
                    <p className="text-motolink-slate text-xs mb-1">{product.brand}</p>
                  )}

                  <div className="mt-auto mb-3">
                    {onSale ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-red-600 text-sm sm:text-base">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-motolink-slate text-xs sm:text-sm line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-display font-bold text-motolink-blue-dark text-sm sm:text-base">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleQuickAdd(product.id)}
                    disabled={busyProductId === product.id}
                    className="w-full flex items-center justify-center gap-1.5 bg-motolink-blue hover:bg-blue-700 disabled:opacity-50 transition-colors text-white text-xs sm:text-sm font-display font-semibold py-2 rounded-lg cursor-pointer disabled:cursor-default"
                  >
                    <ShoppingCart size={14} />
                    {busyProductId === product.id ? "Adding…" : "Add to cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}