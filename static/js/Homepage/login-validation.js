document.addEventListener("DOMContentLoaded", function () {
  // Get the form and input elements
  const loginForm = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  // Error message elements
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  // Validate email
  function validateEmail() {
    const value = email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "") {
      emailError.textContent = "Please enter your email";
      return false;
    } else if (!emailRegex.test(value)) {
      emailError.textContent = "Please enter a valid email address";
      return false;
    } else {
      emailError.textContent = "";
      return true;
    }
  }

  // Validate password
  function validatePassword() {
    const value = password.value;

    if (value === "") {
      passwordError.textContent = "Please enter your password";
      return false;
    } else {
      passwordError.textContent = "";
      return true;
    }
  }

  // Add real-time validation
  email.addEventListener("blur", validateEmail);
  password.addEventListener("blur", validatePassword);

  // Validate on form submit
  loginForm.addEventListener("submit", function (event) {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    // If any validation fails, prevent form submission
    if (!isEmailValid || !isPasswordValid) {
      event.preventDefault();
    }
  });
});
