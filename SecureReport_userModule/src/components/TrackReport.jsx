import React, { useEffect } from "react";

function TrackReport() {
  useEffect(() => {
    const form = document.querySelector(".track-report form");

    form.onsubmit = function (e) {
      e.preventDefault();
      document.querySelector(".track-report").classList.remove("active");
      document.querySelector(".report-timeline").classList.add("active");
    };
  }, []);

  return (
    <main>
      <div className="tracking mt-3">
        <div className="container track-report active">
          <h1 className="report-title">تابع بلاغك خطوة بخطوة</h1>
          <p className="report-subtitle text-black-50 ms-3 me-3">
            من خلال هذه الصفحة يمكنك متابعة حالة بلاغك خطوة بخطوة ومعرفة إذا تم
            استلامه، معالجته أو إغلاقه.
          </p>

          <div id="trackingBox" className="report-form py-3">
            <form id="trackingForm">
              <label htmlFor="tracking" className="form-label">
                أدخل ID البلاغ
              </label>
              <div className="d-flex">
                <input
                  type="text"
                  id="tracking"
                  className="form-control"
                  placeholder="مثال (123456)"
                  required
                />
                <input type="submit" value="تتبع البلاغ" className="button" />
              </div>
            </form>
          </div>
        </div>

        <div className="report-timeline">
          <div className="report-details">
            <h3>تفاصيل البلاغ</h3>
            <div className="details-grid">
              <div>
                <strong>رقم البلاغ:</strong> #82579137
              </div>
              <div>
                <strong>تاريخ البلاغ:</strong> 08 سبتمبر 2025
              </div>
              <div>
                <strong>نوع البلاغ:</strong> بلاغ أمني
              </div>
              <div>
                <strong>الحالة الحالية:</strong> قيد المعالجة
              </div>
            </div>
          </div>

          <h3>تتبع حالة البلاغ</h3>
          <ul className="timeline">
            <li className="active">
              <div className="icon">
                <i className="fa-solid fa-envelope-open"></i>
              </div>
              <div className="desc">
                <p>تم استلام البلاغ</p>
                <span>نص يوضح حالة الاستلام</span>
                <small>التاريخ المتوقع: 10 سبتمبر 2025</small>
              </div>
            </li>
            <li className="active">
              <div className="icon">
                <i className="fa-solid fa-search"></i>
              </div>
              <div className="desc">
                <p>قيد المراجعة</p>
                <span>البلاغ تحت التدقيق</span>
                <small>التاريخ المتوقع: 12 سبتمبر 2025</small>
              </div>
            </li>
            <li className="active">
              <div className="icon">
                <i className="fa-solid fa-cogs"></i>
              </div>
              <div className="desc">
                <p>قيد المعالجة</p>
                <span>الفريق يعمل على حل البلاغ</span>
                <small>التاريخ المتوقع: 15 سبتمبر 2025</small>
              </div>
            </li>
            <li>
              <div className="icon">
                <i className="fa-solid fa-check-circle"></i>
              </div>
              <div className="desc">
                <p>تم الحل</p>
                <span>المشكلة تم حلها بنجاح</span>
                <small>التاريخ المتوقع: 17 سبتمبر 2025</small>
              </div>
            </li>
            <li>
              <div className="icon">
                <i className="fa-solid fa-folder-closed"></i>
              </div>
              <div className="desc">
                <p>تم الإغلاق</p>
                <span>البلاغ تم إغلاقه</span>
                <small>التاريخ المتوقع: 20 سبتمبر 2025</small>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default TrackReport;
