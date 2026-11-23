/**
 * Futureitschool - Landing Page & Telegram Bot Integratsiyasi
 * Faqat toza JavaScript (Vanilla JS) yordamida yozilgan.
 */

// ========================================================
// 1. TELEGRAM BOT SOZLAMALARI (O'ZINGIZNING MA'LUMOTLARINGIZNI QO'YING)
// ========================================================
// 1) Telegram'da @BotFather ga kiring va /newbot buyrug'i orqali yangi bot yarating.
// 2) Olingan HTTP API Token'ni quyidagi BOT_TOKEN ga qo'ying.
// 3) Botingizni o'zingizning kanalingizga ADMIN qilib qo'shing.
// 4) Kanalingiz ID sini (masalan: -1001234567890 yoki ochiq kanal bo'lsa @kanal_username) CHAT_ID ga yozing.
const TELEGRAM_CONFIG = {
  BOT_TOKEN: "9067753692:AAFda7aXXbfs4QOPbd5GdU0WwTYbTxKW9no",
  CHAT_ID: "-1004400912360"
};

// ========================================================
// 2. DOM ELEMENTLARI
// ========================================================
// Modal elementlari
const registerModal = document.getElementById("registerModal");
const openModalBtn = document.getElementById("openModalBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalOverlay = document.getElementById("modalOverlay");
const courseButtons = document.querySelectorAll(".open-reg-modal");
const modalCourseSelect = document.getElementById("modalCourse");

// Formalar
const modalRegisterForm = document.getElementById("modalRegisterForm");
const inlineRegisterForm = document.getElementById("inlineRegisterForm");

// Mobil Menyu
const navToggle = document.getElementById("navToggle") || document.getElementById("nav-toggle");
const navMenu = document.getElementById("navMenu") || document.getElementById("nav-menu");

// Toast bildirishnoma
const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastText = document.getElementById("toastText");

// ========================================================
// 3. MOBIL MENYU BOSHQARUVI
// ========================================================
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });

  // Menyu linklari bosilganda mobil menyuni yopish
  document.querySelectorAll(".nav__link").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
    });
  });
}

// ========================================================
// 4. REGISTRATSIYA MODAL OYNASI FUNKSIYALARI
// ========================================================
function openModal(defaultCourseName = null) {
  if (defaultCourseName && modalCourseSelect) {
    // Agar tanlangan kurs select variantlarida bo'lsa, uni tanlaymiz
    let exists = false;
    for (let i = 0; i < modalCourseSelect.options.length; i++) {
      if (modalCourseSelect.options[i].value === defaultCourseName) {
        modalCourseSelect.selectedIndex = i;
        exists = true;
        break;
      }
    }
    if (!exists && modalCourseSelect.options.length > 0) {
      modalCourseSelect.value = defaultCourseName;
    }
  }
  registerModal.classList.add("active");
  document.body.style.overflow = "hidden"; // Orqa fonni aylanishini to'xtatish
}

function closeModal() {
  registerModal.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Headerdagi "Ro'yxatdan o'tish" tugmasi
if (openModalBtn) {
  openModalBtn.addEventListener("click", () => openModal("Umumiy maslahat"));
}

// Kurs kartochkalaridagi "Yozilish" tugmalari
courseButtons.forEach(button => {
  button.addEventListener("click", (e) => {
    const courseName = e.target.getAttribute("data-course") || "Umumiy maslahat";
    openModal(courseName);
  });
});

// Modalni yopish (X tugmasi va overlay)
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

// Escape tugmasi bosilganda modalni yopish
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && registerModal.classList.contains("active")) {
    closeModal();
  }
});

// ========================================================
// 5. TOAST (BILDIRISHNOMA) KO'RSATISH
// ========================================================
let toastTimeout;
function showToast(message, type = "success") {
  clearTimeout(toastTimeout);

  toast.className = "toast show " + (type === "success" ? "success" : "error");
  toastIcon.textContent = type === "success" ? "✅" : "⚠️";
  toastText.textContent = message;

  toastTimeout = setTimeout(() => {
    toast.className = "toast";
  }, 4500);
}

// ========================================================
// 6. TELEGRAM KANALGA XABAR YUBORISH
// ========================================================
async function sendToTelegramChannel(data) {
  const { name, phone, course, message } = data;

  // Agar token yoki chat_id hali kiritilmagan bo'lsa
  if (
    TELEGRAM_CONFIG.BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN_HERE" ||
    TELEGRAM_CONFIG.CHAT_ID === "YOUR_TELEGRAM_CHANNEL_OR_CHAT_ID"
  ) {
    console.warn("DIQQAT: Telegram bot tokeni yoki kanal ID si hali sozlanmagan! script.js faylida TELEGRAM_CONFIG ni to'ldiring.");
    return {
      success: false,
      isConfigMissing: true,
      error: "Telegram Bot Token yoki Kanal ID si sozlanmagan. script.js fayliga tokeningizni kiriting."
    };
  }

  // Hozirgi vaqt
  const now = new Date();
  const timeString = now.toLocaleString("uz-UZ", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Telegram uchun chiroyli HTML formatidagi xabar matni
  const text = `
🔥 <b>Yangi ariza kelib tushdi!</b>

🏢 <b>O'quv markaz:</b> Futureitschool
👤 <b>F.I.SH:</b> ${escapeHTML(name)}
📞 <b>Telefon:</b> <code>${escapeHTML(phone)}</code>
💻 <b>Tanlangan kurs:</b> ${escapeHTML(course)}
📝 <b>Qo'shimcha izoh:</b> ${message ? escapeHTML(message) : "<i>(Izoh qoldirilmadi)</i>"}
⏰ <b>Vaqt:</b> ${timeString}
  `.trim();

  const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text: text,
        parse_mode: "HTML"
      })
    });

    const result = await response.json();

    if (result.ok) {
      return { success: true };
    } else {
      console.error("Telegram API xatosi:", result);
      return { success: false, error: result.description || "Xatolik yuz berdi" };
    }
  } catch (error) {
    console.error("Tarmoq xatosi:", error);
    return { success: false, error: "Internet yoki tarmoq xatosi!" };
  }
}

// Xavfsizlik uchun maxsus belgilarni tozalash (HTML inyeksiya oldini olish)
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ========================================================
// 7. FORMA YUBORILISHINI ISHLASH VA BOSHQARISH
// ========================================================
function handleFormSubmit(form, submitBtn) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btnText = submitBtn.querySelector(".btn-text");
    const btnSpinner = submitBtn.querySelector(".btn-spinner");

    // Forma ma'lumotlarini olish
    const formData = new FormData(form);
    const data = {
      name: formData.get("name")?.trim(),
      phone: formData.get("phone")?.trim(),
      course: formData.get("course") || "Noma'lum",
      message: formData.get("message")?.trim() || ""
    };

    // Oddiy validatsiya
    if (!data.name || !data.phone) {
      showToast("Iltimos, ism va telefon raqamingizni kiriting!", "error");
      return;
    }

    // Tugmani yuklanish (loading) holatiga o'tkazish
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = "Yuborilmoqda...";
    if (btnSpinner) btnSpinner.style.display = "inline-block";

    // Telegramga yuborish
    const res = await sendToTelegramChannel(data);

    // Tugmani asl holatiga qaytarish
    submitBtn.disabled = false;
    if (btnText) btnText.textContent = form.id === "modalRegisterForm" ? "Ro'yxatdan o'tish" : "Yuborish";
    if (btnSpinner) btnSpinner.style.display = "none";

    if (res.success) {
      showToast("Rahmat! Arizangiz qabul qilindi. Tez orada bog'lanamiz.", "success");
      form.reset();

      // Agar modal ichidagi forma bo'lsa, 1.5 soniyadan keyin modalni yopamiz
      if (form.id === "modalRegisterForm") {
        setTimeout(() => {
          closeModal();
        }, 1200);
      }
    } else {
      if (res.isConfigMissing) {
        showToast("Eslatma: script.js faylida Bot Token va Kanal ID sini sozlang!", "error");
      } else {
        showToast("Xatolik: " + (res.error || "Xabar yuborilmadi"), "error");
      }
    }
  });
}

// Modal forma va sahifadagi formani faollashtirish
if (modalRegisterForm) {
  const modalBtn = document.getElementById("modalSubmitBtn");
  handleFormSubmit(modalRegisterForm, modalBtn);
}

if (inlineRegisterForm) {
  const inlineBtn = document.getElementById("inlineSubmitBtn");
  handleFormSubmit(inlineRegisterForm, inlineBtn);
}
