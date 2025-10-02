// /js/user/orderuser.js
document.addEventListener('DOMContentLoaded', async function() {
    const API_BASE_URL = 'http://localhost:8080';
    let currentPage = 1;

    const isLoggedIn = await checkLoginStatus();
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');
    const ordersContent = document.getElementById('ordersContent');

    if (!isLoggedIn) {
        console.log('orderuser.js: Chưa đăng nhập, hiển thị lỗi');
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement && errorTextElement) {
            errorElement.style.display = 'flex';
            errorTextElement.textContent = 'Bạn cần đăng nhập để xem trang này!';
            showError('Bạn cần đăng nhập để xem trang này!');
        } else {
            console.error('orderuser.js: Không tìm thấy errorMessage hoặc errorText trong DOM');
            alert('Bạn cần đăng nhập để xem trang này!');
        }
        return;
    }

    // Tải danh sách đơn hàng từ URL hoặc trang đầu tiên
    if (window.location.search !== '') {
        loadFromUrl();
    } else {
        loadOrders(currentPage);
    }

    window.addEventListener('popstate', loadFromUrl);

    // Gán sự kiện cho nút phân trang
    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadOrders(currentPage);
        }
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
        currentPage++;
        loadOrders(currentPage);
    });
});

async function loadOrders(page, updateUrlFlag = true) {
    const API_BASE_URL = 'http://localhost:8080';
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');
    const ordersContent = document.getElementById('ordersContent');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const paginationElement = document.getElementById('pagination');

    try {
        if (!getAccessToken()) {
            console.log('loadOrders: Không có accessToken, thử làm mới token');
            const refreshed = await checkLoginStatus();
            if (!refreshed) {
                throw new Error('Bạn cần đăng nhập để xem trang này!');
            }
        }

        if (loadingElement) loadingElement.style.display = 'flex';
        if (errorElement) errorElement.style.display = 'none';
        if (ordersContent) ordersContent.style.display = 'none';
        if (ordersTableBody) ordersTableBody.innerHTML = '';
        if (paginationElement) paginationElement.innerHTML = '';

        const response = await fetch(`${API_BASE_URL}/order/user?page=${page}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log('orderuser.js: Orders response:', JSON.stringify(data, null, 2));

        if (response.ok && data.code === 200) {
            if (updateUrlFlag) {
                updateUrl({ page: page !== 1 ? page : undefined });
            }
            displayOrders(data.data);
            renderPagination(data.data.currentPage, data.data.totalPages);
            if (ordersContent) ordersContent.style.display = 'block';
            if (loadingElement) loadingElement.style.display = 'none';
        } else {
            throw new Error(data.message || 'Không thể lấy danh sách đơn hàng');
        }
    } catch (error) {
        console.error('orderuser.js: Lỗi:', error);
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement && errorTextElement) {
            errorElement.style.display = 'flex';
            errorTextElement.textContent = error.message;
            showError(error.message);
        }
        if (ordersTableBody) {
            ordersTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #6c757d;">Không có đơn hàng nào</td></tr>';
        }
    }
}

function displayOrders(pageData) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    ordersTableBody.innerHTML = '';

    if (pageData.orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #6c757d;">Không có đơn hàng nào</td></tr>';
        return;
    }

    pageData.orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${formatDate(order.orderDate)}</td>
            <td>${order.shippingAddress || 'N/A'}</td>
            <td>${order.email || 'N/A'}</td>
            <td>${order.phone || 'N/A'}</td>
            <td>${formatPrice(order.totalAmount)}</td>
            <td>${order.status || 'N/A'}</td>
            <td><a href="/me/order/detail?id=${order.id}" class="btn info-btn"><i class="fas fa-info-circle"></i> Chi tiết</a></td>
        `;
        ordersTableBody.appendChild(row);
    });
}

function renderPagination(currentPage, totalPages) {
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';

    // Tạo nút Previous
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.onclick = function () {
            loadOrders(currentPage - 1);
        };
        paginationElement.appendChild(prevButton);
    }

    // Hiển thị các trang gần currentPage
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // Nút trang đầu tiên
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.textContent = '1';
        firstPageButton.onclick = function () {
            loadOrders(1);
        };
        paginationElement.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '10px';
            paginationElement.appendChild(ellipsis);
        }
    }

    // Các trang chính
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.onclick = function () {
            loadOrders(i);
        };
        paginationElement.appendChild(pageButton);
    }

    // Nút trang cuối cùng
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '10px';
            paginationElement.appendChild(ellipsis);
        }

        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = function () {
            loadOrders(totalPages);
        };
        paginationElement.appendChild(lastPageButton);
    }

    // Tạo nút Next
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.onclick = function () {
            loadOrders(currentPage + 1);
        };
        paginationElement.appendChild(nextButton);
    }
}

function updateUrl(params) {
    const url = new URL(window.location.href);
    ['page'].forEach(param => url.searchParams.delete(param));
    if (params.page && params.page !== 1) {
        url.searchParams.set('page', params.page);
    }
    window.history.pushState({}, '', url.toString());
}

function loadFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    loadOrders(page, false);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { dateStyle: 'medium' });
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}