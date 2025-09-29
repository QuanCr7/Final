// /js/user/pay.js
// Biến toàn cục để lưu trữ giỏ hàng
let checkoutCart = [];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('pay.js: DOM loaded');

    // Kiểm tra auth.js đã tải chưa
    if (typeof checkLoginStatus === 'undefined' || typeof showError === 'undefined' || typeof getAccessToken === 'undefined') {
        console.error('pay.js: auth.js functions (checkLoginStatus, showError, getAccessToken) are not defined');
        alert('Lỗi hệ thống: Không thể tải auth.js. Vui lòng kiểm tra lại.');
        return;
    }

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = await checkLoginStatus();
    const infoSourceSelect = document.getElementById('infoSource');

    // Nếu chưa đăng nhập, ẩn tùy chọn "Sử dụng thông tin tài khoản"
    if (!isLoggedIn) {
        console.log('pay.js: Chưa đăng nhập, ẩn tùy chọn sử dụng thông tin tài khoản');
        infoSourceSelect.innerHTML = `
            <option value="manual">Nhập thông tin mới</option>
        `;
    }

    // Đồng bộ giỏ hàng từ sessionStorage và localStorage
    checkoutCart = JSON.parse(sessionStorage.getItem('checkoutCart')) || JSON.parse(localStorage.getItem('cart')) || [];
    if (checkoutCart.length === 0) {
        console.log('pay.js: Giỏ hàng trống, chuyển hướng về trang chủ');
        showError('Giỏ hàng của bạn đang trống');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }

    // Lưu giỏ hàng vào sessionStorage để đảm bảo không mất khi reload
    sessionStorage.setItem('checkoutCart', JSON.stringify(checkoutCart));

    // Hiển thị sách từ giỏ hàng
    renderCartItems(checkoutCart);
    calculateTotal(checkoutCart);

    // Các trường nhập liệu
    const fields = {
        fullname: document.getElementById('fullname'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        address: document.getElementById('address')
    };

    // Xử lý dropdown nguồn thông tin
    infoSourceSelect.addEventListener('change', async function() {
        const value = this.value;
        console.log('pay.js: infoSource changed to:', value);

        // Khóa hoặc mở khóa các trường
        const disableFields = value === 'account';
        Object.values(fields).forEach(field => {
            if (field) field.disabled = disableFields;
        });

        if (value === 'account' && isLoggedIn) {
            try {
                const response = await fetch('http://localhost:8080/account/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getAccessToken()}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                const data = await response.json();
                console.log('pay.js: Profile response:', JSON.stringify(data, null, 2));

                if (response.ok && data.code === 200) {
                    const { fullName, email, phone, address } = data.data;
                    fields.fullname.value = fullName || '';
                    fields.email.value = email || '';
                    fields.phone.value = phone || '';
                    fields.address.value = address || '';
                } else {
                    showError(data.message || 'Không thể lấy thông tin tài khoản');
                    infoSourceSelect.value = 'manual';
                    Object.values(fields).forEach(field => {
                        if (field) field.disabled = false;
                    });
                }
            } catch (error) {
                console.error('pay.js: Lỗi khi lấy thông tin tài khoản:', error);
                showError('Lỗi khi lấy thông tin tài khoản: ' + error.message);
                infoSourceSelect.value = 'manual';
                Object.values(fields).forEach(field => {
                    if (field) field.disabled = false;
                });
            }
        } else {
            // Xóa các trường để người dùng nhập mới
            Object.values(fields).forEach(field => {
                if (field) field.value = '';
            });
        }
    });

    // Gán sự kiện cho nút thanh toán
    document.getElementById('completeOrderBtn').addEventListener('click', completeOrder);
});

function renderCartItems(cartItems) {
    const bookItemsContainer = document.getElementById('bookItemsContainer');
    bookItemsContainer.innerHTML = ''; // Xóa nội dung mẫu

    cartItems.forEach(item => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="book-image">
            <div class="book-details">
                <h3 class="book-title">${item.title}</h3>
                <p class="book-price">${formatPrice(item.price)}</p>
                <div class="book-quantity">
                    <span>Số lượng: ${item.quantity}</span>
                </div>
            </div>
        `;
        bookItemsContainer.appendChild(bookItem);
    });
}

function calculateTotal(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 20000; // Phí vận chuyển cố định
    const discount = subtotal > 100000 ? 10000 : 0; // Giảm giá 10k nếu tổng > 100k
    const total = subtotal + shipping - discount;

    // Cập nhật tổng tiền
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = formatPrice(shipping);
    document.getElementById('discount').textContent = `-${formatPrice(discount)}`;
    document.getElementById('total').textContent = formatPrice(total);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

async function completeOrder(e) {
    e.preventDefault();
    console.log('pay.js: completeOrder: Bắt đầu xử lý đơn hàng');

    // Kiểm tra đăng nhập
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
        showError('Bạn cần đăng nhập để đặt hàng');
        return;
    }

    // Basic form validation
    const fields = {
        fullname: document.getElementById('fullname'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        address: document.getElementById('address')
    };

    if (!fields.fullname.value || !fields.email.value || !fields.phone.value || !fields.address.value) {
        showError('Vui lòng điền đầy đủ thông tin khách hàng');
        console.log('pay.js: completeOrder: Thiếu thông tin khách hàng');
        return;
    }

    if (checkoutCart.length === 0) {
        showError('Giỏ hàng của bạn đang trống');
        console.log('pay.js: completeOrder: Giỏ hàng trống');
        return;
    }

    // Tạo đối tượng đơn hàng khớp với OrderRequest
    const order = {
        shippingAddress: fields.address.value, // Gộp toàn bộ địa chỉ vào shippingAddress
        totalAmount: calculateOrderTotal(checkoutCart),
        orderDate: new Date().toISOString(),
        orderDetails: checkoutCart.map(item => ({
            bookId: item.id, // Giả định item.id là bookId
            quantity: item.quantity,
            price: item.price
        }))
    };

    // Gửi đơn hàng đến server
    try {
        const response = await fetch('http://localhost:8080/order/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAccessToken()}`
            },
            credentials: 'include',
            body: JSON.stringify(order)
        });

        const data = await response.json();
        console.log('pay.js: Order response:', JSON.stringify(data, null, 2));

        if (response.ok && data.code === 200) {
            // Hiển thị thông báo thành công
            alert('Đơn hàng của bạn đã được đặt thành công! Cảm ơn bạn đã mua sắm tại BookStore.');
            // Xóa giỏ hàng sau khi đặt hàng thành công
            localStorage.removeItem('cart');
            sessionStorage.removeItem('checkoutCart');
            // Chuyển hướng về trang chủ
            window.location.href = '/';
        } else {
            showError(data.message || 'Không thể đặt đơn hàng');
        }
    } catch (error) {
        console.error('pay.js: Lỗi khi đặt đơn hàng:', error);
        showError('Lỗi khi đặt đơn hàng: ' + error.message);
    }
}

function calculateOrderTotal(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 20000;
    const discount = subtotal > 100000 ? 10000 : 0;
    return subtotal + shipping - discount;
}