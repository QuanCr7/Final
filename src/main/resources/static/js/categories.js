// JavaScript để tải danh sách thể loại từ API
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();

    // Xử lý menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    mobileMenuBtn.addEventListener('click', function() {
        navList.classList.toggle('active');
    });
});

function loadCategories() {
    // Gọi API thực tế để lấy danh sách thể loại
    fetch('/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải danh sách thể loại');
            }
            return response.json();
        })
        .then(data => {
            const categories = data.data || [];
            renderCategories(categories);
        })
        .catch(error => {
            console.error('Lỗi khi tải danh mục:', error);
        });
}

function renderCategories(categories) {
    const dropdown = document.querySelector('.categories-container');
    dropdown.innerHTML = ''; // Xóa nội dung cũ

    if (categories.length === 0) {
        dropdown.innerHTML = '<div class="category-item">Không có thể loại nào</div>';
        return;
    }

    // Chia danh sách thể loại thành 3 cột
    const itemsPerColumn = Math.ceil(categories.length / 3);
    const columns = [[], [], []];

    categories.forEach((category, index) => {
        const columnIndex = Math.floor(index / itemsPerColumn);
        // Nếu category là object (có id và name), sử dụng name
        const categoryName = typeof category === 'object' ? category.name : category;
        const categoryId = typeof category === 'object' ? category.id : null;

        columns[columnIndex].push({name: categoryName, id: categoryId});
    });

    // Tạo các cột và mục thể loại
    columns.forEach(columnCategories => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'category-column';

        columnCategories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';

            const categoryLink = document.createElement('a');
            // Tạo URL dựa trên category id nếu có
            categoryLink.href = category.id ? `/search?categoryIds=${category.id}` : '#';
            categoryLink.className = 'category-link';
            categoryLink.textContent = category.name;

            // Thêm sự kiện click để xử lý (không chuyển trang)
            categoryLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Xử lý khi click vào thể loại
                filterByCategory(category.name, category.id);
            });

            categoryItem.appendChild(categoryLink);
            columnDiv.appendChild(categoryItem);
        });

        dropdown.appendChild(columnDiv);
    });
}

// Hàm lọc theo thể loại
function filterByCategory(categoryName, categoryId) {
    console.log(`Lọc sách theo thể loại: ${categoryName} (ID: ${categoryId})`);

    // Chuyển hướng đến trang tìm kiếm với thể loại đã chọn
    if (categoryId) {
        window.location.href = `/search?categoryIds=${categoryId}`;
    } else {
        // Nếu không có ID, sử dụng tìm kiếm bằng tên
        window.location.href = `/search?title=${encodeURIComponent(categoryName)}`;
    }
}
