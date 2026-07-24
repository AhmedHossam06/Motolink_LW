import { useEffect, useState } from "react";
import { X, ImagePlus, Trash2 } from "lucide-react";
import * as api from "../api";
import { resolveImageUrl } from "../api";

// Same modal handles both "create" (product = null) and "edit" (product = existing product)
export default function ProductFormModal({ product, onClose, onSaved }) {
  const isEditing = Boolean(product);

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [salePrice, setSalePrice] = useState(product?.salePrice ?? "");
  const [brand, setBrand] = useState(product?.brand || "");
  const [categoryId, setCategoryId] = useState(product?.category?.id || "");
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity ?? "");
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Object URLs for previewing newly-selected files before upload; revoke them on change/unmount
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    // Reset the input so selecting the same file again still fires onChange
    e.target.value = "";
  };

  const removeSelectedFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const salePriceValid =
    salePrice === "" || (Number(salePrice) >= 0 && Number(salePrice) < Number(price || 0));

  const valid =
    name.trim() !== "" &&
    price !== "" &&
    Number(price) >= 0 &&
    categoryId !== "" &&
    stockQuantity !== "" &&
    Number(stockQuantity) >= 0 &&
    salePriceValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      salePrice: salePrice === "" ? null : Number(salePrice),
      brand: brand.trim() || null,
      categoryId: Number(categoryId),
      stockQuantity: Number(stockQuantity),
    };

    try {
      if (isEditing) {
        await api.updateProduct(product.id, payload, imageFiles);
      } else {
        await api.createProduct(payload, imageFiles);
      }
      onSaved();
    } catch (err) {
      setError(err.body?.message || "Couldn't save the product. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative my-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-motolink-slate hover:text-motolink-blue-dark cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="font-display font-bold text-xl text-motolink-blue-dark mb-6">
          {isEditing ? "Edit product" : "Add product"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-motolink-blue-dark mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-motolink-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-motolink-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-motolink-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
                Stock quantity
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-motolink-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
              Sale price (optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Leave empty for no discount"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-motolink-blue"
            />
            {salePrice !== "" && !salePriceValid && (
              <p className="text-red-600 text-xs mt-1">
                Sale price must be lower than the regular price.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-motolink-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-motolink-blue"
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
              Photos
            </label>

            {isEditing && product?.imageUrls?.length > 0 && imageFiles.length === 0 && (
              <>
                <div className="flex gap-2 flex-wrap mb-2">
                  {product.imageUrls.map((url) => (
                    <img
                      key={url}
                      src={resolveImageUrl(url)}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  ))}
                </div>
                <p className="text-motolink-slate text-xs mb-2">
                  Current photos shown above. Choosing new ones below will replace all of them.
                </p>
              </>
            )}

            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {previews.map((url, index) => (
                  <div key={url} className="relative w-16 h-16 shrink-0">
                    <img
                      src={url}
                      alt={`Selected ${index + 1}`}
                      className="w-full h-full rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      aria-label="Remove photo"
                      className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-lg px-3 py-3 text-sm text-motolink-blue font-medium cursor-pointer hover:bg-motolink-blue-light/40 transition-colors">
              <ImagePlus size={16} />
              Add photos
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!valid || saving}
            className="mt-2 bg-motolink-blue hover:bg-blue-700 disabled:opacity-50 transition-colors text-white font-display font-semibold py-2.5 rounded-lg cursor-pointer disabled:cursor-default"
          >
            {saving ? "Saving…" : isEditing ? "Save changes" : "Create product"}
          </button>
        </form>
      </div>
    </div>
  );
}