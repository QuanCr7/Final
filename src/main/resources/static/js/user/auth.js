// /js/user/auth.js
const API_BASE_URL = 'http://localhost:8080';
let accessToken = null;

async function checkLoginStatus() {
    console.log('auth.js: checkLoginStatus: Bắt đầu kiểm tra trạng thái đăng nhập');
    const username = localStorage.getItem('username');
    console.log('auth.js: checkLoginStatus: username từ localStorage:', username);

    if (username) {
        console.log('auth.js: checkLoginStatus: Có username, thử làm mới token');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log('auth.js: checkLoginStatus: Response từ /auth/refresh-token:', JSON.stringify(data, null, 2));

            if (response.ok && data.data?.accessToken) {
                accessToken = data.data.accessToken;
                console.log('auth.js: checkLoginStatus: Đã lấy accessToken mới:', accessToken);
                updateHeaderAfterLogin(username);
                return true;
            } else {
                console.warn('auth.js: checkLoginStatus: Làm mới token thất bại:', data.message || 'Không có accessToken');
                showError(data.message || 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
                clearAuthData();
                resetHeaderAfterLogout();
                return false;
            }
        } catch (error) {
            console.error('auth.js: checkLoginStatus: Lỗi khi làm mới token:', error);
            showError('Lỗi kết nối khi làm mới phiên đăng nhập, vui lòng thử lại');
            clearAuthData();
            resetHeaderAfterLogout();
            return false;
        }
    } else {
        console.log('auth.js: checkLoginStatus: Không có username, reset header');
        resetHeaderAfterLogout();
        return false;
    }
}

function updateHeaderAfterLogin(username) {
    const authSection = document.querySelector('.auth-section');
    if (!authSection) {
        console.error('auth.js: updateHeaderAfterLogin: Không tìm thấy .auth-section trong DOM');
        return false;
    }
    console.log('auth.js: updateHeaderAfterLogin: Cập nhật header cho username:', username);
    authSection.innerHTML = `
        <div class="user-dropdown">
            <button class="user-btn">
                <i class="fas fa-user-circle"></i>
                ${username}
                <i class="fas fa-caret-down"></i>
            </button>
            <div class="dropdown-content">
                <a href="/me"><i class="fas fa-user"></i> Trang cá nhân</a>
                <a href="/settings"><i class="fas fa-cog"></i> Cài đặt</a>
                <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
            </div>
        </div>
    `;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('auth.js: logoutBtn: Đã nhấn nút đăng xuất');
            logout();
        });
        return true;
    } else {
        console.error('auth.js: updateHeaderAfterLogin: Không tìm thấy logoutBtn sau khi cập nhật DOM');
        return false;
    }
}

function resetHeaderAfterLogout() {
    const authSection = document.querySelector('.auth-section');
    if (!authSection) {
        console.error('auth.js: resetHeaderAfterLogout: Không tìm thấy .auth-section');
        return false;
    }
    console.log('auth.js: resetHeaderAfterLogout: Reset header về trạng thái chưa đăng nhập');
    authSection.innerHTML = `
        <a href="/auth/login" class="auth-btn login-btn"><i class="fas fa-sign-in-alt"></i> Đăng nhập</a>
        <a href="/auth/register" class="auth-btn register-btn"><i class="fas fa-user-plus"></i> Đăng ký</a>
    `;
    return true;
}

function clearAuthData() {
    console.log('auth.js: clearAuthData: Xóa dữ liệu xác thực');
    accessToken = null;
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userData');
}

async function logout() {
    console.log('auth.js: logout: Bắt đầu đăng xuất');
    if (!accessToken) {
        clearAuthData();
        resetHeaderAfterLogout();
        window.location.href = '/auth/login';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            console.log('auth.js: logout: Đăng xuất thành công');
        } else {
            console.warn('auth.js: logout: API logout trả về lỗi:', response.status);
        }
    } catch (error) {
        console.error('auth.js: Lỗi khi đăng xuất:', error);
    } finally {
        clearAuthData();
        resetHeaderAfterLogout();
        window.location.href = '/auth/login';
    }
}

function setAccessToken(token) {
    console.log('auth.js: setAccessToken: Đặt accessToken:', token);
    accessToken = token;
}

function getAccessToken() {
    return accessToken;
}

function showError(message) {
    let errorElement = document.getElementById('errorMessage');
    let errorTextElement = document.querySelector('.error-text');

    if (!errorElement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px; 
            background-color: #dc3545; color: white; border-radius: 4px; 
            z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
        return;
    }

    if (errorTextElement) {
        errorTextElement.textContent = message;
    }
    errorElement.style.display = 'flex';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    let successElement = document.getElementById('successMessage');
    let successTextElement = document.querySelector('.success-text');

    if (!successElement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px; 
            background-color: #28a745; color: white; border-radius: 4px; 
            z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
        return;
    }

    if (successTextElement) {
        successTextElement.textContent = message;
    }
    successElement.style.display = 'block';
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('auth.js: DOM loaded, chạy checkLoginStatus');
    checkLoginStatus();

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.querySelector('.nav-list')?.classList.toggle('active');
        });
    }

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath &&
            !currentPath.startsWith('/auth/') &&
            (currentPath === '/' && linkPath === '/') ||
            (currentPath.startsWith(linkPath) && linkPath !== '/' && !linkPath.startsWith('/auth/'))) {
            link.classList.add('active');
        }
    });
});