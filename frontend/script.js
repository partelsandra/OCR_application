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
    }, 1000); // Change the interval duration (milliseconds) as needed
}
