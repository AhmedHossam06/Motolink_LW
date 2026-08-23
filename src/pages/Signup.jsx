import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NAME_REGEX, getPasswordStrength } from "../utils";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signupUser, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && !NAME_REGEX.test(value)) return; // block symbols/digits in name
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError("");
    setSubmitting(true);
    try {
      await signupUser(form.name, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      if (err.body && !err.body.message) {
        setFieldErrors(err.body);
      } else {
        setGeneralError(err.body?.message || "Could not create your account.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-motolink-blue-light px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-motolink-blue-dark mb-1">
          Create your account
        </h1>
        <p className="text-motolink-slate text-sm mb-6 sm:mb-8">
          Join Motolink to track orders, save favorites and book service.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-motolink-blue-dark">
              Full name
            </label>
            <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 sm:py-2 focus-within:border-motolink-blue">
              <User size={18} className="text-motolink-slate shrink-0" />
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full min-w-0 outline-none text-sm"
              />
            </div>
            {fieldErrors.name && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-motolink-blue-dark">
              Email
            </label>
            <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 sm:py-2 focus-within:border-motolink-blue">
              <Mail size={18} className="text-motolink-slate shrink-0" />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full min-w-0 outline-none text-sm"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-motolink-blue-dark">
              Password
            </label>
            <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 sm:py-2 focus-within:border-motolink-blue">
              <Lock size={18} className="text-motolink-slate shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className="w-full min-w-0 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-motolink-slate hover:text-motolink-blue-dark shrink-0 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {form.password && (
              <div className="mt-1.5">
                <div className="flex gap-1 h-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${
                        i < passwordStrength.score ? passwordStrength.color : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs mt-1 font-medium ${
                    passwordStrength.label === "Weak"
                      ? "text-red-600"
                      : passwordStrength.label === "Medium"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {passwordStrength.label}
                </p>
              </div>
            )}

            {fieldErrors.password && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {generalError && (
            <p className="text-red-600 text-sm">{generalError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-motolink-blue hover:bg-blue-700 disabled:opacity-50 transition-colors text-white font-display font-semibold py-3 sm:py-2.5 rounded-lg mt-2"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-motolink-slate text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-motolink-blue font-medium">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}