// Lấy các phần tử DOM
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const passwordResult = document.getElementById("passwordResult");
const lengthEl = document.getElementById("length");
const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numbersEl = document.getElementById("numbers");
const symbolsEl = document.getElementById("symbols");

// Tập hợp các ký tự
const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
const numberChars = "0123456789";
const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

// --- HÀM MỚI: TẠO HIỆU ỨNG PHÁO HOA ---
function showFirework() {
  // confetti() là hàm toàn cục từ thư viện chúng ta đã thêm
  confetti({
    particleCount: 100, // Số lượng particle
    spread: 70, // Độ lan rộng
    origin: { y: 0.6 }, // Vị trí bắt đầu (0.6 là từ gần giữa dưới lên)
  });
}

// --- HÀM MỚI: TẠO HIỆU ỨNG SAO RƠI (cho nút Copy) ---
function showStarBurst() {
  confetti({
    particleCount: 50,
    angle: 90, // Bắn thẳng lên
    spread: 55,
    origin: { x: 0.5, y: 0.8 }, // Bắt đầu từ dưới cùng, giữa màn hình
    colors: ["#bb0000", "#ffffff"], // Màu đỏ và trắng
  });
}

// Hàm lưu các tùy chọn
function saveOptions() {
  const options = {
    length: lengthEl.value,
    uppercase: uppercaseEl.checked,
    lowercase: lowercaseEl.checked,
    numbers: numbersEl.checked,
    symbols: symbolsEl.checked,
  };
  chrome.storage.local.set({ passwordGeneratorOptions: options }, () => {
    console.log("Options saved");
  });
}

// Hàm tải các tùy chọn đã lưu
function loadOptions() {
  chrome.storage.local.get(["passwordGeneratorOptions"], (result) => {
    if (result.passwordGeneratorOptions) {
      const options = result.passwordGeneratorOptions;
      lengthEl.value = options.length;
      uppercaseEl.checked = options.uppercase;
      lowercaseEl.checked = options.lowercase;
      numbersEl.checked = options.numbers;
      symbolsEl.checked = options.symbols;
    }
    generatePassword();
  });
}

// Hàm tạo mật khẩu
function generatePassword() {
  let length = lengthEl.value;
  let allowedChars = "";
  let password = "";

  if (uppercaseEl.checked) {
    allowedChars += upperCaseChars;
  }
  if (lowercaseEl.checked) {
    allowedChars += lowerCaseChars;
  }
  if (numbersEl.checked) {
    allowedChars += numberChars;
  }
  if (symbolsEl.checked) {
    allowedChars += symbolChars;
  }

  if (allowedChars.length === 0) {
    alert("Vui lòng chọn ít nhất một loại ký tự!");
    return;
  }

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allowedChars.length);
    password += allowedChars[randomIndex];
  }

  passwordResult.value = password;
}

// Hàm sao chép mật khẩu
async function copyPassword() {
  if (!passwordResult.value) {
    alert("Không có mật khẩu để sao chép!");
    return;
  }

  try {
    await navigator.clipboard.writeText(passwordResult.value);
    copyBtn.textContent = "Copied!";
    // GỌI HIỆU ỨNG SAO RƠI KHI SAO CHÉP THÀNH CÔNG
    showStarBurst();
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 2000);
  } catch (err) {
    console.error("Failed to copy password: ", err);
    alert("Không thể sao chép mật khẩu.");
  }
}

// --- CẬP NHẬT EVENT LISTENERS ---

// Gán sự kiện cho nút "Generate"
generateBtn.addEventListener("click", () => {
  generatePassword();
  saveOptions();
  // GỌI HIỆU ỨNG PHÁO HOA KHI TẠO MẬT KHẨU
  showFirework();
});

// Gán sự kiện cho nút "Copy"
copyBtn.addEventListener("click", copyPassword);

// Tải các tùy chọn khi popup mở
document.addEventListener("DOMContentLoaded", loadOptions);

// Lưu tùy chọn khi có thay đổi
[lengthEl, uppercaseEl, lowercaseEl, numbersEl, symbolsEl].forEach(
  (element) => {
    element.addEventListener("change", saveOptions);
  },
);
