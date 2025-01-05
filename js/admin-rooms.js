// Room Management Functions
function loadRoomManagement() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Room Management</h5>
                        <button class="btn btn-primary" onclick="showAddRoomModal()">
                            <i class="bi bi-plus-circle"></i> Add New Room
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <select class="form-select" id="blockFilter">
                                    <option value="">All Blocks</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select class="form-select" id="floorFilter">
                                    <option value="">All Floors</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select class="form-select" id="statusFilter">
                                    <option value="">All Status</option>
                                    <option value="available">Available</option>
                                    <option value="full">Full</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <input type="text" class="form-control" id="searchRoom" placeholder="Search rooms...">
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Room Number</th>
                                        <th>Block</th>
                                        <th>Floor</th>
                                        <th>Type</th>
                                        <th>Capacity</th>
                                        <th>Occupied</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="roomsTableBody">
                                    <!-- Rooms will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadRooms();
    setupRoomFilters();
}

async function loadRooms() {
    try {
        const response = await fetch('../../api/admin/room-availability.php');
        const data = await response.json();

        if (data.success) {
            const tableBody = document.getElementById('roomsTableBody');
            tableBody.innerHTML = data.rooms.map(room => `
                <tr>
                    <td>${room.room_number}</td>
                    <td>${room.block_name}</td>
                    <td>${room.floor_number}</td>
                    <td>${room.room_type}</td>
                    <td>${room.capacity}</td>
                    <td>${room.current_occupants}</td>
                    <td>
                        <span class="badge bg-${room.availability_status === 'available' ? 'success' : 'danger'}">
                            ${room.availability_status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewRoomDetails(${room.id})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="showAssignRoomModal(${room.id})">
                            <i class="bi bi-person-plus"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        showError('Failed to load rooms');
    }
}

function showAddRoomModal() {
    const modalHtml = `
        <div class="modal fade" id="addRoomModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Room</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addRoomForm">
                            <div class="mb-3">
                                <label for="room_number" class="form-label">Room Number</label>
                                <input type="text" class="form-control" id="room_number" name="room_number" 
                                    placeholder="Format: A-101" required>
                            </div>
                            <div class="mb-3">
                                <label for="block_name" class="form-label">Block Name</label>
                                <select class="form-select" id="block_name" name="block_name" required>
                                    <option value="">Select Block</option>
                                    <option value="A">Block A</option>
                                    <option value="B">Block B</option>
                                    <option value="C">Block C</option>
                                    <option value="D">Block D</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="floor_number" class="form-label">Floor Number</label>
                                <select class="form-select" id="floor_number" name="floor_number" required>
                                    <option value="">Select Floor</option>
                                    <option value="0">Ground Floor</option>
                                    <option value="1">First Floor</option>
                                    <option value="2">Second Floor</option>
                                    <option value="3">Third Floor</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="room_type" class="form-label">Room Type</label>
                                <select class="form-select" id="room_type" name="room_type" required>
                                    <option value="">Select Type</option>
                                    <option value="single">Single</option>
                                    <option value="double">Double</option>
                                    <option value="triple">Triple</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="capacity" class="form-label">Capacity</label>
                                <input type="number" class="form-control" id="capacity" name="capacity" 
                                    min="1" max="3" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="addRoom()">Add Room</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
    modal.show();

    // Add event listener for modal hidden event to remove it from DOM
    document.getElementById('addRoomModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });

    // Add event listener to update capacity based on room type
    document.getElementById('room_type').addEventListener('change', function() {
        const capacityInput = document.getElementById('capacity');
        switch(this.value) {
            case 'single':
                capacityInput.value = "1";
                capacityInput.readOnly = true;
                break;
            case 'double':
                capacityInput.value = "2";
                capacityInput.readOnly = true;
                break;
            case 'triple':
                capacityInput.value = "3";
                capacityInput.readOnly = true;
                break;
            default:
                capacityInput.value = "";
                capacityInput.readOnly = false;
        }
    });
}

async function addRoom() {
    const form = document.getElementById('addRoomForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    try {
        const response = await fetch('../../api/admin/add-room.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('addRoomModal')).hide();
            // Reload rooms list
            loadRooms();
            // Show success message
            alert('Room added successfully');
        } else {
            alert(data.message || 'Failed to add room');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the room');
    }
}

function setupRoomFilters() {
    // Get unique values for filters
    fetch('../../api/admin/room-availability.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const blocks = [...new Set(data.rooms.map(room => room.block_name))];
                const floors = [...new Set(data.rooms.map(room => room.floor_number))];

                // Populate block filter
                const blockFilter = document.getElementById('blockFilter');
                blocks.forEach(block => {
                    if (block) {
                        const option = document.createElement('option');
                        option.value = block;
                        option.textContent = block;
                        blockFilter.appendChild(option);
                    }
                });

                // Populate floor filter
                const floorFilter = document.getElementById('floorFilter');
                floors.forEach(floor => {
                    if (floor) {
                        const option = document.createElement('option');
                        option.value = floor;
                        option.textContent = floor;
                        floorFilter.appendChild(option);
                    }
                });

                // Add event listeners for filters
                document.getElementById('blockFilter').addEventListener('change', filterRooms);
                document.getElementById('floorFilter').addEventListener('change', filterRooms);
                document.getElementById('statusFilter').addEventListener('change', filterRooms);
                document.getElementById('searchRoom').addEventListener('input', filterRooms);
            }
        })
        .catch(error => {
            console.error('Error loading filters:', error);
            showError('Failed to load room filters');
        });
}

function filterRooms() {
    const blockValue = document.getElementById('blockFilter').value.toLowerCase();
    const floorValue = document.getElementById('floorFilter').value;
    const statusValue = document.getElementById('statusFilter').value.toLowerCase();
    const searchValue = document.getElementById('searchRoom').value.toLowerCase();

    const rows = document.querySelectorAll('#roomsTableBody tr');
    
    rows.forEach(row => {
        const block = row.children[1].textContent.toLowerCase();
        const floor = row.children[2].textContent;
        const status = row.children[6].textContent.toLowerCase().trim();
        const roomNumber = row.children[0].textContent.toLowerCase();

        const matchesBlock = !blockValue || block === blockValue;
        const matchesFloor = !floorValue || floor === floorValue;
        const matchesStatus = !statusValue || status === statusValue;
        const matchesSearch = !searchValue || 
                            roomNumber.includes(searchValue) || 
                            block.includes(searchValue);

        row.style.display = (matchesBlock && matchesFloor && matchesStatus && matchesSearch) 
            ? '' 
            : 'none';
    });
}

// Add helper functions for success and error messages
function showSuccess(message) {
    // Implement a toast or alert for success messages
    alert(message); // Replace with a better UI component
}

function showError(message) {
    // Implement a toast or alert for error messages
    alert(message); // Replace with a better UI component
}

// Add the room details view function
async function viewRoomDetails(roomId) {
    try {
        const response = await fetch(`../../api/admin/get-room-details.php?room_id=${roomId}`);
        const data = await response.json();

        if (data.success) {
            const modal = `
                <div class="modal fade" id="roomDetailsModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Room Details - ${data.room.room_number}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <p><strong>Block:</strong> ${data.room.block_name}</p>
                                        <p><strong>Floor:</strong> ${data.room.floor_number}</p>
                                        <p><strong>Type:</strong> ${data.room.room_type}</p>
                                        <p><strong>Capacity:</strong> ${data.room.capacity}</p>
                                        <p><strong>Status:</strong> ${data.room.availability_status}</p>
                                    </div>
                                </div>
                                <h6>Current Occupants</h6>
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>PRN</th>
                                                <th>Mobile</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${generateOccupantsRows(data.room.occupants || [])}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modal);
            const modalElement = document.getElementById('roomDetailsModal');
            const bsModal = new bootstrap.Modal(modalElement);
            bsModal.show();

            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
            });
        }
    } catch (error) {
        console.error('Error viewing room details:', error);
        showError('Failed to load room details');
    }
}

function generateOccupantsRows(occupants) {
    if (!occupants.length) {
        return '<tr><td colspan="3" class="text-center">No occupants</td></tr>';
    }

    return occupants.map(occupant => `
        <tr>
            <td>${occupant.name}</td>
            <td>${occupant.prn}</td>
            <td>${occupant.mobile}</td>
        </tr>
    `).join('');
} 