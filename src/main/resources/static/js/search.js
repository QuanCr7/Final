
let currentPage = 1;

// Gọi khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadCategoriesForSearch();

    // Kiểm tra và khôi phục trạng thái từ sessionStorage nếu URL trống
    if (window.location.search === '' && sessionStorage.getItem('lastSearchState')) {
        try {
            const lastState = JSON.parse(sessionStorage.getItem('lastSearchState'));

            if (lastState && typeof lastState === 'object') {
                // THÊM DÒNG NÀY: Cập nhật URL trước khi load dữ liệu
                updateUrl(lastState);
                loadFromUrl();
                return;
            }
        } catch (e) {
            console.error('Lỗi khi parse lastSearchState:', e);
            sessionStorage.removeItem('lastSearchState');
        }
    }

    // Nếu không có trạng thái lưu trong sessionStorage hoặc URL không trống
    // Kiểm tra URL hiện tại để load dữ liệu phù hợp
    if (window.location.search !== '') {
        loadFromUrl();
    } else {
        fetchBooks(); // Load trang đầu tiên nếu không có thông tin tìm kiếm
    }

    // Xử lý submit form tìm kiếm
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleSearch(1); // Luôn bắt đầu từ trang 1 khi tìm kiếm mới
    });

    // Xử lý nút đặt lại
    document.getElementById('resetSearch').addEventListener('click', function() {
        document.getElementById('searchForm').reset();
        // Reset URL về trang đầu tiên
        window.history.pushState({}, '', window.location.pathname);
        // Xóa trạng thái tìm kiếm đã lưu
        sessionStorage.removeItem('lastSearchState');
        fetchBooks(1);
    });

    // Xử lý khi người dùng dùng nút back/forward
    window.addEventListener('popstate', function() {
        loadFromUrl();
    });
});

// Hàm tải danh sách thể loại cho dropdown
function loadCategoriesForSearch() {
    const container = document.getElementById('categoryCheckboxes');
    container.innerHTML = '<div class="loading-categories">Đang tải thể loại...</div>';

    fetch('/categories')
        .then(response => response.json())
        .then(data => {
            if (data.data) {
                container.innerHTML = '';
                data.data.forEach(category => {
                    const div = document.createElement('div');
                    div.className = 'category-item';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `category-${category.id}`;
                    checkbox.name = 'categories';
                    checkbox.value = category.id;

                    const label = document.createElement('label');
                    label.htmlFor = `category-${category.id}`;
                    label.textContent = category.name;

                    div.appendChild(checkbox);
                    div.appendChild(label);
                    container.appendChild(div);
                });

                // Khôi phục trạng thái nếu có
                if (window.location.search === '' && sessionStorage.getItem('lastSearchState')) {
                    const lastState = JSON.parse(sessionStorage.getItem('lastSearchState'));
                    if (lastState.checkedCategories) {
                        document.querySelectorAll('input[name="categories"]').forEach(checkbox => {
                            checkbox.checked = lastState.checkedCategories.includes(parseInt(checkbox.value));
                        });
                    }
                } else if (window.location.search !== '') {
                    loadFromUrl();
                }
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải danh mục:', error);
            container.innerHTML = '<div class="error-categories">Lỗi khi tải thể loại</div>';
        });
}

// Hàm xử lý tìm kiếm
function handleSearch(page = 1, updateUrlFlag = true) {
    const title = document.getElementById('searchTitle').value;
    const author = document.getElementById('searchAuthor').value;
    const selectedCategories = Array.from(document.querySelectorAll('input[name="categories"]:checked'))
        .map(checkbox => parseInt(checkbox.value));

    // Lưu trạng thái vào sessionStorage (bao gồm checkedCategories)
    const searchState = {
        page,
        title: title || undefined,
        author: author || undefined,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        checkedCategories: selectedCategories // Chỉ dùng cho việc khôi phục trạng thái checkbox
    };
    sessionStorage.setItem('lastSearchState', JSON.stringify(searchState));

    // Chỉ cập nhật các tham số cần thiết lên URL
    if (updateUrlFlag) {
        const urlParams = {
            title: title || undefined,
            author: author || undefined,
            categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
            page: page !== 1 ? page : undefined // Chỉ thêm page nếu khác 1
        };
        updateUrl(urlParams);
    }

    const apiParams = new URLSearchParams();
    apiParams.append('page', page);

    // Thêm các tham số nếu có giá trị
    if (title) apiParams.append('title', title);
    if (author) apiParams.append('author', author);
    if (selectedCategories.length > 0) {
        selectedCategories.forEach(id => {
            apiParams.append('categoryIds', id);
        });
    }

    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const booksGrid = document.getElementById('booksGrid');
    const paginationElement = document.getElementById('pagination');

    loadingElement.style.display = 'flex';
    errorElement.style.display = 'none';
    booksGrid.innerHTML = '';
    paginationElement.innerHTML = '';

    fetch(`/book/search?${apiParams.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu sách');
            }
            return response.json();
        })
        .then(data => {
            loadingElement.style.display = 'none';
            if (data.data && data.data.books && data.data.books.length > 0) {
                renderBooks(data.data.books);
                renderPagination(data.data.currentPage, data.data.totalPages);
            } else {
                booksGrid.innerHTML = '<div class="no-books" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6c757d;">Không tìm thấy sách phù hợp</div>';
            }
        })
        .catch(error => {
            loadingElement.style.display = 'none';
            errorElement.querySelector('.error-message').textContent = error.message;
            errorElement.style.display = 'flex';
            console.error('Lỗi khi tìm kiếm sách:', error);
        });
}

// Hàm lấy danh sách sách từ API
function fetchBooks(page = 1, updateUrlFlag = true) {
    currentPage = page;

    if (updateUrlFlag) {
        updateUrl({
            page: page !== 1 ? page : undefined
        });
    }

    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const booksGrid = document.getElementById('booksGrid');
    const paginationElement = document.getElementById('pagination');

    // Hiển thị trạng thái loading
    loadingElement.style.display = 'flex';
    errorElement.style.display = 'none';
    booksGrid.innerHTML = '';
    paginationElement.innerHTML = '';

    fetch(`/home?page=${page}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu sách');
            }
            return response.json();
        })
        .then(data => {
            loadingElement.style.display = 'none';

            if (data.data && data.data.books && data.data.books.length > 0) {
                renderBooks(data.data.books);
                renderPagination(data.data.currentPage, data.data.totalPages);
            } else {
                booksGrid.innerHTML = '<div class="no-books" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6c757d;">Không có sách nào</div>';
            }
        })
        .catch(error => {
            loadingElement.style.display = 'none';
            errorElement.querySelector('.error-message').textContent = error.message;
            errorElement.style.display = 'flex';
            console.error('Lỗi khi tải dữ liệu:', error);
        });
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
        prevButton.onclick = function() {
            if (isSearching()) {
                handleSearch(currentPage - 1);
            } else {
                fetchBooks(currentPage - 1);
            }
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
        firstPageButton.onclick = function() {
            if (isSearching()) {
                handleSearch(1);
            } else {
                fetchBooks(1);
            }
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
        pageButton.onclick = function() {
            if (isSearching()) {
                handleSearch(i);
            } else {
                fetchBooks(i);
            }
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
        lastPageButton.onclick = function() {
            if (isSearching()) {
                handleSearch(totalPages);
            } else {
                fetchBooks(totalPages);
            }
        };
        paginationElement.appendChild(lastPageButton);
    }

    // Tạo nút Next
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.onclick = function() {
            if (isSearching()) {
                handleSearch(currentPage + 1);
            } else {
                fetchBooks(currentPage + 1);
            }
        };
        paginationElement.appendChild(nextButton);
    }
}

// Thêm hàm kiểm tra
function isSearching() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('title') || urlParams.has('author') || urlParams.has('categoryIds');
}

// Hàm xem chi tiết sách
function viewBookDetail(bookId) {
    window.location.href = `/detail?id=${bookId}`;
}

// Hàm cập nhật URL
function updateUrl(params) {
    const url = new URL(window.location.href);

    // Xóa tất cả các params liên quan trước khi thêm mới
    ['title', 'author', 'categoryIds', 'page'].forEach(param => {
        url.searchParams.delete(param);
    });

    // Thêm các params theo thứ tự mong muốn
    if (params.title) {
        url.searchParams.set('title', params.title);
    }

    if (params.author) {
        url.searchParams.set('author', params.author);
    }

    if (params.categoryIds && params.categoryIds.length > 0) {
        params.categoryIds.forEach(id => {
            url.searchParams.append('categoryIds', id);
        });
    }

    // Chỉ thêm page nếu khác 1
    if (params.page && params.page !== 1) {
        url.searchParams.set('page', params.page);
    }

    window.history.pushState({}, '', url.toString());
}

// Hàm tải dữ liệu từ URL
function loadFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    // Nếu URL trống nhưng có sessionStorage, dùng sessionStorage
    if (window.location.search === '' && sessionStorage.getItem('lastSearchState')) {
        const lastState = JSON.parse(sessionStorage.getItem('lastSearchState'));
        updateUrl(lastState);

        // Khôi phục trạng thái checked của categories
        if (lastState.checkedCategories) {
            document.querySelectorAll('input[name="categories"]').forEach(checkbox => {
                checkbox.checked = lastState.checkedCategories.includes(parseInt(checkbox.value));
            });
        }

        return handleSearch(lastState.page || 1, false);
    }

    // Phần xử lý cũ giữ nguyên
    const page = urlParams.get('page') || 1;
    const title = urlParams.get('title');
    const author = urlParams.get('author');
    const categoryIds = urlParams.getAll('categoryIds').map(id => parseInt(id));

    // Áp dụng các giá trị từ URL vào form
    if (title) document.getElementById('searchTitle').value = title;
    if (author) document.getElementById('searchAuthor').value = author;

    // Chọn các checkbox thể loại và lưu vào sessionStorage
    if (categoryIds.length > 0) {
        document.querySelectorAll('input[name="categories"]').forEach(checkbox => {
            checkbox.checked = categoryIds.includes(parseInt(checkbox.value));
        });

        // Lưu trạng thái checked vào sessionStorage
        const searchState = {
            page,
            title: title || undefined,
            author: author || undefined,
            categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
            checkedCategories: categoryIds
        };
        sessionStorage.setItem('lastSearchState', JSON.stringify(searchState));
    }

    if (title || author || categoryIds.length > 0) {
        handleSearch(page, false);
    } else {
        fetchBooks(page, false);
    }
}

// Thêm CSS cho animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}
    @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
}
    `;
document.head.appendChild(style);
