// Adjusted handleFileUpload function to accept event and files parameters
function handleFileUpload(event, files) {
    const file = files[0]; 

    const formData = new FormData();
    formData.append('file', file);

    console.log("File selected:", file.name); 

    fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data); 
        if (data && data.success) {
            const uploadedImageName = document.getElementById("uploaded-image-name");
            uploadedImageName.textContent = file.name;

            const uploadedImageIcon = document.getElementById("uploaded-image-icon");
            uploadedImageIcon.style.display = 'inline';
        } else {
            console.error('Error uploading file');
        }
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    });
}

// Function to handle file selection from browse window
function handleFileSelection(event) {
    const files = event.target.files; 
    handleFileUpload(event, files); 
}

// Ocr processing
// if (data && data.ocr_result) {
//     const ocrResultContainer = document.getElementById("ocr-result-container");
//     const ocrResultText = document.querySelector(".text-box .regular-text");
//     ocrResultText.textContent = data.ocr_result;
//     document.getElementById("progress-bar-container").style.display = "none";
//     ocrResultContainer.style.display = "block";
// } else {
//     console.error('Error: No OCR result received from the backend');
// }


// Handle file drop
function handleFileDrop(event) {
    event.preventDefault(); 
    const files = event.dataTransfer.files; 
    handleFileUpload(event, files); 
}

const uploadBox = document.querySelector('.upload');
uploadBox.addEventListener('dragover', event => {
    event.preventDefault();
});
uploadBox.addEventListener('drop', handleFileDrop);

// Create file input element for browsing files
const fileInput = document.createElement('input');
fileInput.setAttribute('type', 'file');
fileInput.setAttribute('accept', 'image/*');
fileInput.style.display = 'none';
fileInput.addEventListener('change', handleFileSelection);
document.body.appendChild(fileInput);

uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// Event listener for process button
document.getElementById("process-button").addEventListener("click", function() {
    // Hide image-to-text container
    document.getElementById("image-to-text").style.display = "none";
    
    // Show progress-bar-container
    document.getElementById("progress-bar-container").style.display = "block";
    
    // Simulate progress (for demonstration purposes)
    simulateProgress();
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