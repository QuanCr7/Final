document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const rememberMe = document.getElementById('rememberMe');

    // Kiểm tra remember me - chỉ lưu username
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) document.getElementById('username').value = savedUsername;
        if (rememberMe) rememberMe.checked = true;
    }

    // Toggle password
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Xử lý submit form đăng nhập
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            errorMessage.classList.remove('show');

            const username = document.getElementById('username').value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                showError('Vui lòng nhập đầy đủ thông tin đăng nhập');
                return;
            }

            // Lưu remember me - chỉ lưu username
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('username', username);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('username');
            }

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include' // Gửi cookie refreshToken
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Đăng nhập thất bại');
                }

                // Lưu access token trong memory
                setAccessToken(data.data.accessToken);

                // Lưu username vào localStorage
                localStorage.setItem('username', username);

                // Cập nhật header trước khi redirect
                updateHeaderAfterLogin(username);

                // Chuyển hướng
                console.log('login.js: Đăng nhập thành công, chuyển hướng đến /');
                window.location.href = '/';
            } catch (error) {
                console.error('login.js: Lỗi đăng nhập:', error);
                showError(error.message || 'Có lỗi xảy ra khi đăng nhập');
            }
        });
    }

    // Xử lý đăng nhập bằng mạng xã hội
    document.querySelector('.social-button.google')?.addEventListener('click', () => alert('Chức năng đăng nhập bằng Google sẽ được triển khai sau'));
    document.querySelector('.social-button.facebook')?.addEventListener('click', () => alert('Chức năng đăng nhập bằng Facebook sẽ được triển khai sau'));

    // Hiển thị lỗi
    function showError(message) {
        errorMessage.querySelector('.error-text').textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => errorMessage.classList.remove('show'), 5000);
    }
});