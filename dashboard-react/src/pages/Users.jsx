import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";
// import { useNavigate } from "react-router-dom";

const rowsPerPage = 10;

const Users = () => {
  // const navigate = useNavigate();
  // const role = localStorage.getItem("role");
  // useEffect(() => {
  //   if (role !== "Admin") {
  //     navigate("/unauthorized");
  //   }
  // }, []);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");
  const [userToDelete, setUserToDelete] = useState(null);

  const nameRef = useRef();
  const emailRef = useRef();
  const roleRef = useRef();

  useEffect(() => {
    const handleClickOutside = () => {
      setUsers((prev) => prev.map((u) => ({ ...u, showMenu: false })));
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ===== Load Users =====
  useEffect(() => {
    async function loadUsers() {
      const token = localStorage.getItem("accessToken");

      try {
        const res = await fetch("http://127.0.0.1:8000/api/users/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`فشل تحميل المستخدمين: ${res.status}`);
        }

        const data = await res.json();

        const formatted = (Array.isArray(data) ? data : []).map((u) => ({
          name: u.full_name || "—",
          email: u.email,
          role: u.role,
          status: u.status === "active" ? "Active" : "Inactive",
          createdAt: new Date(u.date_joined).toLocaleDateString("ar-EG"),
          id: u.id,
        }));

        setUsers(formatted);
        setFilteredUsers(formatted);
      } catch (err) {
        console.error("❌ خطأ في تحميل المستخدمين:", err);
      }
    }

    loadUsers();
  }, []);

  // ===== Filter + Search =====
  useEffect(() => {
    let temp = [...users];

    if (filterStatus === "النشطاء") {
      temp = temp.filter((u) => (u.status || "").toLowerCase() === "active");
    } else if (filterStatus === "المحظورون") {
      temp = temp.filter((u) => (u.status || "").toLowerCase() === "inactive");
    }

    const query = searchQuery.trim().toLowerCase();
    if (query !== "") {
      temp = temp.filter((u) => {
        const name = (u.name || "").trim().toLowerCase();
        return name.startsWith(query);
      });
    }

    setFilteredUsers(temp);
  }, [searchQuery, filterStatus, users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // ===== Add User (API) =====
  const handleAddUser = async ({ name, email, role }) => {
    const token = localStorage.getItem("accessToken");
    const newUser = {
      full_name: name || "غير معروف",
      email: email || `user${Date.now()}@example.com`,
      role: role || "Employee",
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("فشل في إضافة المستخدم");

      const savedUser = await res.json();
      setUsers((prev) => [savedUser, ...prev]);

      nameRef.current.value = "";
      emailRef.current.value = "";
      roleRef.current.value = "";
    } catch (err) {
      console.error("❌ خطأ في إضافة المستخدم:", err);
    }
  };

  // ===== Delete User (API) =====
  const handleDeleteUser = async (id) => {
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`فشل في حذف المستخدم: ${res.status}`);

      setUsers((prev) => prev.filter((u) => u.id !== id));
      setUserToDelete(null);
    } catch (err) {
      console.error("❌ خطأ في حذف المستخدم:", err);
    }
  };

  // ===== Block/Unblock (API) =====
  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem("accessToken");
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const newStatus = user.status === "Active" ? "Inactive" : "Active";

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error(`فشل في تعديل الحالة: ${res.status}`);

      const data = await res.json();
      const updatedStatus = data.status;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: updatedStatus, showMenu: false } : u
        )
      );
    } catch (err) {
      console.error("❌ خطأ في تعديل الحالة:", err);
    }
  };

  // ===== Pagination =====
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getVisiblePageNumbers = () => {
    const start = Math.floor((currentPage - 1) / 3) * 3 + 1;
    const pages = [];
    for (let i = start; i < start + 3 && i <= pageCount; i++) pages.push(i);
    return pages;
  };

  const handlePageChange = (page) => {
    if (page < 1) page = 1;
    if (page > pageCount) page = pageCount;
    setCurrentPage(page);
  };

  // ===== Export Excel =====
  const exportToExcel = () => {
    const dataRows = [
      ["الاسم", "البريد الإلكتروني", "الدور", "الحالة", "تاريخ الإنشاء"],
      ...filteredUsers.map((u) => [
        u.name,
        u.email,
        u.role,
        u.status,
        u.createdAt,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(dataRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المستخدمين");
    const dateStr = new Date().toLocaleDateString("ar-EG").replace(/\//g, "-");
    XLSX.writeFile(wb, `المستخدمين_${dateStr}.xlsx`);
  };

  // ===== Export PDF =====
  const exportToPDF = async () => {
    const tableClone = document.createElement("table");
    tableClone.className = "pdf-table";
    tableClone.style.width = "100%";
    tableClone.style.borderCollapse = "collapse";
    tableClone.style.fontSize = "12px";
    tableClone.style.direction = "rtl";
    tableClone.style.background = "white";
    tableClone.style.color = "black";

    const rowData = filteredUsers;

    tableClone.innerHTML = `
  <thead>
    <tr style="background:black; color:white;">
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">الاسم</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">البريد الإلكتروني</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">الدور</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">الحالة</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">تاريخ الإنشاء</th>
    </tr>
  </thead>
  <tbody>
    ${rowData
      .map(
        (u) => `
        <tr style="background:white; color:black;">
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            u.name
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            u.email
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            u.role
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            u.status
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            u.createdAt
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
      pdf.save(`المستخدمين_${date}.pdf`);
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
      {/* Users Head */}
      <div className="users-head d-flex align-items-center justify-content-between mb-3">
        <h2 className="fw-bold">إدارة المستخدمين</h2>
        <button
          type="button"
          className=" btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addUserModal"
        >
          إضافة مستخدم
        </button>
      </div>

      {/* Filter/Search */}
      <div className="users-table mt-3">
        <div className="table-filter d-flex align-items-center justify-content-between pb-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="الكل">الكل</option>
            <option value="النشطاء">النشطاء</option>
            <option value="المحظورون">المحظورون</option>
          </select>
          <div className="search">
            <input
              type="text"
              className="form-control"
              placeholder="الاسم"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: "35px" }}
            />
          </div>
        </div>

        {/* Users Table */}
        <table className="table ">
          <thead>
            <tr>
              <th>ID</th>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th>تاريخ الإنشاء</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.email}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td className="status">
                  <span
                    className={`status-indicator ${
                      user.status === "Active" ? "active" : "inactive"
                    }`}
                  ></span>
                  {user.status === "Active" ? "Active" : "Inactive"}
                </td>

                <td>{user.createdAt}</td>
                <td>
                  <div
                    className="dropdown"
                    style={{ position: "relative" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn-sm drop"
                      onClick={() =>
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === user.id
                              ? { ...u, showMenu: !u.showMenu }
                              : u
                          )
                        )
                      }
                    >
                      ⋮
                    </button>

                    {user.showMenu && (
                      <ul
                        className="dropdown-menu"
                        style={{
                          display: "block",
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          zIndex: 10,
                          textAlign: "center",
                        }}
                      >
                        <li>
                          <button
                            className="dropdown-item d-flex justify-content-center align-items-center"
                            onClick={() => handleToggleStatus(user.id)}
                          >
                            <i
                              className={`fa-solid ${
                                user.status === "active"
                                  ? "fa-ban"
                                  : "fa-unlock"
                              } m-1`}
                            ></i>
                            <span className="m-1">
                              {user.status === "Active"
                                ? "حظر المستخدم"
                                : "إلغاء الحظر"}
                            </span>
                          </button>
                        </li>

                        <li>
                          <button
                            className="dropdown-item d-flex justify-content-center align-items-center"
                            onClick={() => {
                              setUserToDelete(user.id);
                              setUsers((prev) =>
                                prev.map((u) =>
                                  u.id === user.id
                                    ? { ...u, showMenu: false }
                                    : u
                                )
                              );
                            }}
                            data-bs-toggle="modal"
                            data-bs-target="#deleteConfirmModal"
                          >
                            <i className="fa-solid fa-trash m-1"></i>
                            <span className="m-1">حذف المستخدم</span>
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination & Export */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <nav aria-label="Page navigation">
            <ul className="pagination">
              {/* prev 3 */}
              <li className={`page-item ${currentPage <= 3 ? "disabled" : ""}`}>
                <a
                  href="#"
                  className="page-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 3);
                  }}
                >
                  &laquo;
                </a>
              </li>

              {/* prev 1 */}
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <a
                  href="#"
                  className="page-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                >
                  &lsaquo;
                </a>
              </li>

              {/* numbers */}
              {getVisiblePageNumbers().map((num) => (
                <li
                  key={num}
                  className={`page-item ${currentPage === num ? "active" : ""}`}
                >
                  <a
                    href="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(num);
                    }}
                  >
                    {num}
                  </a>
                </li>
              ))}

              {/* next 1 */}
              <li
                className={`page-item ${
                  currentPage === pageCount ? "disabled" : ""
                }`}
              >
                <a
                  href="#"
                  className="page-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                >
                  &rsaquo;
                </a>
              </li>

              {/* next 3 */}
              <li
                className={`page-item ${
                  currentPage >= pageCount - 2 ? "disabled" : ""
                }`}
              >
                <a
                  href="#"
                  className="page-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 3);
                  }}
                >
                  &raquo;
                </a>
              </li>
            </ul>
          </nav>

          {/* Export Buttons */}
          <div className="d-flex gap-2">
            <button
              className="btn btn-success btn-sm me-3"
              onClick={exportToExcel}
            >
              📤 Excel
            </button>
            <button
              className="btn btn-danger btn-sm ms-3"
              onClick={exportToPDF}
            >
              📄 PDF
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <div
        className="modal fade"
        id="addUserModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">إضافة مستخدم</h5>
            </div>
            <div className="modal-body">
              <input
                ref={nameRef}
                className="form-control mb-2"
                placeholder="الاسم"
              />
              <input
                ref={emailRef}
                className="form-control mb-2"
                placeholder="البريد الإلكتروني"
              />
              <input
                ref={roleRef}
                className="form-control mb-2"
                placeholder="الدور"
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                إغلاق
              </button>
              <button
                type="button"
                className=" btn-primary"
                onClick={() =>
                  handleAddUser({
                    name: nameRef.current.value,
                    email: emailRef.current.value,
                    role: roleRef.current.value,
                  })
                }
                data-bs-dismiss="modal"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete User Modal */}
      <div
        className="modal fade"
        id="deleteConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">تأكيد الحذف</h5>
            </div>
            <div className="modal-body">
              هل أنت متأكد أنك تريد حذف هذا المستخدم؟
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                إلغاء
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={() => userToDelete && handleDeleteUser(userToDelete)}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;