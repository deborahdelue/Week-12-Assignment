// Listen for the DOM content to be fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Create the mood dropdown immediately after the page loads.
    createMoodDropdown('mood1', ['Content', 'Calm', 'Happy', 'Sad', 'Angry', 'Anxious', 'Worried', 'Other']);
    
    // Load existing entries from the server as soon as the page is ready.
    loadEntries();

    // Add a submit event listener to the form for adding or updating diary entries.
    document.getElementById('cbtDiary').addEventListener('submit', event => {
        // Prevent the default form submit action to handle submission via JavaScript.
        event.preventDefault();

        // Gather form data to be sent to the server.
        const id = document.getElementById('entryId').value;
        const date = document.getElementById('todayDate').value;
        const mood1 = document.getElementById('mood1Dropdown').querySelector('select').value;
        const story = document.getElementById('story').value;
        const distortion = document.getElementById('distortion').value;
        const rewrite = document.getElementById('rewrite').value;
        const mood2 = document.getElementById('mood2').value;

        // Check if an ID exists to determine if this is an update or a new entry.
        if (id) {
            updateEntry(id, date, mood1, story, distortion, rewrite, mood2);
        } else {
            saveEntry(date, mood1, story, distortion, rewrite, mood2);
        }

        // Reset the form fields after submission.
        document.getElementById('cbtDiary').reset();
    });
});

// Function to create and populate the mood dropdown.
function createMoodDropdown(selectID, moods) {
    const select = document.createElement('select');
    select.className = 'form-control';
    select.id = selectID;
    select.required = true;
    select.add(new Option('Select Mood', ''));
    moods.forEach(mood => select.add(new Option(mood, mood)));
    document.getElementById(`${selectID}Dropdown`).appendChild(select);
}

// Function to clear the table and repopulate it with entries from the server.
function loadEntries() {
    fetch('http://localhost:3000/diaryEntries')
    .then(response => response.json())
    .then(entries => {
        const tableBody = document.querySelector('table.table tbody');
        // Clear the table before adding new rows to prevent duplication.
        tableBody.innerHTML = '';
        entries.forEach(entry => addToTable(entry));
    })
    .catch(error => console.error('Error:', error));
}

// Function to add a single entry to the table.
function addToTable(entry) {
    const tableBody = document.querySelector('table.table tbody');
    
    // Insert a new row at the end of the table.
    const newRow = tableBody.insertRow();
    newRow.setAttribute('data-id', entry.id);
    
    // Populate the row with entry data.
    newRow.insertCell(0).textContent = entry.date;
    newRow.insertCell(1).textContent = entry.mood1;
    newRow.insertCell(2).textContent = entry.story;
    newRow.insertCell(3).textContent = entry.distortion;
    newRow.insertCell(4).textContent = entry.rewrite;
    newRow.insertCell(5).textContent = entry.mood2;
    
    // Add an Edit button with an event listener to populate the form for editing.
    const editCell = newRow.insertCell(6);
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('btn', 'btn-sm', 'btn-warning');
    editButton.onclick = () => editEntry(entry.id);
    editCell.appendChild(editButton);
    
    // Add a Delete button with an event listener to handle deletion.
    const deleteCell = newRow.insertCell(7);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
    deleteButton.onclick = () => deleteEntry(entry.id);
    deleteCell.appendChild(deleteButton);
}

// Function to save a new entry to the server and refresh the table.
function saveEntry(date, mood1, story, distortion, rewrite, mood2) {
    const entry = { date, mood1, story, distortion, rewrite, mood2 };
    fetch('http://localhost:3000/diaryEntries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(entry),
    })
    .then(() => loadEntries()) // Reload entries to include the new entry.
    .catch(error => console.error('Error:', error));
}

// Function to fetch an entry's data and fill the form for editing.
function editEntry(id) {
    fetch(`http://localhost:3000/diaryEntries/${id}`)
    .then(response => response.json())
    .then(entry => {
        document.getElementById('entryId').value = id; // Hidden field to hold the ID for update operations.
        // Populate the form fields with the entry data for editing.
        document.getElementById('todayDate').value = entry.date;
        document.getElementById('mood1Dropdown').querySelector('select').value = entry.mood1;
        document.getElementById('story').value = entry.story;
        document.getElementById('distortion').value = entry.distortion;
        document.getElementById('rewrite').value = entry.rewrite;
        document.getElementById('mood2').value = entry.mood2;
    })
    .catch(error => console.error('Error:', error));
}

// Function to update an existing entry on the server and refresh the table.
function updateEntry(id, date, mood1, story, distortion, rewrite, mood2) {
    const entry = { date, mood1, story, distortion, rewrite, mood2 };
    fetch(`http://localhost:3000/diaryEntries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(entry),
    })
    .then(() => {
        document.getElementById('entryId').value = ''; // Clear the hidden ID field to switch back to add mode.
        loadEntries(); // Reload entries to reflect the updated entry.
    })
    .catch(error => console.error('Error:', error));
}

// Function to delete an entry from the server and refresh the table.
function deleteEntry(id) {
    fetch(`http://localhost:3000/diaryEntries/${id}`, {
        method: 'DELETE',
    })
    .then(() => loadEntries()) // Reload entries after deletion to reflect changes.
    .catch(error => console.error('Error:', error));
}
