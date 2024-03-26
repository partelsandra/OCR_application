// Function to handle file upload
function handleFileUpload(files) {
    const file = files[0]; // Assuming only one file is selected
    const fileName = file.name; // Get the name of the uploaded file

    // Display the uploaded file name in the designated box
    const uploadedImageName = document.getElementById('uploaded-image-name');
    uploadedImageName.textContent = fileName;
}

// Function to handle file drop
function handleFileDrop(event) {
    event.preventDefault(); // Prevent default behavior of dropping files
    const files = event.dataTransfer.files; // Get the dropped files
    handleFileUpload(files); // Handle the uploaded files
}

// Add event listener for file drop
const uploadBox = document.querySelector('.upload');
uploadBox.addEventListener('dragover', event => {
    event.preventDefault(); // Prevent default behavior of dragging over
});
uploadBox.addEventListener('drop', handleFileDrop); // Handle file drop

// Function to handle file selection from browse window
function handleFileSelection(event) {
    const files = event.target.files; // Get the selected files
    handleFileUpload(files); // Handle the selected files
}

// Create file input element for browsing files
const fileInput = document.createElement('input');
fileInput.setAttribute('type', 'file');
fileInput.setAttribute('accept', 'image/*');
fileInput.style.display = 'none';
fileInput.addEventListener('change', handleFileSelection); // Handle file selection
document.body.appendChild(fileInput); // Append file input element to the body

// Add event listener for click on upload box
uploadBox.addEventListener('click', () => {
    fileInput.click(); // Open file input dialog when upload box is clicked
});
