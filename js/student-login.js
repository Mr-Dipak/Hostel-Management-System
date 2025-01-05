document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('studentLoginForm');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Create FormData object from the form
        const formData = new FormData(loginForm);
        
        try {
            const response = await fetch('../../api/student/login.php', {
                method: 'POST',
                body: formData  // Send form data directly
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = '../student/dashboard.php';
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
}); 