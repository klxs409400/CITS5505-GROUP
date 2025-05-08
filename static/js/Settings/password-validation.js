// Password update form validation

document.addEventListener('DOMContentLoaded', function() {
    // Get form and input elements
    const passwordForm = document.getElementById('passwordForm');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    // Error message elements
    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Function to show alert messages
    function showAlert(message, type = 'success') {
        const alertEl = document.getElementById('demo-alert');
        const alertMessage = document.getElementById('alert-message');
        
        if(alertEl && alertMessage) {
            alertEl.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning');
            alertEl.classList.add(`alert-${type}`);
            alertMessage.textContent = message;
            alertEl.classList.add('show');
            
            // Auto hide after 3 seconds
            setTimeout(() => {
                alertEl.classList.add('d-none');
            }, 3000);
        }
    }

    // Validate current password
    function validateCurrentPassword() {
        const value = currentPassword.value.trim();
        
        if (value === "") {
            currentPasswordError.textContent = "Please enter your current password";
            return false;
        } else {
            currentPasswordError.textContent = "";
            return true;
        }
    }

    // Validate new password - simplified requirements
    function validateNewPassword() {
        const value = newPassword.value;
        
        if (value === "") {
            newPasswordError.textContent = "Please enter a new password";
            return false;
        } else if (value.length < 1) {
            newPasswordError.textContent = "Password cannot be empty";
            return false;
        } else {
            newPasswordError.textContent = "";
            return true;
        }
    }

    // Validate password confirmation
    function validateConfirmPassword() {
        const newPasswordValue = newPassword.value;
        const confirmValue = confirmPassword.value;
        
        if (confirmValue === "") {
            confirmPasswordError.textContent = "Please confirm your new password";
            return false;
        } else if (confirmValue !== newPasswordValue) {
            confirmPasswordError.textContent = "Passwords do not match";
            return false;
        } else {
            confirmPasswordError.textContent = "";
            return true;
        }
    }

    // Add real-time validation
    if(currentPassword) {
        currentPassword.addEventListener('blur', validateCurrentPassword);
    }
    
    if(newPassword) {
        newPassword.addEventListener('blur', validateNewPassword);
    }
    
    if(confirmPassword) {
        confirmPassword.addEventListener('blur', validateConfirmPassword);
    }

    // Validate on form submission
    if(passwordForm) {
        passwordForm.addEventListener('submit', function(event) {
            const isCurrentPasswordValid = validateCurrentPassword();
            const isNewPasswordValid = validateNewPassword();
            const isConfirmPasswordValid = validateConfirmPassword();
            
            // If any validation fails, prevent form submission
            if (!isCurrentPasswordValid || !isNewPasswordValid || !isConfirmPasswordValid) {
                event.preventDefault();
                showAlert('Please correct the form errors', 'danger');
            }
        });
    }
});