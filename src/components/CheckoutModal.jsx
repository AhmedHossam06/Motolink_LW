import { useState } from "react";
import { X, Banknote } from "lucide-react";
import instapayLogo from "../assets/instapay-logo.jpg";
import vodafoneCashLogo from "../assets/vodafone-cash-logo.png";

const PAYMENT_METHODS = [
  {
    value: "instapay",
    label: "Instapay",
    Logo: () => (
      <img
        src={instapayLogo}
        alt="Instapay"
        className="w-9 h-9 rounded-md object-contain bg-white shrink-0"
      />
    ),
  },
  {
    value: "vodafone_cash",
    label: "Vodafone Cash",
    Logo: () => (
      <img
        src={vodafoneCashLogo}
        alt="Vodafone Cash"
        className="w-9 h-9 rounded-full object-contain shrink-0"
      />
    ),
  },
  {
    value: "cash_on_delivery",
    label: "Cash",
    Logo: () => (
      <span className="flex items-center justify-center w-9 h-9 rounded-md bg-motolink-blue/10 text-motolink-blue shrink-0">
        <Banknote size={18} />
      </span>
    ),
  },
];

export default function CheckoutModal({ onConfirm, onClose, submitting }) {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);
  const [paymentTouched, setPaymentTouched] = useState(false);

  const phoneValid = /^01[0125][0-9]{8}$/.test(phone);
  const valid = phoneValid && address.trim() !== "" && paymentMethod !== "";

  const handlePhoneChange = (e) => {
    // Strip anything that isn't a digit as the user types, cap at 11 digits
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(digitsOnly);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPhoneTouched(true);
    setAddressTouched(true);
    setPaymentTouched(true);
    if (!valid) return;
    onConfirm(phone.trim(), address.trim(), paymentMethod);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-motolink-slate hover:text-motolink-blue-dark cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="font-display font-bold text-xl text-motolink-blue-dark mb-1">
          Delivery details
        </h2>
        <p className="text-motolink-slate text-sm mb-6">
          We need this to get your order to you.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
              Phone number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => setPhoneTouched(true)}
              placeholder="e.g. 01012345678"
              maxLength={11}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-motolink-blue"
            />
            {phoneTouched && phone.trim() === "" && (
              <p className="text-red-600 text-xs mt-1">Phone number is required.</p>
            )}
            {phoneTouched && phone.trim() !== "" && !phoneValid && (
              <p className="text-red-600 text-xs mt-1">
                Enter a valid Egyptian phone number (e.g. 01012345678).
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
              Delivery address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => setAddressTouched(true)}
              placeholder="Street, building, city…"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-motolink-blue"
            />
            {addressTouched && address.trim() === "" && (
              <p className="text-red-600 text-xs mt-1">Address is required.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-motolink-blue-dark mb-1">
              Payment method
            </label>
            <div className="flex flex-col gap-2">
              {PAYMENT_METHODS.map(({ value, label, Logo }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 border rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                    paymentMethod === value
                      ? "border-motolink-blue ring-2 ring-motolink-blue/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    onBlur={() => setPaymentTouched(true)}
                    className="accent-motolink-blue"
                  />
                  <Logo />
                  <span className="text-motolink-blue-dark font-medium">{label}</span>
                </label>
              ))}
            </div>
            {paymentTouched && paymentMethod === "" && (
              <p className="text-red-600 text-xs mt-1">Please choose a payment method.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-motolink-blue hover:bg-blue-700 disabled:opacity-50 transition-colors text-white font-display font-semibold py-2.5 rounded-lg cursor-pointer disabled:cursor-default"
          >
            {submitting ? "Placing order…" : "Confirm order"}
          </button>
        </form>
      </div>
    </div>
  );
}