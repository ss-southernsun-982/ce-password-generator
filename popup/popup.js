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

  // Kiểm tra xem người dùng đã chọn ít nhất một tùy chọn chưa
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
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 2000);
  } catch (err) {
    console.error("Failed to copy password: ", err);
    alert("Không thể sao chép mật khẩu.");
  }
}

// Gán sự kiện cho các nút
generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);

// Tự động tạo mật khẩu khi popup được mở
document.addEventListener("DOMContentLoaded", generatePassword);
