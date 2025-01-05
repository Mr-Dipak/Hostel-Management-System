document.getElementById('studentRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    try {
        const response = await fetch('../../api/student/register.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        alert(result.message);
        
        if (result.success) {
            window.location.href = 'login.php';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}); 