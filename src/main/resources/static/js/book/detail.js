let currentBook = null; // Biến để lưu thông tin sách

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (!bookId) {
        showError('Không tìm thấy ID sách');
        return;
    }

    loadBookDetail(bookId);

    // Xử lý nút thêm vào giỏ hàng
    document.getElementById('addBtn').addEventListener('click', function() {
        if (currentBook) {
            shoppingCart.addToCart(currentBook); // Gọi hàm thêm vào giỏ hàng
        } else {
            showError('Không thể thêm sách vào giỏ hàng: Dữ liệu sách không khả dụng');
        }
    });
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
                currentBook = data.data; // Lưu thông tin sách vào biến currentBook
                renderBookDetail(data.data);
                bookDetailElement.style.display = 'block';
            } else {
                throw new Error('Không có dữ liệu sách');
            }
        })
        .catch(

            error => {
            loadingElement.style.display = 'none';
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
            console.error('Lỗi khi tải chi tiết sách:', error);
        });
}

function renderBookDetail(book) {
    // Hiển thị thông tin cơ bản
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = book.author;
    document.getElementById('bookPublisher').textContent = book.publisher;
    document.getElementById('bookPrice').textContent = book.price.toLocaleString('vi-VN')+ "đ";
    document.getElementById('bookDescription').textContent = book.description || 'Không có mô tả';

    // Định dạng ngày
    const postDate = new Date(book.post_date);
    document.getElementById('bookDate').textContent = postDate.toLocaleDateString('vi-VN');

    // Hiển thị thể loại
    const categoriesContainer = document.getElementById('bookCategories');
    categoriesContainer.innerHTML = '';

    if (book.categories && book.categories.length > 0) {
        book.categories.forEach(category => {
            const badge = document.createElement('span');
            badge.className = 'category-badge';
            badge.textContent = category.name;
            categoriesContainer.appendChild(badge);
        });
    } else {
        categoriesContainer.innerHTML = '<span>Không có thể loại</span>';
    }

    // Hiển thị ảnh
    const mainImage = document.getElementById('mainImage');
    const thumbnailsContainer = document.getElementById('thumbnails');
    thumbnailsContainer.innerHTML = '';

    if (book.images && book.images.length > 0) {
        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();

        // Hiển thị ảnh đầu tiên làm ảnh chính
        mainImage.src = `/images/book/${book.images[0]}?t=${timestamp}`;

        // Tạo thumbnail cho tất cả ảnh
        book.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'thumbnail';
            thumbnail.src = `/images/book/${image}?t=${timestamp}`;
            thumbnail.alt = `Ảnh ${index + 1}`;
            thumbnail.onclick = function() {
                mainImage.src = this.src;
            };
            thumbnailsContainer.appendChild(thumbnail);
        });
    } else {
        mainImage.src = 'https://via.placeholder.com/400x600?text=Không+có+ảnh';
    }
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}