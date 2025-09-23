document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    const termsCheckbox = document.getElementById('terms');
    const dateOfBirthInput = document.getElementById('dateOfBirth');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');

    const modal = document.getElementById('policyModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.close-modal');

    // Initialize date picker
    flatpickr(dateOfBirthInput, {
        dateFormat: "Y-m-d", // Định dạng phù hợp với backend
        locale: "vn",
        maxDate: "today",
        defaultDate: "2000-01-01"
    });

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Check password strength
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        updateStrengthIndicator(strength);
    });

    // Image preview
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                showError('image-error', 'Ảnh không được vượt quá 5MB');
                this.value = '';
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                showError('image-error', 'Chỉ chấp nhận ảnh JPEG, PNG hoặc GIF');
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                imagePreview.style.display = 'block';
                hideError('image-error');
            }
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
        }
    });

    // Form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show loading state
        submitText.textContent = 'Đang xử lý...';
        submitSpinner.style.display = 'block';
        submitBtn.disabled = true;

        try {
            // Prepare FormData
            const formData = new FormData();
            formData.append('username', document.getElementById('username').value.trim());
            formData.append('password', passwordInput.value);
            formData.append('fullName', document.getElementById('fullName').value.trim());
            formData.append('dateOfBirth', dateOfBirthInput.value);
            formData.append('email', document.getElementById('email').value.trim());
            formData.append('phone', document.getElementById('phone').value.trim());
            formData.append('address', document.getElementById('address').value.trim());
            formData.append('description', document.getElementById('description').value.trim());

            if (imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }

            // Send request to backend
            const response = await fetch('/auth/register', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
                registerForm.reset();
                imagePreview.style.display = 'none';
                strengthBar.style.width = '0%';
                strengthText.textContent = 'Độ mạnh mật khẩu';
            } else {
                // Handle backend validation errors
                if (data.errors) {
                    Object.entries(data.errors).forEach(([field, message]) => {
                        showError(`${field}-error`, message);
                    });
                } else {
                    throw new Error(data.message || 'Đăng ký thất bại');
                }
            }
        } catch (error) {
            showGlobalError(error.message);
        } finally {
            // Reset button state
            submitText.textContent = 'Đăng ký';
            submitSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    // Helper functions
    function checkPasswordStrength(password) {
        let strength = 0;

        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

        return Math.min(strength, 5);
    }

    function updateStrengthIndicator(strength) {
        const percent = (strength / 5) * 100;
        strengthBar.style.width = percent + '%';

        const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];
        const texts = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];

        strengthBar.style.backgroundColor = colors[strength - 1] || '';
        strengthText.textContent = texts[strength - 1] || 'Độ mạnh mật khẩu';
    }

    function validateForm() {
        let isValid = true;

        // Validate username (3-20 characters)
        const username = document.getElementById('username').value.trim();
        if (username.length < 3 || username.length > 20) {
            showError('username-error', 'Tên đăng nhập phải từ 3 đến 20 ký tự');
            isValid = false;
        } else {
            hideError('username-error');
        }

        // Validate password (min 6 characters)
        const password = passwordInput.value;
        if (password.length < 6) {
            showError('password-error', 'Mật khẩu phải có ít nhất 6 ký tự');
            isValid = false;
        } else {
            hideError('password-error');
        }

        // Validate full name
        const fullName = document.getElementById('fullName').value.trim();
        if (!fullName) {
            showError('fullName-error', 'Họ tên không được để trống');
            isValid = false;
        } else {
            hideError('fullName-error');
        }

        // Validate date of birth
        const dateOfBirth = dateOfBirthInput.value;
        if (!dateOfBirth) {
            showError('dateOfBirth-error', 'Ngày sinh không được để trống');
            isValid = false;
        } else {
            hideError('dateOfBirth-error');
        }

        // Validate email
        const email = document.getElementById('email').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email-error', 'Email không hợp lệ');
            isValid = false;
        } else {
            hideError('email-error');
        }

        // Validate phone (10-15 digits)
        const phone = document.getElementById('phone').value.trim();
        if (!/^[0-9]{10,15}$/.test(phone)) {
            showError('phone-error', 'Số điện thoại phải có 10-15 chữ số');
            isValid = false;
        } else {
            hideError('phone-error');
        }

        // Validate terms
        if (!termsCheckbox.checked) {
            showError('terms-error', 'Vui lòng đồng ý với điều khoản dịch vụ');
            isValid = false;
        } else {
            hideError('terms-error');
        }

        return isValid;
    }

    function showError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function hideError(fieldId) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    function showGlobalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'global-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        registerForm.prepend(errorDiv);

        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'global-success';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.opacity = '0';
            setTimeout(() => successDiv.remove(), 300);
        }, 5000);
    }

    const policyContents = {
        terms: `
      <h3>Điều khoản dịch vụ BookStore</h3>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Vui lòng đọc kỹ các điều khoản sau:</p>
      
      <h4>1. Quy định chung</h4>
      <p>BookStore là nền tảng mua sắm sách trực tuyến, cung cấp các dịch vụ liên quan đến sách và văn hóa đọc.</p>
      
      <h4>2. Đăng ký tài khoản</h4>
      <p>Người dùng cần cung cấp thông tin chính xác khi đăng ký. Mỗi người chỉ được đăng ký một tài khoản.</p>
      
      <h4>3. Quyền lợi thành viên</h4>
      <p>Thành viên được hưởng các ưu đãi, khuyến mãi theo chính sách của BookStore.</p>
    `,
        privacy: `
      <h3>Chính sách bảo mật thông tin</h3>
      <p>BookStore cam kết bảo vệ thông tin cá nhân của bạn. Chính sách này giải thích cách chúng tôi thu thập và sử dụng thông tin.</p>
      
      <h4>1. Thông tin thu thập</h4>
      <p>Chúng tôi thu thập thông tin bạn cung cấp khi đăng ký, mua hàng hoặc liên hệ với chúng tôi.</p>
      
      <h4>2. Mục đích sử dụng</h4>
      <p>Thông tin được sử dụng để cung cấp dịch vụ, xử lý giao dịch và cải thiện trải nghiệm người dùng.</p>
      
      <h4>3. Bảo mật thông tin</h4>
      <p>Chúng tôi sử dụng các biện pháp bảo mật để bảo vệ thông tin của bạn khỏi truy cập trái phép.</p>
    `
    };

    // Show modal function
    function showModal(title, content) {
        modalTitle.textContent = title;
        modalContent.innerHTML = content;

        // Show modal with animation
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Scroll to top
        modalContent.scrollTop = 0;
    }

    // Close modal function
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Terms link click
    document.querySelector('a[href="/terms"]').addEventListener('click', function(e) {
        e.preventDefault();
        showModal('Điều khoản dịch vụ', policyContents.terms);
    });

    // Privacy link click
    document.querySelector('a[href="/privacy"]').addEventListener('click', function(e) {
        e.preventDefault();
        showModal('Chính sách bảo mật', policyContents.privacy);
    });

    // Close buttons
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.querySelector('.btn-agree').addEventListener('click', closeModal);

    // Close when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
});