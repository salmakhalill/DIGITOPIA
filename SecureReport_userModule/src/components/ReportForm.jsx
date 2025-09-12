import React, { useEffect } from "react";

function ReportForm() {
  useEffect(() => {
    const form = document.getElementById("reportForm");
    const popup = document.getElementById("popup");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      popup.style.display = "flex";
      form.reset();
    });

    window.closePopup = function () {
      popup.style.display = "none";
    };

    // التسجيل الصوتي
    let mediaRecorder;
    let audioChunks = [];
    const recordBtn = document.getElementById("recordBtn");
    const recordStatus = document.getElementById("recordStatus");
    const audioPlayback = document.getElementById("audioPlayback");
    const audioData = document.getElementById("audioData");
    let isRecording = false;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      recordBtn.addEventListener("click", async () => {
        if (!isRecording) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          recordStatus.textContent = "تم التسجيل ✔️";
        }
      });
    } else {
      recordStatus.textContent = "متصفحك لا يدعم التسجيل الصوتي.";
    }

    // إظهار بيانات المجرم
    document.getElementById("criminalToggle").addEventListener("change", function () {
      const fields = document.getElementById("criminalFields");
      fields.style.display = this.checked ? "block" : "none";
    });
  }, []);

  return (
    <>
      <div className="report-form container py-5">
        <div className="container">
          <h1 className="report-title">قدّم بلاغك بسرية تامة</h1>
          <p className="report-subtitle">نضمن سرية بياناتك بالكامل</p>

          <form id="reportForm">
            <div className="mb-3">
              <label htmlFor="location" className="form-label">العنوان/المكان</label>
              <input type="text" id="location" className="form-control" placeholder="اكتب الموقع" required />
            </div>

            <div className="mb-3">
              <label className="form-label">الموقع</label>
              <input type="text" className="form-control mb-2" placeholder="لينك جوجل مابس" />
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
              <label htmlFor="date" className="form-label">تاريخ الواقعة</label>
              <input type="date" id="date" className="form-control" required />
            </div>

            <div className="mb-3">
              <label htmlFor="details" className="form-label">تفاصيل البلاغ</label>
              <textarea id="details" rows="5" className="form-control" placeholder="اكتب التفاصيل" required></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="file" className="form-label">إرفاق ملف (اختياري)</label>
              <input type="file" id="file" className="form-control" />
            </div>

            <div className="mb-3">
              <label htmlFor="contact" className="form-label">وسيلة تواصل (اختياري)</label>
              <input type="text" id="contact" className="form-control" placeholder="رقم الهاتف أو البريد" />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">تسجيل صوتي (اختياري)</label>
              <div className="voice-recorder text-center">
                <button type="button" id="recordBtn" className="record-btn">🎤</button>
                <p id="recordStatus" className="mt-2 text-muted">اضغط للتسجيل</p>
                <audio id="audioPlayback" controls style={{ display: "none", marginTop: "10px" }}></audio>
                <input type="hidden" id="audioData" name="audioData" />
              </div>
            </div>

            <div className="mb-3 form-check form-switch">
              <input className="form-check-input" type="checkbox" id="criminalToggle" />
              <label className="form-check-label" htmlFor="criminalToggle">هل لديك معلومات عن المجرم؟</label>
            </div>

            <div id="criminalFields" style={{ display: "none" }}>
              <div className="mb-3">
                <label htmlFor="criminalName" className="form-label">اسم المجرم (إن وُجد)</label>
                <input type="text" id="criminalName" className="form-control" placeholder="اكتب الاسم أو اللقب المعروف" />
              </div>

              <div className="mb-3">
                <label htmlFor="criminalDesc" className="form-label">أوصاف المجرم</label>
                <textarea id="criminalDesc" rows="3" className="form-control" placeholder="مثال: الطول، الشعر، ملابس، لهجة..."></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="criminalOther" className="form-label">معلومات إضافية</label>
                <input type="text" id="criminalOther" className="form-control" placeholder="مثال: رقم هاتف، مكان يتردد عليه..." />
              </div>
            </div>

            <button type="submit" className="btn-primary w-100">إرسال البلاغ</button>
          </form>
        </div>
      </div>

      <div className="popup" id="popup" style={{ display: "none" }}>
        <div className="popup-content">
          <h2>✅ تم إرسال البلاغ</h2>
          <p>شكرًا لتعاونك، سيتم التعامل مع البلاغ بسرية.</p>
          <button onClick={() => window.closePopup()} className="btn-primary">تم</button>
        </div>
      </div>
    </>
  );
}

export default ReportForm;
