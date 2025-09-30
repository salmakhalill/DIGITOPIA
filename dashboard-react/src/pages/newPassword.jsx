import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NewPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (password !== confirmPassword) {
    setError("❌ كلمتا المرور غير متطابقتين");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(
      "http://127.0.0.1:8000/api/auth/password_reset_confirm/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,               // لازم تبعتي الإيميل كمان
          new_password: password,
          confirm_password: confirmPassword,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "❌ فشل تغيير كلمة المرور");
      setLoading(false);
      return;
    }

    navigate("/login", { replace: true });
  } catch (err) {
    setError("❌ حدث خطأ أثناء الاتصال بالسيرفر");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login d-flex">
      <div className="login-form container">
        <div className="logoo">
          <i className="fa-solid fa-shield-halved ps-1"></i> secureReport
        </div>
        <div className="welcome text-center">
          <h2 className="fw-bold">مرحبًا بك</h2>
          <p className="text-black-50 fw-bold">أدخل كلمة المرور الجديدة</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password">كلمة المرور الجديدة</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="********"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="********"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-danger text-center">{error}</p>}

          <div className="mb-3">
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "جارٍ التغيير..." : "تأكيد"}
            </button>
          </div>
        </form>
      </div>

      <div className="login-img">
        <div className="login-info text-center">
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

export default NewPassword;