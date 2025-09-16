import React, { useEffect } from "react";

function ReportForm() {
  useEffect(() => {
    const form = document.getElementById("reportForm");
    const popup = document.getElementById("popup");

    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    const recordBtn = document.getElementById("recordBtn");
    const recordStatus = document.getElementById("recordStatus");
    const audioPlayback = document.getElementById("audioPlayback");
    const audioData = document.getElementById("audioData");
    const clearBtn = document.getElementById("clearRecording");

    const fileInput = document.getElementById("file");
    const fileList = document.getElementById("fileList");
    let allFiles = [];

    // استرجاع البيانات من localStorage
    if (window.localStorage.getItem("formData")) {
      const saved = JSON.parse(window.localStorage.getItem("formData"));
      document.querySelector("#location").value = saved.location;
      document.querySelector("#locationLink").value = saved.locationLink;
      document.querySelector("#date").value = saved.date;
      document.querySelector("#details").value = saved.details;
      document.querySelector("#contact").value = saved.contact;
      document.querySelector("#criminalName").value = saved.criminalName;
      document.querySelector("#criminalDesc").value = saved.criminalDesc;
      document.querySelector("#criminalOther").value = saved.criminalOther;
    }

    // التسجيل الصوتي
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      recordBtn.addEventListener("click", async () => {
        if (!isRecording) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();
          audioChunks = [];
          isRecording = true;

          recordBtn.classList.add("recording");
          recordStatus.textContent = "جاري التسجيل... اضغط للإيقاف";

          mediaRecorder.addEventListener("dataavailable", (event) => {
            audioChunks.push(event.data);
          });

          mediaRecorder.addEventListener("stop", () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const audioUrl = URL.createObjectURL(audioBlob);

            audioPlayback.src = audioUrl;
            audioPlayback.style.display = "block";
            clearBtn.style.display = "inline-block";
            recordStatus.textContent = "تم التسجيل ✔️";

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
              audioData.value = reader.result;
            };
          });
        } else {
          mediaRecorder.stop();
          isRecording = false;
          recordBtn.classList.remove("recording");
        }
      });

      clearBtn.addEventListener("click", () => {
        audioPlayback.src = "";
        audioPlayback.style.display = "none";
        audioData.value = "";
        clearBtn.style.display = "none";
        recordStatus.textContent = "اضغط للتسجيل";
      });
    } else {
      recordStatus.textContent = "متصفحك لا يدعم التسجيل الصوتي.";
    }

    // رفع الملفات
    fileInput.addEventListener("change", () => {
      Array.from(fileInput.files).forEach((file) => {
        allFiles.push(file);
      });

      fileList.innerHTML = "";
      allFiles.forEach((file, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${file.name}`;
        li.style.color = "#555";
        fileList.appendChild(li);
      });

      fileInput.value = "";
    });

    // حفظ البيانات في localStorage
    form.addEventListener("input", () => {
      const formDataStorage = {
        location: document.querySelector("#location").value,
        locationLink: document.querySelector("#locationLink").value,
        date: document.querySelector("#date").value,
        details: document.querySelector("#details").value,
        contact: document.querySelector("#contact").value,
        criminalName: document.querySelector("#criminalName").value,
        criminalDesc: document.querySelector("#criminalDesc").value,
        criminalOther: document.querySelector("#criminalOther").value,
      };
      window.localStorage.setItem("formData", JSON.stringify(formDataStorage));
    });

    // إرسال البلاغ
    form.onsubmit = async function (e) {
      e.preventDefault();

      const formData = new FormData();

      const reportData = {
        location: document.querySelector("#location").value,
        location_link: document.querySelector("#locationLink").value,
        incident_date: document.querySelector("#date").value,
        report_details: document.querySelector("#details").value,
        contact_info: document.querySelector("#contact").value,
        criminal_infos: [
          {
            name: document.querySelector("#criminalName").value,
            description: document.querySelector("#criminalDesc").value,
            other_info: document.querySelector("#criminalOther").value,
          },
        ],
      };

      formData.append("reportData", JSON.stringify(reportData));

      allFiles.forEach((file) => {
        formData.append("attachments[]", file, "file");
      });

      if (audioData.value) {
        const base64 = audioData.value.split(",")[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const audioBlob = new Blob([byteArray], { type: "audio/webm" });
        formData.append("attachments[]", audioBlob, "audio_recording");
      }

      fetch("http://127.0.0.1:8000/api/reports/new/", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          popup.appendChild(
            document.createTextNode(`tracking id=${data.tracking_code}`)
          );
        })
        .catch((err) => console.error(err));

      popup.style.display = "flex";

      form.reset();
      audioData.value = "";
      audioPlayback.src = "";
      audioPlayback.style.display = "none";
      clearBtn.style.display = "none";
      allFiles = [];

      window.localStorage.removeItem("formData");
    };

    window.closePopup = function () {
      popup.style.display = "none";
    };

    document
      .getElementById("criminalToggle")
      .addEventListener("change", function () {
        const fields = document.getElementById("criminalFields");
        fields.style.display = this.checked ? "block" : "none";
      });
  }, []);

  return (
    <>
      <div className="report-form container py-3">
        <div className="container">
          <h1 className="report-title">قدّم بلاغك بسرية تامة</h1>
          <p className="report-subtitle">نضمن سرية بياناتك بالكامل</p>

          <form id="reportForm">
            <div className="mb-3">
              <label htmlFor="location" className="form-label">
                العنوان/المكان
              </label>
              <input
                type="text"
                id="location"
                className="form-control"
                placeholder="اكتب الموقع"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">الموقع</label>
              <input
                type="text"
                id="locationLink"
                className="form-control mb-2"
                placeholder="لينك جوجل مابس"
              />
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=..."
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Google Map"
                ></iframe>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                تاريخ الواقعة
              </label>
              <input type="date" id="date" className="form-control" required />
            </div>

            <div className="mb-3">
              <label htmlFor="details" className="form-label">
                تفاصيل البلاغ
              </label>
              <textarea
                id="details"
                rows="5"
                className="form-control"
                placeholder="اكتب التفاصيل"
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="file" className="form-label">
                إرفاق ملف/ملفات (اختياري)
              </label>
              <input type="file" id="file" className="form-control" />
              <ul id="fileList" className="mt-2"></ul>
            </div>

            <div className="mb-3">
              <label htmlFor="contact" className="form-label">
                وسيلة تواصل (اختياري)
              </label>
              <input
                type="text"
                id="contact"
                className="form-control"
                placeholder="رقم الهاتف أو البريد"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">تسجيل صوتي (اختياري)</label>
              <div className="voice-recorder text-center">
                <button type="button" id="recordBtn" className="record-btn">
                  🎤
                </button>
                <p id="recordStatus" className="mt-2 text-muted">
                  اضغط للتسجيل
                </p>
                <div
                  className="d-flex align-items-center justify-content-end gap-2 mt-2"
                  style={{ flexDirection: "row-reverse" }}
                >
                  <audio
                    id="audioPlayback"
                    controls
                    style={{ display: "none", marginTop: "16px" }}
                  ></audio>
                  <button
                    type="button"
                    id="clearRecording"
                    style={{
                      display: "none",
                      border: "none",
                      backgroundColor: "transparent",
                      fontSize: "18px",
                    }}
                    title="مسح التسجيل"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  <input type="hidden" id="audioData" name="audioData" />
                </div>
              </div>
            </div>

            <div className="mb-3 form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="criminalToggle"
              />
              <label className="form-check-label" htmlFor="criminalToggle">
                هل لديك معلومات عن المجرم؟
              </label>
            </div>

            <div id="criminalFields" style={{ display: "none" }}>
              <div className="mb-3">
                <label htmlFor="criminalName" className="form-label">
                  اسم المجرم (إن وُجد)
                </label>
                <input
                  type="text"
                  id="criminalName"
                  className="form-control"
                  placeholder="اكتب الاسم أو اللقب المعروف"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="criminalDesc" className="form-label">
                  أوصاف المجرم
                </label>
                <textarea
                  id="criminalDesc"
                  rows="3"
                  className="form-control"
                  placeholder="مثال: الطول، الشعر، ملابس، لهجة..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="criminalOther" className="form-label">
                  معلومات إضافية
                </label>
                <input
                  type="text"
                  id="criminalOther"
                  className="form-control"
                  placeholder="مثال: رقم هاتف، مكان يتردد عليه..."
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-100">
              إرسال البلاغ
            </button>
          </form>
        </div>
      </div>

      <div className="popup" id="popup" style={{ display: "none" }}>
        <div className="popup-content">
          <h2>✅ تم إرسال البلاغ</h2>
          <p>شكرًا لتعاونك، سيتم التعامل مع البلاغ بسرية.</p>
          <button onClick={() => window.closePopup()} className="btn-primary">
            تم
          </button>
        </div>
      </div>
    </>
  );
}

export default ReportForm;
