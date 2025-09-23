// Biến toàn cục để lưu trữ giỏ hàng
let checkoutCart = [];

// Thêm script này vào trang thanh toán
document.addEventListener('DOMContentLoaded', function() {
    // Lấy dữ liệu giỏ hàng từ sessionStorage
    checkoutCart = JSON.parse(sessionStorage.getItem('checkoutCart')) || [];

    if (checkoutCart.length === 0) {
        // Nếu không có sách trong giỏ hàng, có thể chuyển hướng về trang chủ
        alert('Giỏ hàng của bạn đang trống');
        window.location.href = '/';
        return;
    }

    // Hiển thị sách từ giỏ hàng
    renderCartItems(checkoutCart);
    calculateTotal(checkoutCart);

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

function completeOrder(e) {
    e.preventDefault();

    // Basic form validation
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

    if (!fullname || !email || !phone || !address) {
        alert('Vui lòng điền đầy đủ thông tin khách hàng');
        return;
    }

    if (checkoutCart.length === 0) {
        alert('Giỏ hàng của bạn đang trống');
        return;
    }

    // Tạo đối tượng đơn hàng
    const order = {
        customerInfo: {
            fullname,
            email,
            phone,
            address,
            city: document.getElementById('city').value,
            district: document.getElementById('district').value
        },
        paymentMethod,
        items: checkoutCart,
        orderDate: new Date().toISOString(),
        total: calculateOrderTotal(checkoutCart)
    };

    // Gửi đơn hàng đến server (trong thực tế)
    submitOrder(order);
}

function calculateOrderTotal(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 20000;
    const discount = subtotal > 100000 ? 10000 : 0;
    return subtotal + shipping - discount;
}

function submitOrder(order) {
    // Trong thực tế, bạn sẽ gửi API request đến server
    console.log('Đơn hàng:', order);

    // Hiển thị thông báo thành công
    alert('Đơn hàng của bạn đã được đặt thành công! Cảm ơn bạn đã mua sắm tại BookStore.');

    // Xóa giỏ hàng sau khi đặt hàng thành công
    localStorage.removeItem('cart'); // Xóa giỏ hàng từ localStorage
    sessionStorage.removeItem('checkoutCart'); // Xóa giỏ hàng tạm thời

    // Chuyển hướng về trang chủ
    window.location.href = '/';
}