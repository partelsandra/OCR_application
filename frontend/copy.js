document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copy-icon');
    const tooltip = document.querySelector('.tooltip'); 

    copyIcon.addEventListener('click', function() {
        console.log('Copy icon clicked!');
        const textBox = this.closest('.text-box'); 
        console.log('TextBox:', textBox);
        const textToCopy = textBox.querySelector('.regular-text').textContent.trim(); // Get the text to copy
        console.log('Text to copy:', textToCopy);
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                console.log('Text copied to clipboard!');
                showNotification(tooltip, 'Copied!'); // Show the tooltip when text is copied
            })
            .catch(err => {
                console.error('Unable to copy text to clipboard:', err);
                showNotification(tooltip, 'Failed to copy text!');
            });
    });

    function showNotification(tooltip, message) {
        console.log('Showing notification:', message);
        tooltip.textContent = message; // Update the tooltip content
        tooltip.style.display = 'block'; // Show the tooltip
        setTimeout(() => {
            tooltip.style.display = 'none'; // Hide the tooltip after a delay
            console.log('Notification hidden');
        }, 2000);
    }
});
