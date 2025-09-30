import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "❌ فشل تسجيل الدخول");
        return;
      }

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("role", data.role);

      navigate("/dashboard");
    } catch (err) {
      setError("❌ حدث خطأ أثناء الاتصال بالسيرفر");
      console.error(err);
    }
  };

  return (
    <div className="login d-flex" dir="rtl" lang="ar">
      <div className="login-form container">
        <div className="logoo mb-4 text-center">
          <i className="fa-solid fa-shield-halved ps-1"></i> secureReport
        </div>

        <div className="welcome text-center mb-4">
          <h2 className="fw-bold">مرحبًا بك</h2>
          <p className="text-black-50 fw-bold">
            قم بتسجيل الدخول للوصول إلى لوحة التحكم الإدارية الآمنة الخاصة بك.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              placeholder="example@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-danger text-center">{error}</p>}

          <div className="rememberMe d-flex justify-content-between align-items-center mb-3">
            <label>
              <input type="checkbox" id="remember" /> تذكرني
            </label>
            <a href="/forgetPassword" className="forgot-password">
              هل نسيت كلمة المرور؟
            </a>
          </div>

          <div className="mb-3">
            <button type="submit" className="btn btn-primary w-100">
              تسجيل الدخول
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

export default Login;