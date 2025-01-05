document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    try {
        const response = await fetch('/api/admin/login.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            alert(result.message);
            window.location.href = '/views/admin/dashboard.php';
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('An error occurred. Please try again.');
    }
}); 