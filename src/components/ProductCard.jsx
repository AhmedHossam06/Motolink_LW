import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { resolveImageUrl, formatPrice } from "../api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const {
    items: wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
  } = useWishlist();
  const [cartBusy, setCartBusy] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const wishlisted = isWishlisted(product.id);
  const onSale = product.onSale && product.salePrice != null;
  const images = product.imageUrls || [];

  // Auto-cycle through photos when a product has more than one
  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleAddToCart = async () => {
    setCartBusy(true);
    try {
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch (err) {
      console.warn("Add to cart failed:", err.message);
    } finally {
      setCartBusy(false);
    }
  };

  const handleToggleWishlist = async () => {
    setWishBusy(true);
    try {
      if (wishlisted) {
        const existing = wishlistItems.find(
          (item) => item.product.id === product.id,
        );
        if (existing) await removeFromWishlist(existing.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (err) {
      console.warn("Wishlist toggle failed:", err.message);
    } finally {
      setWishBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-motolink-blue-light overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-motolink-blue-light">
        {onSale && (
          <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[11px] font-display font-bold uppercase tracking-wide px-2 py-1 rounded-md">
            Sale
          </span>
        )}
        {images.length > 0 ? (
          <>
            {images.map((url, index) => (
              <img
                key={url}
                src={resolveImageUrl(url)}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  index === activeImage ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === activeImage ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-motolink-slate text-sm">
            No image
          </div>
        )}

        <button
          onClick={handleToggleWishlist}
          disabled={wishBusy}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors cursor-pointer disabled:cursor-default"
        >
          <Heart
            size={18}
            className={
              wishlisted
                ? "fill-motolink-blue text-motolink-blue"
                : "text-motolink-blue-dark"
            }
          />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        {product.brand && (
          <span className="text-xs text-motolink-slate uppercase tracking-wide">
            {product.brand}
          </span>
        )}
        <h3 className="font-display font-semibold text-motolink-blue-dark leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          {onSale ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-red-600">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-motolink-slate text-sm line-through">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <p className="font-display font-bold text-motolink-blue">
              {formatPrice(product.price)}
            </p>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={cartBusy || product.stockQuantity === 0}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-motolink-blue hover:bg-blue-700 disabled:opacity-50 transition-colors text-white font-display font-semibold py-2 rounded-lg text-sm cursor-pointer disabled:cursor-default"
        >
          {justAdded ? (
            <>
              <Check size={16} /> Added
            </>
          ) : product.stockQuantity === 0 ? (
            "Out of stock"
          ) : (
            <>
              <ShoppingCart size={16} /> Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}