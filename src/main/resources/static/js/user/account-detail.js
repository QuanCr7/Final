// JavaScript giống như trong mã HTML tôi đã cung cấp trước đó
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý modal chỉnh sửa
    const editModal = document.getElementById('editModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const saveChanges = document.getElementById('saveChanges');

    closeEditModal.addEventListener('click', () => {
        editModal.classList.remove('active');
    });

    cancelEdit.addEventListener('click', () => {
        editModal.classList.remove('active');
    });

    saveChanges.addEventListener('click', () => {
        updateAccount();
    });

    // Xử lý modal xóa
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDeleteBtn = document.getElementById('confirmDelete');

    closeDeleteModal.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    cancelDelete.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    confirmDeleteBtn.addEventListener('click', () => {
        const userId = document.getElementById('deleteUserId').textContent;
        deleteAccount(userId);
    });

    // Đóng modal khi click bên ngoài
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.remove('active');
        }
    });

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
        }
    });
});

function openEditModal(userId) {
    fetch(`/account/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải thông tin tài khoản');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const user = data.data;

                document.getElementById('editUserId').value = user.id;
                document.getElementById('editUsername').value = user.username;
                document.getElementById('editFullName').value = user.fullName || '';
                document.getElementById('editEmail').value = user.email || '';
                document.getElementById('editPhone').value = user.phone || '';
                document.getElementById('editAddress').value = user.address || '';
                document.getElementById('editDescription').value = user.description || '';
                document.getElementById('editDateOfBirth').value = user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '';

                document.getElementById('editModal').classList.add('active');
            } else {
                throw new Error(data.message || 'Lỗi khi tải thông tin tài khoản');
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải thông tin tài khoản:', error);
            showNotification(error.message, 'error');
        });
}

function updateAccount() {
    const userId = document.getElementById('editUserId').value;
    const userData = {
        username: document.getElementById('editUsername').value,
        fullName: document.getElementById('editFullName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value,
        description: document.getElementById('editDescription').value,
        dateOfBirth: document.getElementById('editDateOfBirth').value
    };

    fetch(`/account/update/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Cập nhật thông tin không thành công');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                document.getElementById('editModal').classList.remove('active');
                showNotification('Cập nhật thông tin thành công', 'success');
                location.reload(); // Tải lại trang để cập nhật thông tin
            } else {
                throw new Error(data.message || 'Cập nhật thông tin không thành công');
            }
        })
        .catch(error => {
            console.error('Lỗi khi cập nhật thông tin:', error);
            showNotification(error.message, 'error');
        });
}

function showDeleteConfirmation(userId, username) {
    document.getElementById('deleteUserId').textContent = userId;
    document.getElementById('deleteUserName').textContent = username;
    document.getElementById('deleteModal').classList.add('active');
}

function deleteAccount(userId) {
    fetch(`/account/delete/${userId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Xóa tài khoản không thành công');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                document.getElementById('deleteModal').classList.remove('active');
                showNotification('Xóa tài khoản thành công', 'success');

                // Chuyển hướng về trang quản lý user sau 1 giây
                setTimeout(() => {
                    window.location.href = '/auth/admin';
                }, 1000);
            } else {
                throw new Error(data.message || 'Xóa tài khoản không thành công');
            }
        })
        .catch(error => {
            console.error('Lỗi khi xóa tài khoản:', error);
            showNotification(error.message, 'error');
        });
}

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
    }, 3000);
}
