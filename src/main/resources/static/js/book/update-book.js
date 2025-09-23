document.addEventListener('DOMContentLoaded', function() {
    // Lấy ID sách từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (bookId) {
        document.getElementById('bookId').value = bookId;
        loadBookData(bookId);
        loadCategories();
    } else {
        alert('Không tìm thấy ID sách');
        window.location.href = '/';
    }

    // Xử lý submit form
    document.getElementById('updateBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateBook();
    });

    // Xử lý hiển thị preview ảnh
    document.getElementById('images').addEventListener('change', function(e) {
        previewImages(e.target.files);
    });
});

// Hàm tải dữ liệu sách
function loadBookData(bookId) {
    fetch(`/book/searchId/${bookId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu sách');
            }
            return response.json();
        })
        .then(data => {
            if (data.data) {
                const book = data.data;
                // Điền dữ liệu vào form
                document.getElementById('title').value = book.title;
                document.getElementById('author').value = book.author;
                document.getElementById('price').value = book.price;
                document.getElementById('description').value = book.description || '';
                document.getElementById('publisher').value = book.publisher || '';

                // Hiển thị ảnh hiện tại
                if (book.images && book.images.length > 0) {
                    const previewContainer = document.getElementById('imagePreview');
                    previewContainer.innerHTML = '';
                    book.images.forEach(image => {
                        const img = document.createElement('img');
                        img.src = `/images/book/${image}`;
                        previewContainer.appendChild(img);
                    });
                }
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu sách:', error);
            alert(error.message);
            window.location.href = '/';
        });
}

// Hàm tải danh sách danh mục
function loadCategories() {
    fetch('/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải danh sách danh mục');
            }
            return response.json();
        })
        .then(data => {
            if (data.data) {
                renderCategories(data.data);
                // Sau khi load xong danh sách, load thông tin sách để check các danh mục đã chọn
                loadBookData(document.getElementById('bookId').value);
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải danh mục:', error);
            document.getElementById('categoryError').textContent = 'Không thể tải danh sách danh mục';
        });
}

// Hàm hiển thị danh mục dưới dạng checkbox với giao diện bo tròn
function renderCategories(categories) {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<p>Không có danh mục nào</p>';
        return;
    }

    // Load book data để lấy danh mục đã chọn
    const bookId = document.getElementById('bookId').value;
    fetch(`/book/searchId/${bookId}`)
        .then(response => response.json())
        .then(bookData => {
            if (bookData.data) {
                const book = bookData.data;
                const selectedCategoryIds = book.categories ?
                    new Set(Array.from(book.categories).map(c => c.id)) : new Set();

                categories.forEach(category => {
                    const div = document.createElement('div');
                    div.className = `category-item ${selectedCategoryIds.has(category.id) ? 'selected' : ''}`;
                    div.innerHTML = `
                        <input type="checkbox" 
                               id="category_${category.id}" 
                               name="categories" 
                               value="${category.id}"
                               ${selectedCategoryIds.has(category.id) ? 'checked' : ''}>
                        <label for="category_${category.id}">${category.name}</label>
                    `;

                    // Thêm sự kiện click để thay đổi trạng thái
                    div.addEventListener('click', function(e) {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                        this.classList.toggle('selected', checkbox.checked);

                        // Kiểm tra ít nhất 1 category được chọn
                        validateCategories();
                    });

                    container.appendChild(div);
                });
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải thông tin sách:', error);
            // Nếu không load được thông tin sách, vẫn hiển thị danh sách category
            categories.forEach(category => {
                const div = document.createElement('div');
                div.className = 'category-item';
                div.innerHTML = `
                    <input type="checkbox" 
                           id="category_${category.id}" 
                           name="categories" 
                           value="${category.id}">
                    <label for="category_${category.id}">${category.name}</label>
                `;

                div.addEventListener('click', function(e) {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    this.classList.toggle('selected', checkbox.checked);
                    validateCategories();
                });

                container.appendChild(div);
            });
        });
}

// Hàm hiển thị preview ảnh
function previewImages(files) {
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '';

    if (files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
}

// Hàm kiểm tra ít nhất 1 category được chọn
function validateCategories() {
    const selectedCategories = document.querySelectorAll('input[name="categories"]:checked');
    const categoryError = document.getElementById('categoryError');

    if (selectedCategories.length === 0) {
        categoryError.textContent = 'Vui lòng chọn ít nhất một danh mục';
        return false;
    }

    categoryError.textContent = '';
    return true;
}

function validateForm() {
    const selectedCategory = document.querySelector('input[name="categories"]:checked');
    const categoryError = document.getElementById('categoryError');

    if (!selectedCategory) {
        categoryError.textContent = 'Vui lòng chọn ít nhất một danh mục';
        return false;
    }

    categoryError.textContent = '';
    return true;
}

// Hàm cập nhật sách
function updateBook() {
    if (!validateCategories()) {
        return; // Dừng nếu không có category nào được chọn
    }

    const bookId = document.getElementById('bookId').value;
    const formData = new FormData();

    // Thêm các trường dữ liệu vào FormData
    formData.append('title', document.getElementById('title').value);
    formData.append('author', document.getElementById('author').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('publisher', document.getElementById('publisher').value);

    // Thêm danh mục được chọn (nhiều checkbox)
    const selectedCategories = document.querySelectorAll('input[name="categories"]:checked');
    selectedCategories.forEach(checkbox => {
        formData.append('categories', checkbox.value);
    });

    // Thêm ảnh mới (nếu có)
    const imageFiles = document.getElementById('images').files;
    if (imageFiles && imageFiles.length > 0) {
        Array.from(imageFiles).forEach(file => {
            formData.append('images', file);
        });
    }

    // Gửi yêu cầu cập nhật
    fetch(`/book/update/${bookId}`, {
        method: 'PUT',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Cập nhật không thành công');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Cập nhật sách thành công');
            window.history.back();
        })
        .catch(error => {
            console.error('Lỗi khi cập nhật sách:', error);
            alert(error.message);
        });
}