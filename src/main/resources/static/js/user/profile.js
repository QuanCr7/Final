const API_BASE_URL = 'http://localhost:8080';

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
        const accessToken = localStorage.getItem('accessToken');

        if (!username || !accessToken) {
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

        // Gọi API để lấy thông tin user mới nhất
        const response = await fetch(`${API_BASE_URL}/account/profile`, {
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
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
        }

        const data = await response.json();
        console.log('Profile response:', JSON.stringify(data, null, 2));

        if (response.ok && data.code === 200) {
            displayUserProfile(data.data);
            // Lưu thông tin user vào localStorage
            localStorage.setItem('userData', JSON.stringify(data.data));

            profileContent.style.display = 'block';
            loadingElement.style.display = 'none';
        } else {
            throw new Error(data.message || 'Không thể lấy thông tin người dùng');
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
        avatarImg.src = `${API_BASE_URL}/images/user/${userData.imageUrl}`;
    } else {
        avatarImg.src = '/images/user/default-avatar.jpg';
    }

    // Hiển thị tên
    const userNameElement = document.getElementById('userDisplayName');
    userNameElement.textContent = userData.fullName || userData.username || 'N/A';

    // Hiển thị thông tin cơ bản
    document.getElementById('username').textContent = userData.username || 'N/A';
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
    } else {
        dobElement.textContent = 'Chưa cập nhật';
    }

    // Hiển thị ngày tham gia
    const joinDateElement = document.getElementById('joinDate');
    if (userData.dateCreate) {
        joinDateElement.textContent = formatDate(userData.dateCreate);
    } else {
        joinDateElement.textContent = 'N/A';
    }

    // Cập nhật header - Gọi checkLoginStatus để kiểm tra và cập nhật dropdown
    if (typeof checkLoginStatus === 'function') {
        checkLoginStatus();
    } else {
        console.warn('checkLoginStatus function not available. Header may not update.');
    }
}

// Hàm cập nhật trường thông tin
function updateField(fieldId, value) {
    const element = document.getElementById(fieldId);
    if (value) {
        element.textContent = value;
        element.classList.remove('empty');
    } else {
        element.textContent = 'Chưa cập nhật';
        element.classList.add('empty');
    }
}

// Hàm định dạng ngày tháng
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Hàm làm mới access token (từ auth.js, nhưng để đảm bảo có sẵn)
async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;

        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.code === 200) {
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Lỗi refresh token:', error);
        return false;
    }
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Gọi checkLoginStatus ngay khi DOM loaded để cập nhật header
    if (typeof checkLoginStatus === 'function') {
        checkLoginStatus();
    }

    // Sau đó mới load profile
    loadUserProfile();
});