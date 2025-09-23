// Biến lưu trữ access token trong memory
let accessToken = null;

// Hàm kiểm tra đăng nhập và lấy thông tin user
async function loadUserProfile() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');
    const profileContent = document.getElementById('profileContent');

    try {
        // Kiểm tra xem user đã đăng nhập chưa
        const username = localStorage.getItem('username');
        const userDataStr = localStorage.getItem('userData');

        if (!username) {
            throw new Error('Bạn cần đăng nhập để xem trang này');
        }

        // Nếu có userData trong localStorage, hiển thị tạm thời
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                displayUserProfile(userData);
                profileContent.style.display = 'block';
                loadingElement.style.display = 'none';
            } catch (e) {
                console.error('Lỗi parse userData:', e);
            }
        }

        // Lấy accessToken từ memory hoặc thử refresh token
        if (!accessToken) {
            const refreshed = await refreshToken();
            if (!refreshed) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
        }

        // Gọi API để lấy thông tin user mới nhất
        const response = await fetch('/account/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.status === 401) {
            // Token hết hạn, thử refresh token
            const refreshed = await refreshToken();
            if (refreshed) {
                return loadUserProfile(); // Thử lại
            } else {
                throw new Error('Phiên đăng nhập đã hết hạn');
            }
        }

        if (!response.ok) {
            throw new Error('Không thể lấy thông tin người dùng');
        }

        const data = await response.json();

        if (data.success) {
            displayUserProfile(data.data);
            // Lưu thông tin user vào localStorage
            localStorage.setItem('userData', JSON.stringify(data.data));

            profileContent.style.display = 'block';
            loadingElement.style.display = 'none';
        } else {
            throw new Error(data.message || 'Lỗi khi lấy thông tin');
        }

    } catch (error) {
        console.error('Lỗi:', error);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'flex';
        errorTextElement.textContent = error.message;

        // Nếu lỗi do chưa đăng nhập, chuyển hướng sau 2 giây
        // if (error.message.includes('đăng nhập')) {
        //     setTimeout(() => {
        //         window.location.href = '/auth/login';
        //     }, 2000);
        // }
    }
}

// Hàm hiển thị thông tin user lên giao diện
function displayUserProfile(userData) {
    console.log('User data:', userData);

    // Hiển thị avatar
    const avatarImg = document.getElementById('userAvatar');
    if (userData.imageUrl) {
        avatarImg.src = `/images/user/${userData.imageUrl}`;
    }

    // Hiển thị tên (sửa thành userDisplayName)
    const userNameElement = document.getElementById('userDisplayName');
    userNameElement.textContent = userData.fullName || userData.username;

    // Hiển thị thông tin cơ bản
    document.getElementById('username').textContent = userData.username;

    updateField('fullName', userData.fullName);
    updateField('email', userData.email);
    updateField('phone', userData.phone);
    updateField('address', userData.address);
    updateField('description', userData.description);

    // Hiển thị ngày sinh
    const dobElement = document.getElementById('dateOfBirth');
    if (userData.dateOfBirth) {
        dobElement.textContent = formatDate(userData.dateOfBirth);
        dobElement.classList.remove('empty');
    }

    // Hiển thị ngày tham gia
    const joinDateElement = document.getElementById('joinDate');
    if (userData.dateCreate) {
        joinDateElement.textContent = formatDate(userData.dateCreate);
    }

    // Cập nhật header
    updateHeader(userData.username);
}

// Hàm cập nhật trường thông tin
function updateField(fieldId, value) {
    const element = document.getElementById(fieldId);
    if (value) {
        element.textContent = value;
        element.classList.remove('empty');
    }
}

// Hàm định dạng ngày tháng
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Hàm làm mới access token
async function refreshToken() {
    try {
        const response = await fetch('/auth/refresh-token', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                accessToken = data.data.accessToken;
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Lỗi refresh token:', error);
        return false;
    }
}

// Hàm cập nhật header sau khi đăng nhập
function updateHeader(username) {
    const authSection = document.getElementById('authSection');
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

    // Thêm sự kiện logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

// Hàm xử lý đăng xuất
async function logout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        // Dù server có phản hồi thế nào, cũng xóa dữ liệu client
        clearAuthData();
        window.location.href = '/auth/login';

    } catch (error) {
        console.error('Lỗi khi logout:', error);
        clearAuthData();
        window.location.href = '/auth/login';
    }
}

// Hàm xóa dữ liệu xác thực
function clearAuthData() {
    accessToken = null;
    localStorage.removeItem('username');
    localStorage.removeItem('userData');
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập trước
    checkLoginStatus();
    loadUserProfile();
});

// Hàm kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const username = localStorage.getItem('username');
    if (username) {
        updateHeader(username);
    }
}