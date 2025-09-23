// File JavaScript độc lập cho giỏ hàng
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.createCartIcon();
        this.loadCartFromStorage();
        this.bindEvents();
    }

    createCartIcon() {
        // Tạo icon giỏ hàng nếu chưa tồn tại
        if (!document.getElementById('cartIcon')) {
            const cartHtml = `
                <div class="cart-icon-container">
                <i class="fas fa-shopping-cart cart-icon" id="cartIcon"></i>
                <span class="cart-count" id="cartCount">0</span>
                <div class="cart-dropdown" id="cartDropdown">
                    <h3 class="cart-title">Giỏ hàng của bạn</h3>
                    <div class="cart-items" id="cartItems">
                        <div class="cart-empty" id="cartEmpty">
                            <i class="fas fa-shopping-cart"></i>
                            <p>Giỏ hàng của bạn đang trống</p>
                        </div>
                    </div>
                    <div class="cart-total">
                        <span>Tổng tiền:</span>
                        <span id="cartTotal">0₫</span>
                    </div>
                    <div class="cart-actions">
                        <a href="/cart.html" class="cart-btn view-cart">Xem giỏ hàng</a>
                        <a href="#" class="cart-btn checkout" onclick="shoppingCart.checkout()">Thanh toán</a>
                    </div>
                </div>
            </div>
            `;

            // Thêm vào header
            const authSection = document.querySelector('.auth-section');
            if (authSection) {
                authSection.insertAdjacentHTML('afterend', cartHtml);
            }
        }
    }

    bindEvents() {
        const cartIcon = document.getElementById('cartIcon');
        const cartDropdown = document.getElementById('cartDropdown');

        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                cartDropdown.classList.toggle('active');
            });
        }

        // Đóng giỏ hàng khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (cartDropdown && !cartIcon.contains(e.target) && !cartDropdown.contains(e.target)) {
                cartDropdown.classList.remove('active');
            }
        });

        // Ngăn đóng giỏ hàng khi tương tác bên trong
        if (cartDropdown) {
            cartDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    addToCart(book) {
        const existingItem = this.cart.find(item => item.id === book.id);

        let imageUrl = 'https://via.placeholder.com/200x280/4a6cf7/ffffff?text=Không+có+ảnh';

        // Kiểm tra nếu có ảnh
        if (book.images && book.images.length > 0) {
            // Thêm timestamp để tránh cache
            const timestamp = new Date().getTime();
            imageUrl = `/images/book/${book.images[0]}?t=${timestamp}`;
        } else if (book.image_url) {
            // Nếu có image_url từ API
            imageUrl = book.image_url;
        }

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: book.id,
                title: book.title,
                price: book.price,
                image: imageUrl,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification(`Đã thêm "${book.title}" vào giỏ hàng`);

        // Giữ giỏ hàng mở
        const cartDropdown = document.getElementById('cartDropdown');
        if (cartDropdown) {
            cartDropdown.classList.add('active');
        }
    }

    changeQuantity(bookId, change, event) {
        if (event) event.stopPropagation();

        const item = this.cart.find(item => item.id === bookId);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            this.cart = this.cart.filter(i => i.id !== bookId);
        }

        this.saveCart();
        this.updateCartUI();
    }

    // Hàm xóa toàn bộ sách khỏi giỏ hàng
    removeFromCart(bookId, event) {
        if (event) event.stopPropagation();

        const item = this.cart.find(item => item.id === bookId);
        if (!item) return;

        this.cart = this.cart.filter(i => i.id !== bookId);
        this.saveCart();
        this.updateCartUI();
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartCount) return;

        // Cập nhật số lượng
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Cập nhật danh sách sản phẩm
        if (this.cart.length === 0) {
            if (cartEmpty) cartEmpty.style.display = 'block';
            if (cartItems) cartItems.innerHTML = '';
            if (cartEmpty && cartItems) cartItems.appendChild(cartEmpty);
        } else {
            if (cartEmpty) cartEmpty.style.display = 'none';
            if (cartItems) {
                cartItems.innerHTML = '';

                this.cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.title}</h4>
                            <p class="cart-item-price">${this.formatPrice(item.price)} x ${item.quantity}</p>
                            <div class="cart-item-quantity">
                                <button onclick="shoppingCart.changeQuantity(${item.id}, -1, event)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="shoppingCart.changeQuantity(${item.id}, 1, event)">+</button>
                            </div>
                        </div>
                        <button class="cart-item-delete" onclick="shoppingCart.removeFromCart(${item.id}, event)" title="Xóa sách này">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    cartItems.appendChild(cartItem);
                });
            }
        }

        // Cập nhật tổng tiền
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) cartTotal.textContent = this.formatPrice(total);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    loadCartFromStorage() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartUI();
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');

        // Màu sắc khác nhau cho các loại thông báo
        const colors = {
            success: '#4cc9f0', // Xanh
            warning: '#ff9800', // Cam
            error: '#f72585'    // Red
        };

        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: ${colors[type] || colors.success};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        // Icon khác nhau cho các loại thông báo
        const icons = {
            success: 'fa-check-circle',
            warning: 'fa-exclamation-circle',
            error: 'fa-exclamation-triangle'
        };

        notification.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i> ${message}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    // Trong lớp ShoppingCart, thêm phương thức này
    checkout() {
        if (this.cart.length === 0) {
            // Hiển thị thông báo lỗi màu đỏ và KHÔNG chuyển hướng
            this.showNotification('Giỏ hàng của bạn đang trống!', 'warning');

            // Làm rung nút thanh toán để thu hút sự chú ý
            const checkoutBtn = document.querySelector('.cart-btn.checkout');
            if (checkoutBtn) {
                checkoutBtn.classList.add('shake');
                setTimeout(() => {
                    checkoutBtn.classList.remove('shake');
                }, 500);
            }

            return false; // Ngăn không cho thực hiện hành động mặc định
        }

        // Lưu giỏ hàng vào sessionStorage để trang thanh toán có thể truy cập
        sessionStorage.setItem('checkoutCart', JSON.stringify(this.cart));

        // Chuyển hướng đến trang thanh toán
        window.location.href = '/auth/pay'; // Thay đổi đường dẫn theo thực tế
        return true;
    }
}

// Khởi tạo giỏ hàng toàn cục
const shoppingCart = new ShoppingCart();