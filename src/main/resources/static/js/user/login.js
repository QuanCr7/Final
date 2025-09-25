// /js/user/login.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('login.js: DOM loaded');

    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('rememberMe');

    // Kiểm tra auth.js đã tải chưa
    if (typeof checkLoginStatus === 'undefined' || typeof showSuccess === 'undefined' || typeof showError === 'undefined') {
        console.error('login.js: auth.js functions (checkLoginStatus, showSuccess, showError) are not defined');
        alert('Lỗi hệ thống: Không thể tải auth.js. Vui lòng kiểm tra lại.');
        return;
    }

    // Kiểm tra trạng thái đăng nhập từ auth.js
    checkLoginStatus().then(isLoggedIn => {
        console.log('login.js: isLoggedIn:', isLoggedIn);
        if (isLoggedIn) {
            showSuccess('Bạn đã đăng nhập, đang chuyển hướng...');
            setTimeout(() => window.location.href = '/', 1000);
        }
    }).catch(error => {
        console.error('login.js: Error checking login status:', error);
        showError('Lỗi khi kiểm tra trạng thái đăng nhập: ' + error.message);
    });

    // Kiểm tra remember me
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            document.getElementById('username').value = savedUsername;
            console.log('login.js: Restored username from localStorage:', savedUsername);
        }
        if (rememberMe) rememberMe.checked = true;
    }

    // Toggle password
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
            console.log('login.js: Toggled password visibility');
        });
    }

    // Xử lý submit form đăng nhập
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('login.js: Form submitted');

            const username = document.getElementById('username').value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                showError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
                console.log('login.js: Missing username or password');
                return;
            }

            // Lưu remember me
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('username', username);
                console.log('login.js: Saved rememberMe and username to localStorage');
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('username');
                console.log('login.js: Cleared rememberMe and username from localStorage');
            }

            try {
                console.log('login.js: Sending login request with:', { username, password });
                const response = await fetch('http://localhost:8080/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });

                console.log('login.js: Login response status:', response.status);
                const data = await response.json();
                console.log('login.js: Login response data:', JSON.stringify(data, null, 2));

                if (response.ok && data.code === 200) {
                    showSuccess('Đăng nhập thành công');
                    setAccessToken(data.data.accessToken);
                    localStorage.setItem('username', username);
                    updateHeaderAfterLogin(username);
                    console.log('login.js: Login successful, redirecting to /');
                    setTimeout(() => window.location.href = '/', 1500);
                } else {
                    showError(data.message || 'Đăng nhập thất bại');
                    console.log('login.js: Login failed with message:', data.message);
                }
            } catch (error) {
                console.error('login.js: Login error:', error);
                showError('Đã có lỗi xảy ra khi đăng nhập: ' + error.message);
            }
        });
    }

    // Xử lý đăng nhập bằng mạng xã hội
    document.querySelector('.social-button.google')?.addEventListener('click', () => {
        console.log('login.js: Google login clicked');
        alert('Chức năng đăng nhập bằng Google sẽ được triển khai sau');
    });
    document.querySelector('.social-button.facebook')?.addEventListener('click', () => {
        console.log('login.js: Facebook login clicked');
        alert('Chức năng đăng nhập bằng Facebook sẽ được triển khai sau');
    });
});