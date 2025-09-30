import React, { useEffect, useState } from "react";

const Setting = () => {
  const saveSetting = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const loadSetting = (key, defaultValue = null) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  };

  const defaultColor = "#462f8a";

  const [account, setAccount] = useState({
    name: loadSetting("account_name", ""),
    email: loadSetting("account_email", ""),
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
  });

  const [appearance, setAppearance] = useState({
    theme: loadSetting("appearance_theme", "داكن"),
    font: loadSetting("appearance_font", "Cairo"),
    color: loadSetting("appearance_color", defaultColor),
  });

  const [notifications, setNotifications] = useState({
    email: loadSetting("noti_email", true),
    push: loadSetting("noti_push", false),
    sms: loadSetting("noti_sms", false),
  });

  useEffect(() => {
    if (appearance.theme === "فاتح") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    document.body.style.fontFamily = appearance.font;
    document.documentElement.style.setProperty("--purple", appearance.color);
  }, [appearance]);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    saveSetting("account_name", account.name);
    saveSetting("account_email", account.email);

    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/account/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: account.full_name,
          email: account.email,
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        }),
      });

      if (!res.ok) {
        throw new Error(`فشل التحديث: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ تم تحديث الحساب:", data);
      alert("✅ تم حفظ إعدادات الحساب وتحديثها في السيرفر");
      setPasswords({ current: "", new: "" });
    } catch (err) {
      console.error("❌ خطأ أثناء تحديث الحساب:", err);
      alert("❌ حدث خطأ أثناء تحديث إعدادات الحساب");
    }
  };

  const handleAppearanceSubmit = (e) => {
    e.preventDefault();
    saveSetting("appearance_theme", appearance.theme);
    saveSetting("appearance_font", appearance.font);
    saveSetting("appearance_color", appearance.color);
    alert("تم حفظ إعدادات المظهر");
  };

  const handleNotificationsSubmit = (e) => {
    e.preventDefault();
    saveSetting("noti_email", notifications.email);
    saveSetting("noti_push", notifications.push);
    saveSetting("noti_sms", notifications.sms);
    alert("تم تحديث إعدادات الإشعارات");
  };

  const resetColor = () => {
    setAppearance({ ...appearance, color: defaultColor });
  };

  return (
    <div className="wrapperr mt-5 mb-5">
      <div className="users-head d-flex align-items-center justify-content-between">
        <h2 className="fw-bold mb-4">اعدادات المستخدم</h2>
      </div>

      <div className="card">
        <div className="card-header">
          <ul
            className="nav nav-underline card-header-tabs"
            id="settingsTab"
            role="tablist"
          >
            <li className="nav-item">
              <a
                className="nav-link active"
                data-bs-toggle="tab"
                href="#account"
              >
                إعدادات الحساب
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-bs-toggle="tab" href="#appearance">
                إعدادات الواجهة والمظهر
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                data-bs-toggle="tab"
                href="#notifications"
              >
                إعدادات الإشعارات
              </a>
            </li>
          </ul>
        </div>

        <div className="card-body">
          <div className="tab-content">
            <div className="tab-pane fade show active" id="account">
              <h5 className="mb-3">إعدادات الحساب</h5>
              <form onSubmit={handleAccountSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">الاسم الكامل</label>
                    <input
                      type="text"
                      className="form-control"
                      value={account.name}
                      onChange={(e) =>
                        setAccount({ ...account, name: e.target.value })
                      }
                      placeholder="محمد أحمد"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">البريد الإلكتروني</label>
                    <input
                      type="email"
                      className="form-control"
                      value={account.email}
                      onChange={(e) =>
                        setAccount({ ...account, email: e.target.value })
                      }
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      placeholder="********"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">كلمة مرور جديدة</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      placeholder="********"
                    />
                  </div>
                </div>
                <button className="btn btn-primary">حفظ التغييرات</button>
              </form>
            </div>

            <div className="tab-pane fade" id="appearance">
              <h5 className="mb-3">إعدادات الواجهة والمظهر</h5>
              <form onSubmit={handleAppearanceSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">الثيم</label>
                    <select
                      className="form-select"
                      value={appearance.theme}
                      onChange={(e) =>
                        setAppearance({ ...appearance, theme: e.target.value })
                      }
                    >
                      <option>فاتح</option>
                      <option>داكن</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">نوع الخط</label>
                    <select
                      className="form-select"
                      value={appearance.font}
                      onChange={(e) =>
                        setAppearance({ ...appearance, font: e.target.value })
                      }
                    >
                      <option>Roboto</option>
                      <option>Inter</option>
                      <option>Cairo</option>
                      <option>Segoe UI</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">اللون الأساسي</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={appearance.color}
                        onChange={(e) =>
                          setAppearance({
                            ...appearance,
                            color: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={resetColor}
                      >
                        استرجاع الافتراضي
                      </button>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">حفظ المظهر</button>
              </form>
            </div>

            <div className="tab-pane fade" id="notifications">
              <h5 className="mb-3">إعدادات الإشعارات</h5>
              <form onSubmit={handleNotificationsSubmit}>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailNoti"
                    checked={notifications.email}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        email: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor="emailNoti">
                    إشعارات البريد الإلكتروني
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="smsNoti"
                    checked={notifications.sms}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        sms: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor="smsNoti">
                    تنبيهات عبر الرسائل القصيرة
                  </label>
                </div>
                <button className="btn btn-primary">تحديث الإشعارات</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;