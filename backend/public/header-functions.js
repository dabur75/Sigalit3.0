// ========== AUTH & HEADER FUNCTIONS ==========
// בדיקת הרשאות - אם המשתמש לא מחובר, העבר לדף התחברות
var role = localStorage.getItem('role');
if (!role) {
    window.location.href = "login.html";
}

// פונקציה להצגת שם המשתמש והתפקיד
function renderHeaderUser(retryCount = 0) {
    console.log('renderHeaderUser called, retry count:', retryCount);
    var userSpan = document.getElementById("header-user");
    var roleSpan = document.getElementById("header-role");
    var schedulerLink = document.getElementById("scheduler-link");
    var guideName = localStorage.getItem("name") || "";
    var role = localStorage.getItem("role");
    
    console.log('userSpan:', userSpan);
    console.log('roleSpan:', roleSpan);
    console.log('schedulerLink:', schedulerLink);
    console.log('guideName:', guideName);
    console.log('role:', role);

    // אם האלמנטים לא קיימים, נסה שוב אחרי זמן קצר (עד 10 ניסיונות)
    if ((!userSpan || !roleSpan) && retryCount < 10) {
      console.log('Elements not found, retrying... (attempt ' + (retryCount + 1) + ')');
      setTimeout(() => {
        renderHeaderUser(retryCount + 1);
      }, 200);
      return;
    }

    if (userSpan) {
      userSpan.textContent = guideName ? guideName : (role === "רכז" ? "רכז/רכזת" : "מדריך/ה");
      console.log('Set userSpan text to:', userSpan.textContent);
    }
    if (roleSpan) {
      if (role === "רכז" || role === "רכזת") {
        roleSpan.textContent = (role === "רכזת" ? "רכזת" : "רכז");
      } else if (role === "מדריך" || role === "מדריכה") {
        roleSpan.textContent = (role === "מדריכה" ? "מדריכה" : "מדריך");
      } else {
        roleSpan.textContent = "";
      }
      console.log('Set roleSpan text to:', roleSpan.textContent);
    }
    
    // הצג/הסתר כפתור שיבוץ לפי התפקיד
    if (schedulerLink) {
      schedulerLink.style.display = (role === "רכז" || role === "רכזת") ? "inline-block" : "none";
      console.log('Scheduler link display set to:', schedulerLink.style.display);
    }
    
    // הצג/הסתר כפתור דוחות לפי התפקיד
    var reportsLink = document.getElementById("reports-link");
    if (reportsLink) {
      reportsLink.style.display = (role === "רכז" || role === "רכזת") ? "inline-block" : "none";
      console.log('Reports link display set to:', reportsLink.style.display);
    }
}



// פונקציית התנתקות
window.logout = function() {
  localStorage.clear();
  window.location.href = "login.html";
};

// הפעלת הפונקציה כשהדף נטען
document.addEventListener("DOMContentLoaded", function() {
    renderHeaderUser();
});

// הפעלת הפונקציה גם אם הדף כבר נטען
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHeaderUser);
} else {
    renderHeaderUser();
} 

// =========================
// API base + fetch helpers
// =========================
// Centralized API base and a thin fetch wrapper. This does not change existing
// behavior yet; pages will be incrementally migrated to use these helpers.
(() => {
  const isDevStaticServer = window.location && window.location.port === '8080';

  if (!('API_BASE_URL' in window)) {
    const baseUrl = isDevStaticServer ? 'http://localhost:4000' : '';
    Object.defineProperty(window, 'API_BASE_URL', {
      value: baseUrl,
      writable: false,
      configurable: true,
      enumerable: true
    });
  }

  if (!('apiFetch' in window)) {
    window.apiFetch = async function apiFetch(path, options = {}) {
      const pathString = String(path || '');
      const isAbsoluteUrl = /^https?:\/\//i.test(pathString);
      const url = isAbsoluteUrl ? pathString : `${window.API_BASE_URL}${pathString}`;

      const defaultOptions = {
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...(options && options.headers ? options.headers : {})
        }
      };

      return fetch(url, mergedOptions);
    };
  }
})();
