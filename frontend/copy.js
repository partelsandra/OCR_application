document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copy-icon');
    console.log("Copy icon:", copyIcon);

    copyIcon.addEventListener('click', function() {
        console.log("Copy icon clicked!");
        const textBox = this.closest('.text-box');
        console.log("Text box:", textBox);
        const textToCopy = textBox.querySelector('.regular-text').textContent.trim(); // Get the text to copy
        console.log("Text to copy:", textToCopy);

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                console.log("Text copied successfully!");
                showNotification('Copied!');
            })
            .catch(err => {
                console.error("Error copying text:", err);
                showNotification('Failed to copy text!');
            });
    });

    function showNotification(message) {
        console.log("Showing notification:", message);
        const toastContainer = document.getElementById('toast-container');
        console.log("Toast container:", toastContainer);
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Fade out after 2 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 1000); // Fade out duration + delay for removing the element
        }, 2000); // Toast display duration
    }
});
