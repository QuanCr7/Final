// /js/user/orderdetail.js
document.addEventListener('DOMContentLoaded', async function() {
    const API_BASE_URL = 'http://localhost:8080';
    const urlParams = new URLSearchParams(window.location.search);
    let orderId = urlParams.get('id');

    const isLoggedIn = await checkLoginStatus();
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');
    const orderContent = document.getElementById('orderContent');

    if (!isLoggedIn) {
        console.log('order-detail.js: Chưa đăng nhập, hiển thị lỗi');
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement && errorTextElement) {
            errorElement.style.display = 'flex';
            errorTextElement.textContent = 'Bạn cần đăng nhập để xem chi tiết đơn hàng!';
            showError('Bạn cần đăng nhập để xem chi tiết đơn hàng!');
        } else {
            console.error('order-detail.js: Không tìm thấy errorMessage hoặc errorText trong DOM');
            alert('Bạn cần đăng nhập để xem chi tiết đơn hàng!');
        }
        return;
    }

    if (!orderId || isNaN(orderId) || orderId === 'undefined') {
        console.error('order-detail.js: Không tìm thấy orderId hợp lệ trong URL');
        if (errorElement && errorTextElement) {
            errorElement.style.display = 'flex';
            errorTextElement.textContent = 'Không tìm thấy mã đơn hàng!';
            showError('Không tìm thấy mã đơn hàng!');
        }
        return;
    }

    loadOrderDetail(orderId);

    document.getElementById('printInvoice').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('reorder').addEventListener('click', () => {
        reorder(orderId);
    });
});

async function loadOrderDetail(orderId) {
    const API_BASE_URL = 'http://localhost:8080';
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');
    const orderContent = document.getElementById('orderContent');

    try {
        if (!getAccessToken()) {
            console.log('loadOrderDetail: Không có accessToken, thử làm mới token');
            const refreshed = await checkLoginStatus();
            if (!refreshed) {
                throw new Error('Bạn cần đăng nhập để xem chi tiết đơn hàng!');
            }
        }

        if (loadingElement) loadingElement.style.display = 'flex';
        if (errorElement) errorElement.style.display = 'none';
        if (orderContent) orderContent.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/order/detail/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log('order-detail.js: Order detail response:', JSON.stringify(data, null, 2));

        if (response.ok && data.code === 200) {
            const order = data.data;
            displayOrderDetail(order);
            if (orderContent) orderContent.style.display = 'block';
            if (loadingElement) loadingElement.style.display = 'none';
        } else {
            throw new Error(data.message || 'Không thể lấy chi tiết đơn hàng');
        }
    } catch (error) {
        console.error('order-detail.js: Lỗi:', error);
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement && errorTextElement) {
            errorElement.style.display = 'flex';
            errorTextElement.textContent = error.message;
            showError(error.message);
        }
    }
}

function displayOrderDetail(order) {
    document.getElementById('orderId').textContent = order.id;
    document.getElementById('orderIdDisplay').textContent = `#${order.id}`;
    document.getElementById('orderDate').textContent = formatDate(order.orderDate);

    const statusElement = document.getElementById('orderStatus');
    statusElement.textContent = getStatusText(order.status);
    statusElement.className = `order-status status-${order.status.toLowerCase()}`;
    statusElement.innerHTML = `<i class="fas fa-check-circle"></i> ${getStatusText(order.status)}`;

    document.getElementById('name').textContent = order.name || 'N/A';
    document.getElementById('phone').textContent = order.phone || 'N/A';
    document.getElementById('email').textContent = order.email || 'N/A';
    document.getElementById('shippingAddress').textContent = order.shippingAddress || 'N/A';

    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = '';
    order.orderDetails.forEach(item => {
        console.log('order-detail.js: Displaying item:', JSON.stringify(item, null, 2));
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        const imageUrl = item.imageUrl ? `http://localhost:8080/images/book/${item.imageUrl}` : 'https://via.placeholder.com/80x100';
        itemElement.innerHTML = `
            <img src="${imageUrl}" alt="${item.title || 'N/A'}" class="item-image">
            <div class="item-details">
                <h3 class="item-title">${item.title || 'N/A'}</h3>
                <p class="item-author">${item.author || 'Không xác định'}</p>
                <p class="item-price">${formatPrice(item.price)}</p>
                <p class="item-quantity">Số lượng: ${item.quantity}</p>
            </div>
        `;
        orderItems.appendChild(itemElement);
    });

    const subtotal = order.orderDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 20000;
    const discount = subtotal > 100000 ? 10000 : 0;
    const total = subtotal + shipping - discount;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = formatPrice(shipping);
    document.getElementById('discount').textContent = `-${formatPrice(discount)}`;
    document.getElementById('total').textContent = formatPrice(total);
}

function getStatusText(status) {
    switch (status) {
        case 'PENDING': return 'Đang chờ xử lý';
        case 'PROCESSING': return 'Đang xử lý';
        case 'SHIPPED': return 'Đã giao';
        case 'DELIVERED': return 'Đã giao hàng';
        case 'CANCELLED': return 'Đã hủy';
        default: return 'Không xác định';
    }
}

async function reorder(orderId) {
    const API_BASE_URL = 'http://localhost:8080';
    try {
        const response = await fetch(`${API_BASE_URL}/order/detail/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log('order-detail.js: Reorder response:', JSON.stringify(data, null, 2));

        if (response.ok && data.code === 200) {
            const order = data.data;
            const cartItems = order.orderDetails.map(detail => ({
                id: detail.id, // bookId
                title: detail.title,
                price: detail.price,
                quantity: detail.quantity,
                image: detail.imageUrl ? `${API_BASE_URL}/images/book/${detail.imageUrl}` : 'https://via.placeholder.com/80x100'
            }));

            localStorage.setItem('cart', JSON.stringify(cartItems));
            alert('Đã thêm các sản phẩm vào giỏ hàng!');
            window.location.href = '/pay';
        } else {
            showError(data.message || 'Không thể đặt lại đơn hàng');
        }
    } catch (error) {
        console.error('order-detail.js: Lỗi khi đặt lại đơn hàng:', error);
        showError('Lỗi khi đặt lại đơn hàng: ' + error.message);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}