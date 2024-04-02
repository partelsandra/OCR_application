// Function to handle file selection from browse window
function handleFileSelection(event) {
    const files = event.target.files; 
    console.log("Files selected:", files); // Add debugging
    handleFileUpload(files); 
}

// Function to handle file upload
function handleFileUpload(files) {
    const file = files[0]; // Assuming only one file is selected
    console.log("File to upload:", file); // Add debugging

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
    console.log("Files dropped:", files);
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
        // Show loading screen
        document.getElementById("progress-bar-container").style.display = "block";

        // Create a new XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        // Configure the request
        xhr.open('POST', 'http://127.0.0.1:5000/process');
        xhr.setRequestHeader('Content-Type', 'application/json');

        // Define the request callback
        xhr.onload = function() {
            if (xhr.status === 200) {
                // Hide loading screen
                document.getElementById("progress-bar-container").style.display = "none";

                // Display OCR result
                displayOCRResult(JSON.parse(xhr.responseText));
            } else {
                console.error('Failed to trigger OCR processing');
            }
        };

        // Send the request with the filename as JSON payload
        xhr.send(JSON.stringify({ filename: fileName }));
    } else {
        console.error('Error: No file uploaded');
    }
});


// Function to display OCR result
function displayOCRResult(data) {
    // Display uploaded image
    const uploadedImage = document.getElementById("uploaded-image");
    uploadedImage.src = data.image_url;

    // Display OCR result
    const ocrResultText = document.querySelector(".text-box .regular-text");
    ocrResultText.textContent = data.ocr_result;

    // Show OCR result container
    console.log("Showing OCR result container"); // Add debugging
    document.getElementById("ocr-result-container").style.display = "block";
}

// Trigger file input click event when upload box is clicked
const fileInput = document.getElementById('file-input');
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// Bind file selection event to file input
fileInput.addEventListener('change', handleFileSelection);
