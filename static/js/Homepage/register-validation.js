document.addEventListener("DOMContentLoaded", function () {
  // Get form and input elements
  const registerForm = document.getElementById("registerForm");
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");

  // Error message elements
  const usernameError = document.getElementById("usernameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  // Style error messages to be more visible
  const allErrorElements = [usernameError, emailError, passwordError, confirmPasswordError];
  allErrorElements.forEach(elem => {
    if (elem) {
      elem.style.color = "red";
      elem.style.display = "block";
      elem.style.marginTop = "5px";
      elem.style.fontWeight = "bold";
    }
  });

  // Validate username
  function validateUsername() {
    const value = username.value.trim();

    if (value === "") {
      usernameError.textContent = "Username cannot be empty";
      return false;
    } else if (value.length < 3) {
      usernameError.textContent = "Username must be at least 3 characters";
      return false;
    } else if (value.length > 20) {
      usernameError.textContent = "Username cannot exceed 20 characters";
      return false;
    } else {
      usernameError.textContent = "";
      return true;
    }
  }

  // Validate email
  function validateEmail() {
    const value = email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "") {
      emailError.textContent = "Email cannot be empty";
      return false;
    } else if (!emailRegex.test(value)) {
      emailError.textContent = "Please enter a valid email address";
      return false;
    } else {
      emailError.textContent = "";
      return true;
    }
  }

  // Validate password - simplified to only check length
  function validatePassword() {
    const value = password.value;

    if (value === "") {
      passwordError.textContent = "Password cannot be empty";
      return false;
    } else if (value.length < 8) {
      passwordError.textContent = "Password must be at least 8 characters";
      return false;
    } else if (!/[A-Z]/.test(value)) {
      passwordError.textContent = "Password must contain at least one uppercase letter";
      return false;
    } else if (!/[a-z]/.test(value)) {
      passwordError.textContent = "Password must contain at least one lowercase letter";
      return false;
    } else if (!/\d/.test(value)) {
      passwordError.textContent = "Password must contain at least one digit";
      return false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      passwordError.textContent = "Password must contain at least one special character";
      return false;
    } else {
      passwordError.textContent = "";
      return true;
    }
  }

  // Validate confirm password
  function validateConfirmPassword() {
    const passwordValue = password.value;
    const confirmValue = confirmPassword.value;

    if (confirmValue === "") {
      confirmPasswordError.textContent = "Please confirm your password";
      return false;
    } else if (confirmValue !== passwordValue) {
      confirmPasswordError.textContent = "Passwords do not match";
      return false;
    } else {
      confirmPasswordError.textContent = "";
      return true;
    }
  }

  // Add real-time validation
  username.addEventListener("input", validateUsername);
  email.addEventListener("input", validateEmail);
  password.addEventListener("input", validatePassword);
  confirmPassword.addEventListener("input", validateConfirmPassword);

  // Validate all fields on form submit
  registerForm.addEventListener("submit", function (event) {
    const isUsernameValid = validateUsername();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    console.log("Form validation:", { 
      isUsernameValid, 
      isEmailValid, 
      isPasswordValid, 
      isConfirmPasswordValid 
    });

    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      event.preventDefault();
      console.log("Form submission prevented due to validation errors");
      
      // Make sure the first error is visible to the user
      if (!isUsernameValid) username.focus();
      else if (!isEmailValid) email.focus();
      else if (!isPasswordValid) password.focus();
      else confirmPassword.focus();
    }
  });
});
