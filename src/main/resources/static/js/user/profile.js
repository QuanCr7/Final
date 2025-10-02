// /js/user/profile.js
const API_BASE_URL = 'http://localhost:8080';
document.addEventListener('DOMContentLoaded', async function() {
    const isLoggedIn = await checkLoginStatus();
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');

    if (!isLoggedIn) {
        console.log('profile.js: Chưa đăng nhập, hiển thị lỗi');
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement && errorTextElement) {
            errorElement.style.display = 'flex';
            errorTextElement.textContent = 'Bạn cần đăng nhập để xem trang này!';
            showError('Bạn cần đăng nhập để xem trang này!');
        } else {
            console.error('profile.js: Không tìm thấy errorMessage hoặc errorText trong DOM');
            alert('Bạn cần đăng nhập để xem trang này!');
        }
        return;
    }

    // Nếu đã đăng nhập, tải profile và số lần đặt hàng
    loadUserProfile();
    loadOrderCount();
});

async function loadUserProfile() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');
    const profileContent = document.getElementById('profileContent');

    try {
        if (!getAccessToken()) {
            console.log('loadUserProfile: Không có accessToken, thử làm mới token');
            const refreshed = await checkLoginStatus();
            if (!refreshed) {
                throw new Error('Bạn cần đăng nhập để xem trang này!');
            }
        }

        const response = await fetch(`${API_BASE_URL}/account/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log('Profile response:', JSON.stringify(data, null, 2));

        if (response.ok && data.code === 200) {
            displayUserProfile(data.data);
            if (profileContent) profileContent.style.display = 'block';
            if (loadingElement) loadingElement.style.display = 'none';
        } else {
            throw new Error(data.message || 'Không thể lấy thông tin người dùng');
        }
    } catch (error) {
        console.error('profile.js: Lỗi:', error);
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement && errorTextElement) {
            errorElement.style.display = 'flex';
            errorTextElement.textContent = error.message;
        }
    }
}

async function loadOrderCount() {
    const booksBoughtElement = document.getElementById('booksBought');
    try {
        const response = await fetch(`${API_BASE_URL}/order/user?page=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log('Order count response:', JSON.stringify(data, null, 2));

        if (response.ok && data.code === 200) {
            booksBoughtElement.textContent = data.data.totalElements || 0;
            // Thêm sự kiện click để chuyển hướng đến trang order
            booksBoughtElement.parentElement.style.cursor = 'pointer';
            booksBoughtElement.parentElement.addEventListener('click', () => {
                window.location.href = '/me/order';
            });
        } else {
            throw new Error(data.message || 'Không thể lấy số lần đặt hàng');
        }
    } catch (error) {
        console.error('profile.js: Lỗi khi lấy số lần đặt hàng:', error);
        booksBoughtElement.textContent = '0';
    }
}

function displayUserProfile(userData) {
    console.log('User data:', userData);

    const avatarImg = document.getElementById('userAvatar');
    if (userData.imageUrl) {
        avatarImg.src = `${API_BASE_URL}/images/user/${userData.imageUrl}`;
    } else {
        avatarImg.src = '/images/user/default-avatar.jpg';
    }

    const userNameElement = document.getElementById('userDisplayName');
    userNameElement.textContent = userData.fullName || userData.username || 'N/A';

    document.getElementById('username').textContent = userData.username || 'N/A';
    updateField('fullName', userData.fullName);
    updateField('email', userData.email);
    updateField('phone', userData.phone);
    updateField('address', userData.address);
    updateField('description', userData.description);

    const dobElement = document.getElementById('dateOfBirth');
    if (userData.dateOfBirth) {
        dobElement.textContent = formatDate(userData.dateOfBirth);
        dobElement.classList.remove('empty');
    } else {
        dobElement.textContent = 'Chưa cập nhật';
    }

    const joinDateElement = document.getElementById('joinDate');
    if (userData.dateCreate) {
        joinDateElement.textContent = formatDate(userData.dateCreate);
    } else {
        joinDateElement.textContent = 'N/A';
    }
}

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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}