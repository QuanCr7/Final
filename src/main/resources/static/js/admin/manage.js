let currentPage = 1;
let currentBookToDelete = null;
let currentAccountToDelete = null;

// Gọi khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý chuyển tab
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // Xóa active class từ tất cả các tab và nội dung
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Thêm active class vào tab được click
            this.classList.add('active');

            // Hiển thị nội dung tab tương ứng
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Nếu click vào tab users, tải dữ liệu account
            if (tabId === 'users') {
                fetchAccounts(1);
            }
        });
    });

    // Xử lý modal xóa
    const deleteModal = document.getElementById('deleteModal');
    const closeModal = document.getElementById('closeModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    closeModal.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    cancelDelete.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    confirmDelete.addEventListener('click', () => {
        if (currentBookToDelete) {
            performDeleteBook(currentBookToDelete.id);
        }
        if (currentAccountToDelete) {
            performDeleteAccount(currentAccountToDelete.id);
        }
        deleteModal.classList.remove('active');
    });

    // Đóng modal khi click bên ngoài
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
        }
    });

    // Tải dữ liệu sách
    fetchBooks();
});

function fetchAccounts(page = 1){
    currentPage = page;

    const accountsTableBody = document.getElementById('accounts-table-body');
    const paginationElement = document.getElementById('pagination-accounts');

    accountsTableBody.innerHTML = '<tr><td colspan="9" class="loading"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</td></tr>';
    if (paginationElement) {
        paginationElement.innerHTML = '';
    }

    // Sửa endpoint và xử lý response đúng cấu trúc
    fetch(`/account?page=${page}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu tài khoản')
            }
            return response.json();
        })
        .then(data => {
            if (data.data?.users?.length > 0) {
                renderAccounts(data.data.users);
                renderAccountsPagination(data.data.currentPage, data.data.totalPages);
            } else {
                accountsTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #6c757d;">Không có tài khoản nào</td></tr>';
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu account:', error);
            accountsTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle"></i> ${error.message}
                </td></tr>`;
        });
}

function renderAccounts(users){
    const accountsTableBody = document.getElementById('accounts-table-body');
    accountsTableBody.innerHTML = '';

    users.forEach(account => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${account.id}</td>
            <td>${account.username}</td>
            <td>${account.fullName}</td>
            <td>${account.email}</td>
            <td>${account.phone || 'N/A'}</td>
            <td>${account.address || 'N/A'}</td>
            <td>${formatDate(account.dateCreate)}</td>
            <td class="action-buttons">
                <button class="action-btn view" onclick="viewAccountDetail(${account.id})" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete" onclick="showDeleteAccountConfirmation(${account.id}, '${account.username.replace(/'/g, "\\'")}')" title="Xóa tài khoản">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        accountsTableBody.appendChild(row);
    });
}

// Hàm xem chi tiết tài khoản
function viewAccountDetail(accountId) {
    window.location.href = `/detail-user?id=${accountId}`;
}

function renderAccountsPagination(currentPage, totalPages) {
    const paginationElement = document.getElementById('pagination-accounts');
    if (!paginationElement) return;

    paginationElement.innerHTML = '';

    // Tạo nút Previous
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.onclick = function () {
            fetchAccounts(currentPage - 1);
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
            fetchAccounts(1);
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
            fetchAccounts(i);
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
            fetchAccounts(totalPages);
        };
        paginationElement.appendChild(lastPageButton);
    }

    // Tạo nút Next
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.onclick = function () {
            fetchAccounts(currentPage + 1);
        };
        paginationElement.appendChild(nextButton);
    }
}

// Hàm định dạng ngày
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return dateString;
    }
}

// Hiển thị modal xác nhận xóa account
function showDeleteAccountConfirmation(accountId, accountUsername) {
    document.getElementById('bookId').textContent = accountId;
    document.getElementById('bookTitle').textContent = accountUsername;
    currentAccountToDelete = { id: accountId, username: accountUsername };
    currentBookToDelete = null;

    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.add('active');
}

// Thực hiện xóa account
function performDeleteAccount(accountId) {
    fetch(`/account/delete/${accountId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Xóa tài khoản không thành công');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Xóa tài khoản thành công', 'success');
            fetchAccounts(currentPage);
        })
        .catch(error => {
            showNotification(error.message, 'error');
            console.error('Lỗi khi xóa tài khoản:', error);
        });
}

// Hàm lấy danh sách sách từ API
function fetchBooks(page = 1) {
    currentPage = page;

    const booksTableBody = document.getElementById('books-table-body');
    const paginationElement = document.getElementById('pagination');

    // Hiển thị trạng thái loading
    booksTableBody.innerHTML = '<tr><td colspan="6" class="loading"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</td></tr>';
    if (paginationElement) {
        paginationElement.innerHTML = '';
    }

    // Gọi API để lấy dữ liệu sách
    fetch(`/home?page=${page}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu sách');
            }
            return response.json();
        })
        .then(data => {
            if (data.data?.books?.length > 0) {
                renderBooks(data.data.books);
                renderPagination(data.data.currentPage, data.data.totalPages);
            } else {
                booksTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6c757d;">Không có sách nào</td></tr>';
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
            booksTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle"></i> ${error.message}
                </td></tr>`;
        });
}

// Hàm hiển thị danh sách sách
function renderBooks(books) {
    const booksTableBody = document.getElementById('books-table-body');
    booksTableBody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');

        row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.categories?.map(c => c.name).join(', ') || book.category || 'N/A'}</td>
                <td>${book.price.toLocaleString('vi-VN')}₫</td>
                <td class="action-buttons">
                    <button class="action-btn view" onclick="viewBookDetail(${book.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editBook(${book.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="showDeleteConfirmation(${book.id}, '${book.title.replace(/'/g, "\\'")}')" title="Xóa sách">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

        booksTableBody.appendChild(row);
    });
}

// Hàm tạo phân trang
function renderPagination(currentPage, totalPages) {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;

    paginationElement.innerHTML = '';

    // Tạo nút Previous
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.onclick = function () {
            fetchBooks(currentPage - 1);
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
            fetchBooks(1);
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
            fetchBooks(i);
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
            fetchBooks(totalPages);
        };
        paginationElement.appendChild(lastPageButton);
    }

    // Tạo nút Next
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.onclick = function () {
            fetchBooks(currentPage + 1);
        };
        paginationElement.appendChild(nextButton);
    }
}

// Hiển thị modal xác nhận xóa sách
function showDeleteConfirmation(bookId, bookTitle) {
    document.getElementById('bookId').textContent = bookId;
    document.getElementById('bookTitle').textContent = bookTitle;
    currentBookToDelete = { id: bookId, title: bookTitle };
    currentAccountToDelete = null;

    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.add('active');
}

// Thực hiện xóa sách
function performDeleteBook(bookId) {
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
            showNotification('Xóa sách thành công', 'success');
            fetchBooks(currentPage);
        })
        .catch(error => {
            showNotification(error.message, 'error');
            console.error('Lỗi khi xóa sách:', error);
        });
}

// Hàm chứa đường dẫn xem chi tiết sách
function viewBookDetail(bookId) {
    window.location.href = `/book-detail?id=${bookId}`;
}

// Hàm chứa đường dẫn sửa sách
function editBook(bookId) {
    window.location.href = `/update?id=${bookId}`;
}

// Hàm hiển thị thông báo
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');

    // Đặt nội dung và kiểu thông báo
    messageElement.textContent = message;
    notification.className = 'notification';

    // Thêm lớp tương ứng với loại thông báo
    if (type === 'success') {
        notification.classList.add('success');
    } else if (type === 'error') {
        notification.classList.add('error');
    } else if (type === 'warning') {
        notification.classList.add('warning');
    }

    // Hiển thị thông báo
    notification.classList.add('show');

    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');

        // Xóa lớp hide sau khi hoàn thành animation
        setTimeout(() => {
            notification.classList.remove('hide');
        }, 300);
    }, 3000);
}