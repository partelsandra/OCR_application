// Handle file selection from browse window
function handleFileSelection(event) {
    const files = event.target.files;
    console.log("Files selected:", files);
    handleFileUpload(files);
}

// Function to handle file upload
function handleFileUpload(files) {
    const file = files[0];
    console.log("File to upload:", file);

    // Uploaded file details on the screen
    updateUploadedFile(file);

    // Show process button
    document.getElementById("process-button").style.display = "inline";
}

// Update file details on the screen
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
document.getElementById("process-button").addEventListener("click", function () {
    // Get the uploaded file details
    const uploadedImageName = document.getElementById("uploaded-image-name");
    const fileName = uploadedImageName.textContent;

    // Check if file is uploaded
    if (fileName) {
        // Show loading screen
        document.getElementById("progress-bar-container").style.display = "block";
        document.getElementById("image-to-text").style.display = "none";

        // Create a new FormData object
        const formData = new FormData();

        // Append the file to FormData object
        const fileInput = document.getElementById('file-input'); 
        formData.append('file', fileInput.files[0]);

        // Send the file to the server
        fetch('http://127.0.0.1:5000/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.status >= 200 && response.status < 300) {
                    return response.text();
                } else {
                    throw new Error('Failed to upload file');
                }
            })
            .then(data => {
                console.log(data); 
                processImage(fileName);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        console.error('Error: No file uploaded');
    }
});


// Function to trigger OCR processing
function processImage(fileName) {
    // Send request to server to process the image
    fetch('http://127.0.0.1:5000/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: fileName })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to trigger OCR processing');
            }
            return response.json();
        })
        .then(data => {
            // Hide loading screen
            document.getElementById("progress-bar-container").style.display = "none";

            // Display OCR result
            displayOCRResult(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to display OCR result
function displayOCRResult(data) {
    // Show OCR result container
    document.getElementById("ocr-result-container").style.display = "block";

    // Display uploaded image
    const uploadedImage = document.getElementById("uploaded-image");
    uploadedImage.src = data.image_url;

    // Display OCR result
    const ocrResultText = document.querySelector(".text-box .regular-text");
    ocrResultText.textContent = data.ocr_result;

    document.getElementById("ocr-result-container").scrollIntoView({ behavior: "smooth" });
}

// Trigger file input click when upload box is clicked
const fileInput = document.getElementById('file-input');
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// Bind file selection event to file input
fileInput.addEventListener('change', handleFileSelection);
