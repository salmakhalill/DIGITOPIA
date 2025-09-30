import React from "react";

const UnauthorizedPage = () => {
  return (
    <div className="container text-center mt-5">
      <h2 className="text-danger fw-bold">🚫 غير مصرح لك بالوصول</h2>
      <p className="mt-3">ليس لديك صلاحية لعرض هذه الصفحة.</p>
      <a href="/" className=" btn-primary mt-4">
        العودة للصفحة الرئيسية
      </a>
    </div>
  );
};

export default UnauthorizedPage;