import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// import data from "../data/archive.json";

const Archive = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filter, setFilter] = useState("الكل");
  const [search, setSearch] = useState("");

  // fetch data from archive.json
  useEffect(() => {
    fetch("/src/data/archive.json")
      .then((res) => res.json())
      .then((data) => {
        const reportsArray = Object.values(data.reports);
        setReports(reportsArray);
        setFilteredReports(reportsArray);
      })
      .catch((err) => console.error("Error loading archive.json:", err));
  }, []);

  // handle filtering + search
  useEffect(() => {
    let temp = [...reports];

    if (filter !== "الكل") {
      temp = temp.filter((r) =>
        filter === "تم الحل"
          ? r.status === "تم الحل"
          : r.status === "تم الغلق" || r.status === "تم الإغلاق"
      );
    }

    if (search.trim()) {
      temp = temp.filter((r) =>
        r.id.toString().toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredReports(temp);
  }, [filter, search, reports]);

  // export to excel
  const exportToExcel = () => {
    const data = filteredReports.map((r) => {
      const [day, month, year] = r.incident_date.split("/").map(Number);
      const date = new Date(year, month - 1, day);

      return [
        { v: r.id },
        { v: r.report_type },
        { v: r.location },
        { v: r.contact_info },
        { v: date, t: "d" },
        { v: r.status },
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([
      ["ID", "نوع البلاغ", "العنوان", "الاتصال", "التاريخ", "الحالة"],
      ...data,
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "البلاغات");

    const date = new Date().toLocaleDateString("ar-EG").replace(/\//g, "-");
    XLSX.writeFile(workbook, `بلاغات_${date}.xlsx`);
  };

  // export to pdf
  const exportReportsToPDF = async () => {
    const tableClone = document.createElement("table");
    tableClone.className = "pdf-table";
    tableClone.style.width = "100%";
    tableClone.style.borderCollapse = "collapse";
    tableClone.style.fontSize = "12px";
    tableClone.style.direction = "rtl";
    tableClone.style.background = "white";
    tableClone.style.color = "black";

    const rowData = filteredReports;

    tableClone.innerHTML = `
  <thead>
    <tr style="background:black; color:white;">
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">رقم البلاغ</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">نوع البلاغ</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">العنوان</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">الاتصال</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">التاريخ</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">الحالة</th>
    </tr>
  </thead>
  <tbody>
    ${rowData
      .map(
        (r) => `
        <tr style="background:white; color:black;">
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.id
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.report_type
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.location
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.contact_info
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.incident_date
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.status
          )}</td>
        </tr>
      `
      )
      .join("")}
  </tbody>
`;

    document.body.appendChild(tableClone);

    try {
      const canvas = await html2canvas(tableClone, {
        scale: 1.5,
        backgroundColor: "#fff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 5, 10, imgWidth, imgHeight);
      const date = new Date().toLocaleDateString("ar-EG").replace(/\//g, "-");
      pdf.save(`بلاغات_${date}.pdf`);
    } catch (err) {
      console.error("خطأ في تصدير الـ PDF:", err);
    } finally {
      document.body.removeChild(tableClone);
    }
  };

  const escapeHtml = (text) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
  };

  return (
    <div className="wrapperr mt-5 mb-5">
      <div className="users-head d-flex align-items-center justify-content-between">
        <h3 className="fw-bold">أرشيف البلاغات</h3>
        <div className="export-buttons d-flex gap-2">
          <button onClick={exportToExcel} className="btn btn-success btn-sm">
            📤 Excel
          </button>
          <button
            onClick={exportReportsToPDF}
            className="btn btn-danger btn-sm"
          >
            📄 PDF
          </button>
        </div>
      </div>

      <div className="users-table archive">
        <div className="table-filter d-flex align-items-center justify-content-between pb-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="الكل">الكل</option>
            <option value="تم الحل">تم الحل</option>
            <option value="تم الإغلاق">تم الإغلاق</option>
          </select>
          <div className="search position-relative">
            <input
              type="text"
              className="font-white-50"
              placeholder="id البلاغ"
              style={{ paddingRight: "35px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="table archive">
          <thead>
            <tr>
              <th scope="col">id</th>
              <th scope="col">نوع البلاغ</th>
              <th scope="col">العنوان</th>
              <th scope="col">الدور</th>
              <th scope="col">التاريخ</th>
              <th scope="col">الحالة</th>
              <th scope="col">عرض المزيد</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <th scope="row" className="id">
                  {report.id}
                </th>
                <td>{report.report_type}</td>
                <td>{report.location}</td>
                <td>{report.contact_info}</td>
                <td>{report.incident_date}</td>
                <td className="status ">
                  <span
                    className={`status-indicator ${
                      report.status === "تم الحل"
                        ? "active"
                        : report.status === "تم الغلق" ||
                          report.status === "تم الإغلاق"
                        ? "inactive"
                        : ""
                    }`}
                  ></span>
                  {report.status}
                </td>
                <td>
                  {/* Modal Trigger */}
                  <button
                    className="btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target={`#reportModal${report.id}`}
                  >
                    عرض المزيد
                  </button>

                  {/* Modal */}
                  <div
                    className="modal fade"
                    id={`reportModal${report.id}`}
                    tabIndex="-1"
                    aria-labelledby={`reportModalLabel${report.id}`}
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                      <div className="modal-content">
                        <div className="modal-header p-3">
                          <h5
                            className="modal-title"
                            id={`reportModalLabel${report.id}`}
                          >
                            تفاصيل البلاغ #{report.id}
                          </h5>
                        </div>
                        <div className="modal-body p-3 text-white-100">
                          <p>
                            <strong>نوع البلاغ:</strong> {report.report_type}
                          </p>
                          <p>
                            <strong>العنوان:</strong>{" "}
                            <a
                              href={report.location_link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {report.location}
                            </a>
                          </p>
                          <p>
                            <strong>التاريخ:</strong> {report.incident_date}
                          </p>
                          <p>
                            <strong>معلومات الاتصال:</strong>{" "}
                            {report.contact_info}
                          </p>
                          <p>
                            <strong>حالة البلاغ:</strong> {report.status}
                          </p>

                          <hr />
                          <p>
                            <strong>تفاصيل البلاغ:</strong>{" "}
                            {report.report_details}
                          </p>

                          <hr />
                          <p>
                            <strong>معلومات الجناة:</strong>
                          </p>
                          <ul>
                            {report.criminal_infos.map((c, idx) => (
                              <li key={idx}>
                                {c.name} - {c.description}{" "}
                                {c.other_info ? `- ${c.other_info}` : ""}
                              </li>
                            ))}
                          </ul>

                          <hr />
                          <p>
                            <strong>المرفقات:</strong>
                          </p>
                          <ul>
                            {report.attachments.map((a, idx) => (
                              <li key={idx}>
                                {a.file ? (
                                  <a
                                    href={a.file}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    📎 ملف
                                  </a>
                                ) : a.audio_recording ? (
                                  <a
                                    href={a.audio_recording}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    🎤 تسجيل صوتي
                                  </a>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* End Modal */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Archive;
