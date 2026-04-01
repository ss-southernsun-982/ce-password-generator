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

// --- HÀM MỚI: Lưu các tùy chọn ---
function saveOptions() {
  const options = {
    length: lengthEl.value,
    uppercase: uppercaseEl.checked,
    lowercase: lowercaseEl.checked,
    numbers: numbersEl.checked,
    symbols: symbolsEl.checked,
  };
  // Sử dụng chrome.storage.local để lưu dữ liệu
  chrome.storage.local.set({ passwordGeneratorOptions: options }, () => {
    console.log("Options saved");
  });
}

// --- HÀM MỚI: Tải các tùy chọn đã lưu ---
function loadOptions() {
  // Lấy dữ liệu từ chrome.storage.local
  chrome.storage.local.get(["passwordGeneratorOptions"], (result) => {
    if (result.passwordGeneratorOptions) {
      const options = result.passwordGeneratorOptions;
      lengthEl.value = options.length;
      uppercaseEl.checked = options.uppercase;
      lowercaseEl.checked = options.lowercase;
      numbersEl.checked = options.numbers;
      symbolsEl.checked = options.symbols;
    }
    // Sau khi đã tải xong các tùy chọn, tạo mật khẩu đầu tiên
    generatePassword();
  });
}

// Hàm tạo mật khẩu (không thay đổi)
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

// Hàm sao chép mật khẩu (không thay đổi)
async function copyPassword() {
  if (!passwordResult.value) {
    alert("Không có mật khẩu để sao chép!");
    return;
  }

  try {
    await navigator.clipboard.writeText(passwordResult.value);
    copyBtn.textContent = "Copied!";
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
  // Mỗi khi tạo mật khẩu mới, cũng lưu lại các tùy chọn hiện tại
  saveOptions();
});

// Gán sự kiện cho nút "Copy"
copyBtn.addEventListener("click", copyPassword);

// --- THAY ĐỔI QUAN TRỌNG ---
// Thay vì gọi generatePassword() trực tiếp, chúng ta gọi loadOptions()
// loadOptions() sẽ tải các cài đặt đã lưu, sau đó mới gọi generatePassword()
document.addEventListener("DOMContentLoaded", loadOptions);

// Thêm sự kiện 'change' cho tất cả các ô tùy chọn để lưu ngay lập tức
[lengthEl, uppercaseEl, lowercaseEl, numbersEl, symbolsEl].forEach(
  (element) => {
    element.addEventListener("change", saveOptions);
  },
);
