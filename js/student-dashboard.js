document.addEventListener('DOMContentLoaded', () => {
    // Initialize sidebar
    document.getElementById('sidebarCollapse').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
    });

    // Active link handling
    const sidebarLinks = document.querySelectorAll('#sidebar a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });

    // Load initial data
    loadRoomStatus();
    loadRoomDetails();

    // Event Listeners
    document.getElementById('viewProfile').addEventListener('click', showProfile);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

async function loadRoomStatus() {
    try {
        const response = await fetch('/api/student/room-status.php');
        const data = await response.json();
        if (data.success) {
            document.getElementById('roomStatus').innerHTML = `
                <p>Room Number: ${data.room_number || 'Not Assigned'}</p>
                <p>Floor: ${data.floor || 'N/A'}</p>
                <p>Status: ${data.status || 'Pending'}</p>
            `;
        }
    } catch (error) {
        console.error('Error loading room status:', error);
    }
}

async function loadRoomDetails() {
    try {
        const response = await fetch('/api/student/room-details.php');
        const data = await response.json();
        if (data.success) {
            let roommatesHtml = data.roommates.map(roommate => `
                <div class="roommate-card">
                    <h6>${roommate.name}</h6>
                    <p>Mobile: ${roommate.mobile}</p>
                    <p>Course: ${roommate.curr_edu}</p>
                </div>
            `).join('');

            document.getElementById('roomDetails').innerHTML = `
                <div class="roommates-section">
                    <h6>Your Roommates</h6>
                    ${roommatesHtml || '<p>No roommates assigned yet</p>'}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading room details:', error);
    }
}

async function showProfile() {
    try {
        const response = await fetch('/api/student/profile.php');
        const data = await response.json();
        if (data.success) {
            document.getElementById('profileDetails').innerHTML = `
                <div class="profile-info">
                    <p><strong>Name:</strong> ${data.name} ${data.middle_name} ${data.last_name}</p>
                    <p><strong>PRN:</strong> ${data.prn_number}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Mobile:</strong> ${data.mobile}</p>
                    <p><strong>Current Education:</strong> ${data.curr_edu}</p>
                    <p><strong>Address:</strong> ${data.address}</p>
                </div>
            `;
            new bootstrap.Modal(document.getElementById('profileModal')).show();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/logout.php');
        const data = await response.json();
        if (data.success) {
            window.location.href = '/views/student/login.php';
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
} 