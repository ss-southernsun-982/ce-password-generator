/* ============================================
   PASSWORD GENERATOR PRO - ENHANCED VERSION
   Features:
   - Cryptographically secure random generation
   - NEW: Dynamic Security Rating UI
   - Advanced options (exclude similar, no duplicates)
   - Modern UI integration with visual feedback
   ============================================ */

// ===== DOM ELEMENTS =====
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const refreshBtn = document.getElementById("refreshBtn");
const passwordResult = document.getElementById("passwordResult");
const lengthEl = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");
const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numbersEl = document.getElementById("numbers");
const symbolsEl = document.getElementById("symbols");
const excludeSimilarEl = document.getElementById("excludeSimilar");
const excludeDuplicatesEl = document.getElementById("excludeDuplicates");

// ===== CHARACTER SETS =====
const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

// Characters that are easily confused (similar looking)
const SIMILAR_CHARS = "0Oo1lI|";
const SIMILAR_CHARS_REGEX = new RegExp(`[${SIMILAR_CHARS}]`, "g");

// ===== CRYPTO-SECURE RANDOM FUNCTIONS =====
/**
 * Generate cryptographically secure random integer between min (inclusive) and max (inclusive)
 */
function getCryptoRandomInt(min, max) {
  const range = max - min + 1;
  const maxValidRange = 2 ** 32 - 1;

  if (range > maxValidRange) {
    return Math.floor(Math.random() * range) + min;
  }

  const randomArray = new Uint32Array(1);
  window.crypto.getRandomValues(randomArray);
  return min + (randomArray[0] % range);
}

/**
 * Shuffle an array using Fisher-Yates algorithm with crypto randomness
 */
function cryptoShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getCryptoRandomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ===== PASSWORD GENERATION =====
/**
 * Generate a password based on current options
 */
function generatePassword() {
  const length = parseInt(lengthEl.value, 10);
  const options = {
    uppercase: uppercaseEl.checked,
    lowercase: lowercaseEl.checked,
    numbers: numbersEl.checked,
    symbols: symbolsEl.checked,
    excludeSimilar: excludeSimilarEl.checked,
    excludeDuplicates: excludeDuplicatesEl.checked,
  };

  const selectedTypes = Object.keys(CHAR_SETS).filter((type) => options[type]);
  if (selectedTypes.length === 0) {
    showNotification("Vui lòng chọn ít nhất một loại ký tự!", "error");
    return "";
  }

  let charPool = "";
  selectedTypes.forEach((type) => {
    let chars = CHAR_SETS[type];
    if (options.excludeSimilar) {
      chars = chars.replace(SIMILAR_CHARS_REGEX, "");
    }
    charPool += chars;
  });

  if (options.excludeDuplicates) {
    charPool = [...new Set(charPool)].join("");
  }

  if (charPool.length < length) {
    showNotification(
      `Không đủ ký tự duy nhất để tạo mật khẩu ${length} ký tự. Vui lòng chọn nhiều loại ký tự hơn hoặc bỏ chọn "Không trùng ký tự".`,
      "error",
    );
    return "";
  }

  let password = "";
  if (options.excludeDuplicates) {
    const shuffledPool = cryptoShuffle([...charPool]);
    password = shuffledPool.slice(0, length).join("");
  } else {
    for (let i = 0; i < length; i++) {
      const randomIndex = getCryptoRandomInt(0, charPool.length - 1);
      password += charPool[randomIndex];
    }
  }

  return password;
}

// ===== NEW SECURITY RATING LOGIC =====

/**
 * Calculates the security score of a password.
 * @param {string} password - The password to evaluate.
 * @returns {object} An object containing the score (0-100) and feedback.
 */
function calculateSecurityScore(password) {
  if (!password) return { score: 0, feedback: "No password" };

  let score = 0;
  const length = password.length;

  // 1. Length Scoring (max 40 points)
  if (length >= 8) score += 10;
  if (length >= 12) score += 10;
  if (length >= 16) score += 10;
  if (length >= 20) score += 10;

  // 2. Character Variety Scoring (max 40 points)
  if (/[a-z]/.test(password)) score += 10; // Lowercase
  if (/[A-Z]/.test(password)) score += 10; // Uppercase
  if (/[0-9]/.test(password)) score += 10; // Numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 10; // Symbols

  // 3. Bonus/Penalty (max 20 points)
  if (length > 16) score += 10; // Bonus for very long passwords
  if (/(.)\1{2,}/.test(password)) score -= 10; // Penalty for repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 10; // Penalty for sequential characters

  score = Math.max(0, Math.min(100, score));

  // 4. Determine feedback based on score
  let feedback, ratingClass, icon;
  if (score < 20) {
    feedback = "Weak";
    ratingClass = "rating-weak";
    icon = "gpp_bad";
  } else if (score < 40) {
    feedback = "Fair";
    ratingClass = "rating-fair";
    icon = "gpp_maybe";
  } else if (score < 60) {
    feedback = "Good";
    ratingClass = "rating-good";
    icon = "gpp_good";
  } else if (score < 80) {
    feedback = "Strong";
    ratingClass = "rating-strong";
    icon = "gpp_good";
  } else {
    feedback = "Very Strong";
    ratingClass = "rating-very-strong";
    icon = "verified_user";
  }

  return { score, feedback, ratingClass, icon };
}

/**
 * Updates the security rating UI based on a password.
 * @param {string} password - The password to rate.
 */
/**
 * Updates the security rating UI with progress bars based on a password.
 * @param {string} password - The password to rate.
 */
function updateSecurityRating(password) {
  const ratingTextElement = document.getElementById("ratingText");
  const barsContainer = document.getElementById("ratingBars");

  if (!ratingTextElement || !barsContainer) return;

  // Get the progress bars
  const bars = barsContainer.querySelectorAll(".bar");

  // 1. Calculate score and feedback
  const { score, feedback, ratingClass } = calculateSecurityScore(password);

  // 2. Update rating text
  ratingTextElement.className = `font-body text-sm font-bold tracking-tight ${ratingClass}`;
  ratingTextElement.textContent = feedback;

  // 3. Update progress bar colors
  // First, remove all color classes and add the default gray
  bars.forEach((bar) => {
    bar.className =
      "bar flex-1 bg-surface-container-highest rounded-full transition-all duration-300";
  });

  // Determine how many bars to fill based on score
  const numBarsToFill = Math.ceil(score / 25);

  // Map rating classes to Tailwind background colors
  const colorMap = {
    "rating-weak": "bg-red-500",
    "rating-fair": "bg-amber-500",
    "rating-good": "bg-lime-500",
    "rating-strong": "bg-green-500",
    "rating-very-strong": "bg-emerald-500",
  };

  // Get the appropriate color class
  const barColorClass = colorMap[ratingClass] || "bg-surface-container-highest";

  // Apply color to the filled bars
  for (let i = 0; i < numBarsToFill; i++) {
    if (bars[i]) {
      // Remove the default gray and add the color
      bars[i].classList.remove("bg-surface-container-highest");
      bars[i].classList.add(barColorClass);
      // Add scale effect for filled bars
      bars[i].style.transform = "scaleY(1.2)";
    }
  }

  // Reset transform for unfilled bars
  for (let i = numBarsToFill; i < bars.length; i++) {
    if (bars[i]) {
      bars[i].style.transform = "scaleY(1)";
    }
  }
}

// ===== UI UPDATES & NOTIFICATIONS =====
/**
 * Show a temporary notification
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "error" ? "var(--md-sys-color-error)" : "var(--md-sys-color-primary)"};
    color: var(--md-sys-color-on-primary);
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
    font-size: 14px;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(20px)";
    notification.style.transition = "opacity 0.3s, transform 0.3s";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ===== CONFETTI EFFECTS =====
/**
 * Show confetti effect for password generation
 */
function showGenerationConfetti() {
  if (typeof confetti !== "function") return;
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#4361ee", "#7209b7", "#3a56d4", "#2ecc71"],
  });
}

/**
 * Show confetti effect for copy action
 */
function showCopyConfetti() {
  if (typeof confetti !== "function") return;
  confetti({
    particleCount: 60,
    angle: 90,
    spread: 55,
    origin: { x: 0.5, y: 0.8 },
    colors: ["#4361ee", "#2ecc71", "#f39c12"],
  });
}

// ===== STORAGE MANAGEMENT =====
/**
 * Save current options to chrome.storage
 */
function saveOptions() {
  const options = {
    length: lengthEl.value,
    uppercase: uppercaseEl.checked,
    lowercase: lowercaseEl.checked,
    numbers: numbersEl.checked,
    symbols: symbolsEl.checked,
    excludeSimilar: excludeSimilarEl.checked,
    excludeDuplicates: excludeDuplicatesEl.checked,
  };
  chrome.storage.local.set({ passwordGeneratorOptions: options });
}

/**
 * Load saved options from chrome.storage
 */
function loadOptions() {
  chrome.storage.local.get(["passwordGeneratorOptions"], (result) => {
    if (result.passwordGeneratorOptions) {
      const options = result.passwordGeneratorOptions;
      lengthEl.value = options.length;
      lengthValue.textContent = options.length;
      uppercaseEl.checked = options.uppercase;
      lowercaseEl.checked = options.lowercase;
      numbersEl.checked = options.numbers;
      symbolsEl.checked = options.symbols;
      excludeSimilarEl.checked = options.excludeSimilar || false;
      excludeDuplicatesEl.checked = options.excludeDuplicates || false;
    }
    // Generate initial password after loading options
    generateAndDisplayPassword();
  });
}

// ===== MAIN PASSWORD GENERATION FLOW =====
/**
 * Generate and display password, then update the security rating.
 */
function generateAndDisplayPassword() {
  const password = generatePassword();
  if (password) {
    passwordResult.value = password;
    // *** GỌI HÀM MỚI ĐỂ CẬP NHẬT GIAO DIỆN ***
    updateSecurityRating(password);
    showGenerationConfetti();
    saveOptions();
  }
}

/**
 * Copy password to clipboard with visual feedback
 */
async function copyPasswordToClipboard() {
  const password = passwordResult.value;
  if (!password || password === "Nhấn Generate để tạo mật khẩu") {
    showNotification("Không có mật khẩu để sao chép!", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(password);

    const copyIcon = document.getElementById("copyIcon");

    // 1. Thay đổi icon thành "check"
    copyIcon.textContent = "check";

    // 2. Thay đổi màu sắc của nút để nhấn mạnh
    copyBtn.style.backgroundColor = "var(--md-sys-color-primary)";
    copyBtn.style.color = "var(--md-sys-color-on-primary)";

    // 3. Đặt timer để trả lại trạng thái ban đầu sau 2 giây
    setTimeout(() => {
      copyIcon.textContent = "content_copy";
      copyBtn.style.backgroundColor = ""; // Xóa style inline
      copyBtn.style.color = ""; // Xóa style inline
    }, 2000);

    showCopyConfetti();
    showNotification("Đã sao chép mật khẩu!", "success"); // Thêm thông báo thành công
  } catch (err) {
    console.error("Failed to copy password:", err);
    showNotification("Không thể sao chép mật khẩu.", "error");
  }
}

// ===== EVENT LISTENERS & INITIALIZATION =====
/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  generateBtn.addEventListener("click", generateAndDisplayPassword);
  copyBtn.addEventListener("click", copyPasswordToClipboard);
  refreshBtn.addEventListener("click", generateAndDisplayPassword);

  lengthEl.addEventListener("input", () => {
    lengthValue.textContent = lengthEl.value;
    generateAndDisplayPassword(); // Tạo lại khi kéo
  });

  const optionElements = [
    uppercaseEl,
    lowercaseEl,
    numbersEl,
    symbolsEl,
    excludeSimilarEl,
    excludeDuplicatesEl,
  ];

  optionElements.forEach((element) => {
    element.addEventListener("change", () => {
      generateAndDisplayPassword(); // Tạo lại khi thay đổi tùy chọn
      saveOptions();
    });
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      generateAndDisplayPassword();
    }
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key === "c" &&
      document.activeElement === passwordResult
    ) {
      copyPasswordToClipboard();
    }
  });

  // Select all text when clicking the password field
  passwordResult.addEventListener("click", function () {
    this.select();
  });
}

// ===== INITIALIZATION =====
/**
 * Initialize the application
 */
function init() {
  initializeEventListeners();
  loadOptions();

  // Add CSS for notifications if not already present
  if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Start the application when DOM is ready
document.addEventListener("DOMContentLoaded", init);
