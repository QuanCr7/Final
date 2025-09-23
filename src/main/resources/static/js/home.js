let currentPage = 1;

// Gọi khi trang được tải
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.search !== '') {z
        loadFromUrl();
    } else {
        fetchBooks();
    }

    window.addEventListener('popstate', loadFromUrl);
});

// Hàm lấy danh sách sách từ API
function fetchBooks(page = 1, updateUrlFlag = true) {
    currentPage = page;

    if (updateUrlFlag) {
        updateUrl({page: page !== 1 ? page : undefined});
    }

    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const booksGrid = document.getElementById('booksGrid');
    const paginationElement = document.getElementById('pagination');

    loadingElement.style.display = 'flex';
    errorElement.style.display = 'none';
    booksGrid.innerHTML = '';
    paginationElement.innerHTML = '';

    fetch(`/home?page=${page}`)
        .then(handleResponse)
        .then(data => {
            loadingElement.style.display = 'none';
            if (data.data?.books?.length > 0) {
                renderBooks(data.data.books);
                renderPagination(data.data.currentPage, data.data.totalPages);
            } else {
                booksGrid.innerHTML = '<div class="no-books" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6c757d;">Không có sách nào</div>';
            }
        })
        .catch(error => handleError(error, loadingElement, errorElement));
}

// Hàm hiển thị danh sách sách dưới dạng grid
function renderBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = '';

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';

        const postDate = new Date(book.post_date);
        const formattedDate = postDate.toLocaleDateString('vi-VN');

        // Tạo URL ảnh - sử dụng ảnh đầu tiên nếu có, nếu không dùng placeholder
        let imageUrl = 'https://via.placeholder.com/200x280/4a6cf7/ffffff?text=Không+có+ảnh';

        // Kiểm tra nếu có ảnh (dựa trên cấu trúc từ detail.js)
        if (book.images && book.images.length > 0) {
            // Thêm timestamp để tránh cache
            const timestamp = new Date().getTime();
            imageUrl = `/images/book/${book.images[0]}?t=${timestamp}`;
        } else if (book.image_url) {
            // Nếu có image_url từ API
            imageUrl = book.image_url;
        }

        bookCard.innerHTML = `
                <div class="book-image-container">
                    <img src="${imageUrl}" alt="${book.title}" class="book-image" onerror="this.src='https://via.placeholder.com/200x280/4a6cf7/ffffff?text=Không+có+ảnh'">
                    <div class="book-overlay">
                        <div class="book-price">${book.price.toLocaleString('vi-VN')}đ</div>
                    </div>
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <div class="book-author">${book.author}</div>
                    <div class="book-categories">
                        ${book.categories?.map(c => `<span class="book-category">${c.name}</span>`).join('') || ''}
                    </div>
                    <div class="book-meta">
                        <span>${book.publisher}</span>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="book-actions">
                        <button class="action-btn view-btn" onclick="viewBookDetail(${book.id})">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                        <button class="action-btn add-btn" onclick="shoppingCart.addToCart(${JSON.stringify(book).replace(/"/g, '&quot;')})">
                            <i class="fas fa-cart-plus"></i> Thêm
                        </button>
                    </div>   
                </div>
            `;

        booksGrid.appendChild(bookCard);
    });
}

// Hàm tạo phân trang
function renderPagination(currentPage, totalPages) {
    const paginationElement = document.getElementById('pagination');
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

// Hàm chứa đường dẫn xem chi tiết sách
function viewBookDetail(bookId) {
    window.location.href = `/detail?id=${bookId}`;
}


// <button className="action-btn edit-btn" onClick="editBook(${book.id})">
//     <i className="fas fa-edit"></i> Sửa
// </button>
// <button className="action-btn delete-btn" onClick="deleteBook(${book.id})">
//     <i className="fas fa-trash"></i> Xóa
// </button>
// // Hàm chứa đường dẫn sách
// function editBook(bookId) {
//     window.location.href = `/update?id=${bookId}`;
// }
//
// // Hàm chứa đường dẫn xóa sách
// function deleteBook(bookId) {
//     if (confirm(`Bạn có chắc chắn muốn xóa sách có ID: ${bookId}?`)) {
//         const loadingElement = document.getElementById('loading');
//         loadingElement.style.display = 'flex';
//         loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Đang xóa sách...</p>';
//
//         fetch(`/book/delete/${bookId}`, {
//             method: 'DELETE'
//         })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Xóa sách không thành công');
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 loadingElement.style.display = 'none';
//                 showNotification('Xóa sách thành công', 'success');
//                 fetchBooks(currentPage);
//             })
//             .catch(error => {
//                 loadingElement.style.display = 'none';
//                 showNotification(error.message, 'error');
//                 console.error('Lỗi khi xóa sách:', error);
//             });
//     }
// }

// Hàm hiển thị thông báo
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px';
    notification.style.borderRadius = '4px';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    notification.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2.7s';

    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else {
        notification.style.backgroundColor = '#dc3545';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Hàm cập nhật URL
function updateUrl(params) {
    const url = new URL(window.location.href);

    // Xóa tất cả các params liên quan trước khi thêm mới
    ['page'].forEach(param => {
        url.searchParams.delete(param);
    });

    // Chỉ thêm page nếu khác 1
    if (params.page && params.page !== 1) {
        url.searchParams.set('page', params.page);
    }

    window.history.pushState({}, '', url.toString());
}

// Hàm tải dữ liệu từ URL
function loadFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 1;

    fetchBooks(page, false);
}

function handleResponse(response) {
    if (!response.ok) throw new Error('Không thể tải dữ liệu sách');
    return response.json();
}

function handleError(error, loadingElement, errorElement) {
    console.error('Lỗi khi tải dữ liệu:', error);
    loadingElement.style.display = 'none';
    errorElement.querySelector('.error-message').textContent = error.message;
    errorElement.style.display = 'flex';
}