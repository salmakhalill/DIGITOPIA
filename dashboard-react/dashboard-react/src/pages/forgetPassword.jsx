import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/password_reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "❌ البريد الإلكتروني غير مسجل");
        setLoading(false);
        return;
      }

      navigate("/newPassword");
    } catch (err) {
      setError("❌ حدث خطأ أثناء التحقق من البريد");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login d-flex" dir="rtl" lang="ar">
      <div className="login-form container">
        <div className="logoo mb-3">
          <i className="fa-solid fa-shield-halved ps-1"></i> secureReport
        </div>

        <div className="welcome text-center mb-3">
          <h2 className="fw-bold">مرحبًا بك</h2>
          <p className="text-black-50 fw-bold">
            أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="text-danger text-center">{error}</p>}

          <div className="mb-3">
            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold"
              disabled={loading}
            >
              {loading ? "جارٍ التحقق..." : "نسيت كلمة المرور؟"}
            </button>
          </div>

          <div className="mb-3">
            <button
              type="button"
              className="btn btn-secondary w-100 fw-bold"
              onClick={() => navigate("/login")}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>

      <div className="login-img d-none d-lg-flex flex-column">
        <div className="login-info text-center mb-4">
          <h1 className="fw-bold">مرحبًا بك مجددًا!</h1>
          <p>
            نظام متابعة البلاغات يساعدك على إدارة البلاغات بكفاءة، مع متابعة
            دقيقة لحالتها، وضمان سرعة الاستجابة وجودة المعالجة، لتحقيق الشفافية
            وتعزيز الثقة.
          </p>
        </div>

        <div className="img d-flex align-items-center justify-content-center">
          <div className="img-wrapper position-relative">
            <img src="/web.jpg" className="img-fluid" alt="web" />
            <img
              src="/all.jpg"
              className="img-fluid position-absolute all"
              alt="all"
            />
            <img
              src="/chart (2).jpg"
              className="img-fluid position-absolute chart"
              alt="chart"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;