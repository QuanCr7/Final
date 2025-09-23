document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (!bookId) {
        showError('Không tìm thấy ID sách');
        return;
    }

    loadBookDetail(bookId);

    // Thiết lập xử lý sự kiện cho modal xóa
    setupDeleteModal();
});

function loadBookDetail(bookId) {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const bookDetailElement = document.getElementById('book-detail');

    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    bookDetailElement.style.display = 'none';

    fetch(`/book/searchId/${bookId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không tìm thấy sách');
            }
            return response.json();
        })
        .then(data => {
            loadingElement.style.display = 'none';

            if (data.data) {
                renderBookDetail(data.data);
                bookDetailElement.style.display = 'grid';
            } else {
                throw new Error('Không có dữ liệu sách');
            }
        })
        .catch(error => {
            loadingElement.style.display = 'none';
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
            console.error('Lỗi khi tải chi tiết sách:', error);
        });
}

function renderBookDetail(book) {
    const bookDetailElement = document.getElementById('book-detail');

    // Tạo HTML cho chi tiết sách
    bookDetailElement.innerHTML = `
            <div class="image-card">
                <img id="mainImage" class="book-image" src="${book.images && book.images.length > 0 ? '/images/book/' + book.images[0] : '/images/book/default.jpg'}"
                     onerror="this.src='/images/book/default.jpg'">
                ${book.images && book.images.length > 1 ? `
                <div class="thumbnail-container">
                    ${book.images.map((image, index) => `
                        <img src="/images/book/${image}" class="thumbnail"
                             onclick="changeImage(this, ${index})">
                    `).join('')}
                </div>
                ` : ''}
            </div>

            <div class="info-card">
                <div class="card-header">
                    <h3 class="card-title">Thông tin chi tiết</h3>
                </div>

                <div class="section">
                    <h4 class="section-title">Thông tin cơ bản</h4>
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-label">ID</div>
                            <div class="info-value">${book.id}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Tiêu đề</div>
                            <div class="info-value">${book.title || 'Chưa cập nhật'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Tác giả</div>
                            <div class="info-value">${book.author || 'Chưa cập nhật'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Nhà xuất bản</div>
                            <div class="info-value">${book.publisher || 'Chưa cập nhật'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Ngày phát hành</div>
                            <div class="info-value">${book.post_date ? formatDate(book.post_date) : 'Chưa cập nhật'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Giá</div>
                            <div class="info-value">${book.price ? formatPrice(book.price) : 'Chưa cập nhật'}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h4 class="section-title">Thể loại</h4>
                    ${book.categories && book.categories.length > 0 ? `
                    <div class="categories-container">
                        ${book.categories.map(category => `
                            <span class="category-badge">${category.name}</span>
                        `).join('')}
                    </div>
                    ` : '<div class="info-value">Chưa có thể loại</div>'}
                </div>

                <div class="section">
                    <h4 class="section-title">Mô tả</h4>
                    <div class="info-group">
                        <div class="info-value">${book.description || 'Chưa có mô tả'}</div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="editBook(${book.id})">
                        <i class="fas fa-edit"></i> Chỉnh sửa
                    </button>
                    <button class="btn btn-danger" onclick="showDeleteConfirmation(${book.id}, '${book.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash"></i> Xóa sách
                    </button>
                </div>
            </div>
        `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function changeImage(element, index) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');

    // Cập nhật ảnh chính
    mainImage.src = element.src;

    // Cập nhật trạng thái active của thumbnail
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

function editBook(bookId) {
    window.location.href = `/update?id=${bookId}`;
}

function showDeleteConfirmation(bookId, bookTitle) {
    document.getElementById('deleteBookId').textContent = bookId;
    document.getElementById('deleteBookTitle').textContent = bookTitle;
    document.getElementById('deleteModal').classList.add('active');
}

function setupDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    const closeModalBtn = document.getElementById('closeDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const confirmDeleteBtn = document.getElementById('confirmDelete');

    // Đóng modal
    closeModalBtn.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    // Xác nhận xóa
    confirmDeleteBtn.addEventListener('click', () => {
        const bookId = document.getElementById('deleteBookId').textContent;
        deleteBook(bookId);
        deleteModal.classList.remove('active');
    });

    // Đóng modal khi click bên ngoài
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
        }
    });
}

function deleteBook(bookId) {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');

    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';

    fetch(`/book/delete/${bookId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Xóa sách không thành công');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Xóa sách thành công!', 'success');
            setTimeout(() => {
                window.location.href = '/auth/admin';
            }, 1500);
        })
        .catch(error => {
            loadingElement.style.display = 'none';
            showNotification(error.message, 'error');
            console.error('Lỗi khi xóa sách:', error);
        });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');

    messageElement.textContent = message;
    notification.className = 'notification';

    if (type === 'error') {
        notification.classList.add('error');
        notification.querySelector('i').className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        notification.classList.add('warning');
        notification.querySelector('i').className = 'fas fa-exclamation-triangle';
    } else {
        notification.querySelector('i').className = 'fas fa-check-circle';
    }

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}