// Function to handle file selection from browse window
function handleFileSelection(event) {
    const files = event.target.files; 
    handleFileUpload(files); 
}

// Function to handle file upload
function handleFileUpload(files) {
    const file = files[0]; // Assuming only one file is selected

    // Update uploaded file details on the screen
    updateUploadedFile(file);
}

// Update uploaded file details on the screen
function updateUploadedFile(file) {
    const uploadedImageName = document.getElementById("uploaded-image-name");
    uploadedImageName.textContent = file.name;
    uploadedImageName.style.display = 'inline';

    const uploadedImageIcon = document.getElementById("uploaded-image-icon");
    uploadedImageIcon.style.display = 'inline';
}

// Function to handle file drop
function handleFileDrop(event) {
    event.preventDefault(); 
    const files = event.dataTransfer.files; 
    handleFileUpload(files); 
}

const uploadBox = document.querySelector('.upload');
uploadBox.addEventListener('dragover', event => {
    event.preventDefault();
});
uploadBox.addEventListener('drop', handleFileDrop);

// Event listener for process button
document.getElementById("process-button").addEventListener("click", function() {
    // Get the uploaded file details
    const uploadedImageName = document.getElementById("uploaded-image-name");
    const fileName = uploadedImageName.textContent;

    // Check if a file is uploaded
    if (fileName) {
        // Hide image-to-text container
        document.getElementById("image-to-text").style.display = "none";
        
        // Show progress-bar-container
        document.getElementById("progress-bar-container").style.display = "block";
        
        // Simulate progress (for demonstration purposes)
        simulateProgress();
    } else {
        // Display an error message if no file is uploaded
        console.error('Error: No file uploaded');
    }
});

function simulateProgress() {
    var progressBar = document.getElementById("progress-bar");
    var width = 0;
    var interval = setInterval(function() {
        if (width >= 100) {
            clearInterval(interval);
            // Hide progress-bar-container
            document.getElementById("progress-bar-container").style.display = "none";
            // Show OCR result container
            document.getElementById("ocr-result-container").style.display = "block";
        } else {
            width += 10;
            progressBar.style.width = width + "%";
            progressBar.setAttribute("aria-valuenow", width);
        }
    }, 200); 
}

// Trigger file input click event when upload box is clicked
const fileInput = document.getElementById('file-input');
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// Bind file selection event to file input
fileInput.addEventListener('change', handleFileSelection);
