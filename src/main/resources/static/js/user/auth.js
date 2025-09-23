// auth.js - Xử lý xác thực và trạng thái người dùng chung

// Biến lưu trữ access token trong memory
let accessToken = null;

/**
 * Kiểm tra trạng thái đăng nhập và thử refresh token nếu cần
 */
async function checkLoginStatus() {
    console.log('checkLoginStatus: Bắt đầu kiểm tra trạng thái đăng nhập');
    const username = localStorage.getItem('username');
    console.log('checkLoginStatus: username từ localStorage:', username);

    if (username && !accessToken) {
        console.log('checkLoginStatus: Không có accessToken, thử refresh token');
        try {
            const response = await fetch('/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: '' }), // Cookie tự động gửi
                credentials: 'include'
            });

            const data = await response.json();
            console.log('checkLoginStatus: Response từ /auth/refresh-token:', data);

            if (response.ok) {
                accessToken = data.data.accessToken;
                console.log('checkLoginStatus: Đã lấy accessToken mới:', accessToken);
                updateHeaderAfterLogin(username);
            } else {
                console.warn('checkLoginStatus: Refresh token thất bại, xóa dữ liệu xác thực');
                clearAuthData();
                resetHeaderAfterLogout();
            }
        } catch (error) {
            console.error('checkLoginStatus: Lỗi khi refresh token:', error);
            clearAuthData();
            resetHeaderAfterLogout();
        }
    } else if (username) {
        console.log('checkLoginStatus: Có username, cập nhật header');
        updateHeaderAfterLogin(username);
    } else {
        console.log('checkLoginStatus: Không có username, reset header');
        resetHeaderAfterLogout();
    }
}

/**
 * Cập nhật header sau khi đăng nhập
 * @param {string} username - Tên người dùng
 */
function updateHeaderAfterLogin(username) {
    const authSection = document.querySelector('.auth-section');
    if (!authSection) {
        console.warn('updateHeaderAfterLogin: Không tìm thấy .auth-section');
        return;
    }
    console.log('updateHeaderAfterLogin: Cập nhật header cho username:', username);
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
            logout();
        });
    } else {
        console.warn('updateHeaderAfterLogin: Không tìm thấy logoutBtn');
    }
}

/**
 * Xử lý đăng xuất
 */
async function logout() {
    console.log('logout: Bắt đầu đăng xuất');
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include' // Gửi cookie refreshToken
        });

        if (response.ok) {
            console.log('logout: Đăng xuất thành công');
        } else {
            console.warn('logout: API logout trả về lỗi:', response.status);
        }
    } catch (error) {
        console.error('logout: Lỗi khi gọi API logout:', error);
    } finally {
        clearAuthData();
        resetHeaderAfterLogout();
        window.location.href = '/auth/login';
    }
}

/**
 * Xóa dữ liệu xác thực khỏi client
 */
function clearAuthData() {
    console.log('clearAuthData: Xóa dữ liệu xác thực');
    accessToken = null;
    localStorage.removeItem('username');
}

/**
 * Đặt lại header về trạng thái chưa đăng nhập
 */
function resetHeaderAfterLogout() {
    const authSection = document.querySelector('.auth-section');
    if (!authSection) {
        console.warn('resetHeaderAfterLogout: Không tìm thấy .auth-section');
        return;
    }
    console.log('resetHeaderAfterLogout: Reset header về trạng thái chưa đăng nhập');
    authSection.innerHTML = `
        <a href="/auth/login" class="auth-btn login-btn"><i class="fas fa-sign-in-alt"></i> Đăng nhập</a>
        <a href="/auth/register" class="auth-btn register-btn"><i class="fas fa-user-plus"></i> Đăng ký</a>
    `;
}

/**
 * Lấy access token hiện tại
 * @returns {string|null} Access token hoặc null nếu không có
 */
function getAccessToken() {
    return accessToken;
}

/**
 * Set access token
 * @param {string} token - Access token mới
 */
function setAccessToken(token) {
    console.log('setAccessToken: Đặt accessToken:', token);
    accessToken = token;
}

// Khởi tạo khi DOM được tải
document.addEventListener('DOMContentLoaded', function() {
    console.log('auth.js: DOM loaded, chạy checkLoginStatus');
    checkLoginStatus();

    // Xử lý menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.querySelector('.nav-list')?.classList.toggle('active');
        });
    }

    // Xử lý active menu
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