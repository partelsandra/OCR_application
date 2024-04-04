function handleFileSelection(event) {
    const files = event.target.files;
    console.log("Files selected:", files);
    handleFileUpload(files);
}

function handleFileUpload(files) {
    const file = files[0];
    console.log("File to upload:", file);

    updateUploadedFile(file);

    document.getElementById("process-button").style.display = "inline";
}

function updateUploadedFile(file) {
    const uploadedImageName = document.getElementById("uploaded-image-name");
    uploadedImageName.textContent = file.name;
    uploadedImageName.style.display = 'inline';

    const uploadedImageIcon = document.getElementById("uploaded-image-icon");
    uploadedImageIcon.style.display = 'inline';
}

function handleFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    console.log("Files dropped:", files);
    handleFileUpload(files);
}

const uploadBox = document.querySelector('.upload');
uploadBox.addEventListener('dragover', event => {
    event.preventDefault();
    handleFileDrop(event); 
});
uploadBox.addEventListener('drop', handleFileDrop);

document.getElementById("process-button").addEventListener("click", function () {
    const uploadedImageName = document.getElementById("uploaded-image-name");
    const fileName = uploadedImageName.textContent;

    if (fileName) {
        document.getElementById("progress-bar-container").style.display = "block";
        document.getElementById("image-to-text").style.display = "none";
        
        processImage(fileName);
    }

});

function processImage(fileName) {
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
            // Start checking OCR status periodically
            checkOCRStatus(fileName);
        })
        .catch(error => {
            console.error('Error:', error);
        }); 
}

function checkOCRStatus(fileName) {
    const intervalId = setInterval(() => {
        fetch('http://127.0.0.1:5000/ocr_status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename: fileName })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to check OCR status');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'complete') {
                document.getElementById("progress-bar-container").style.display = "none";

                displayOCRResult(data.ocr_result);
                
                clearInterval(intervalId);
            } else if (data.status === 'processing') {
            }
        })
        .catch(error => {
            console.error('Error:', error);
            clearInterval(intervalId);
        });
    }, 3000); 
}

function displayOCRResult(data) {
    document.getElementById("ocr-result-container").style.display = "block";

    const uploadedImage = document.getElementById("uploaded-image");
    uploadedImage.src = data.image_url;

    const ocrResultText = document.querySelector(".text-box .regular-text");
    ocrResultText.textContent = data.ocr_result;

    document.getElementById("ocr-result-container").scrollIntoView({ behavior: "smooth" });
}

const fileInput = document.getElementById('file-input');
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// Bind file selection event to file input
fileInput.addEventListener('change', handleFileSelection);
