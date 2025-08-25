// DOM Elements
const form = document.getElementById('telegramForm');
const fileInput = document.getElementById('image');
const dropZone = document.getElementById('dropZone');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const previewImage = document.getElementById('previewImage');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const resultMessage = document.getElementById('resultMessage');

// File upload handling
fileInput.addEventListener('change', handleFileSelect);

// Drag and drop handling
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.style.borderColor = '#bb86fc';
    dropZone.style.backgroundColor = '#2d2d2d';
}

function unhighlight() {
    dropZone.style.borderColor = '#333';
    dropZone.style.backgroundColor = '#252525';
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    fileInput.files = files;
    handleFileSelect();
}

function handleFileSelect() {
    const file = fileInput.files[0];

    if (file) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showResult('File size exceeds 5MB limit', 'error');
            fileInput.value = '';
            return;
        }

        // Show file name
        fileName.textContent = file.name;

        // Show preview if it's an image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = function (e) {
                previewImage.src = e.target.result;
                filePreview.style.display = 'block';
            }

            reader.readAsDataURL(file);
        } else {
            previewImage.style.display = 'none';
            filePreview.style.display = 'block';
        }
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    btnText.innerHTML = '<span class="loading"></span> Sending...';

    try {
        // Telegram logic here
        const formData = new FormData(form);

        const workerUrl = 'https://telegram-message-sender.onedeveloper.workers.dev/';
        const response = await fetch(workerUrl, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Request failed');

        showResult('Message sent successfully!', 'success');
        form.reset();
        filePreview.style.display = 'none';

    } catch (error) {
        // Error handling
        console.error('Error:', error);
        showResult(`Error: ${error.message}`, 'error');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        btnText.textContent = 'Send to Telegram';
    }
});

function showResult(message, type) {
    resultMessage.textContent = message;
    resultMessage.className = 'result-message ' + type;
    resultMessage.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        resultMessage.style.display = 'none';
    }, 5000);
}
