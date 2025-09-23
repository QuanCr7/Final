document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    setupImagePreview();
    setupFormSubmit();
});

function loadCategories() {
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
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải danh mục:', error);
            container.innerHTML = '<div class="error-categories">Lỗi khi tải thể loại</div>';
        });
}

function setupImagePreview() {
    const imageInput = document.getElementById('images');
    const previewContainer = document.getElementById('imagePreview');

    imageInput.addEventListener('change', function() {
        previewContainer.innerHTML = '';
        if (this.files) {
            Array.from(this.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'image-preview-item';

                    const img = document.createElement('img');
                    img.src = e.target.result;

                    const removeBtn = document.createElement('button');
                    removeBtn.innerHTML = '×';
                    removeBtn.onclick = function() {
                        previewItem.remove();
                        // Xóa file khỏi danh sách chọn (cần thêm logic phức tạp hơn)
                    };

                    previewItem.appendChild(img);
                    previewItem.appendChild(removeBtn);
                    previewContainer.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            });
        }
    });
}

function setupFormSubmit() {
    const form = document.getElementById('addBookForm');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData();

        // Thêm các trường dữ liệu vào formData
        formData.append('title', document.getElementById('title').value);
        formData.append('author', document.getElementById('author').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('publisher', document.getElementById('publisher').value);
        formData.append('description', document.getElementById('description').value);

        // Thêm các thể loại được chọn
        const selectedCategories = Array.from(document.querySelectorAll('input[name="categories"]:checked'))
            .map(checkbox => checkbox.value);
        selectedCategories.forEach(categoryId => {
            formData.append('categories', categoryId);
        });

        // Thêm các file ảnh
        const imageInput = document.getElementById('images');
        for (let i = 0; i < imageInput.files.length; i++) {
            formData.append('images', imageInput.files[i]);
        }

        // Hiển thị loading
        loadingElement.textContent = 'Đang thêm sách...';
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';

        // Gửi yêu cầu
        fetch('/book/add', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Thêm sách không thành công');
                }
                return response.json();
            })
            .then(data => {
                loadingElement.style.display = 'none';
                alert('Thêm sách thành công!');
                window.location.href = '/auth/admin';
            })
            .catch(error => {
                loadingElement.style.display = 'none';
                errorElement.textContent = error.message;
                errorElement.style.display = 'block';
                console.error('Lỗi khi thêm sách:', error);
            });
    });
}
