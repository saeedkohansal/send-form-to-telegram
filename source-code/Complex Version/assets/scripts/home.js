// Initialize pricing
const basePrice = 15;
let totalPrice = basePrice;

// Telegram configuration
const BOT_TOKEN = "XXXXXXXX:XXXXXXXXXXXXXXXXXXXXXXXX";
const CHAT_ID = "XXXXXXXXXX";

// Update price display
function updatePrice() {
    document.getElementById('total-price').textContent = totalPrice;
}

// Recalculate total price
function recalculateTotal() {
    totalPrice = basePrice;

    // Get selected options and add their prices
    document.querySelectorAll('.option.selected').forEach(option => {
        const price = parseFloat(option.getAttribute('data-price')) || 0;
        totalPrice += price;
    });

    updatePrice();
}

// Option selection
document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function () {
        // Get parent group
        const group = this.closest('.form-group');

        // Remove selected class from siblings in the same group
        const siblings = group.querySelectorAll('.option');
        siblings.forEach(sibling => {
            sibling.classList.remove('selected');
        });

        // Add selected class to clicked option
        this.classList.add('selected');

        // Recalculate total price
        recalculateTotal();
    });
});

// File upload handling with validation
document.getElementById('face-photo').addEventListener('change', function (e) {
    const uploadIconInBox = document.querySelector("body > div.container > div > div.form-group.upload-face-img > div > label > i");
    const spanStatusText = document.querySelector("body > div.container > div > div.form-group.upload-face-img > div > label > span");
    const preview = document.getElementById('file-preview');
    preview.innerHTML = '';

    if (this.files && this.files[0]) {
        const file = this.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        // Validate file type
        if (!validTypes.includes(file.type)) {
            alert('Please upload only JPG or PNG files!');
            this.value = ''; // Clear the input
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            alert('File size exceeds 5MB limit! Please choose a smaller file.');
            this.value = ''; // Clear the input
            return;
        }

        // Show preview if valid
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        }
        reader.readAsDataURL(file);
        uploadIconInBox.style.color = '#4caf50';
        spanStatusText.textContent = 'Photo ready! Click to change';
        preview.style.marginTop = '15px';
    } else {
        uploadIconInBox.style.color = '#00ced1';
        spanStatusText.textContent = 'Click to upload a photo of your face';
        preview.style.marginTop = '0';
    }
});

// Telegram submission with validation
document.getElementById('submit-order-btn').addEventListener('click', function () {
    const fileInput = document.getElementById('face-photo');
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Validate contact info
    const contactInfo = document.getElementById('contact-info').value.trim();
    if (!contactInfo) {
        alert('Please provide your contact information!');
        const contactInput = document.querySelector("#contact-info");
        if (contactInput) {
            contactInput.focus();
            contactInput.select();
        }
        // Scroll to contact info
        document.querySelector(".user-contact-info-input").scrollIntoView({ behavior: 'instant', block: 'start' });
        return;
    }

    // Validate file exists
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please upload your face photo first!');
        // Scroll to image upload
        document.querySelector(".upload-face-img").scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    const file = fileInput.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    // Validate file type
    if (!validTypes.includes(file.type)) {
        alert('Please upload only JPG or PNG files!');
        return;
    }

    // Validate file size
    if (file.size > maxSize) {
        alert('File size exceeds 5MB limit! Please choose a smaller file.');
        return;
    }

    // Show loading animation
    document.getElementById('loading').style.display = 'block';

    // Get selected options
    const selectedOptions = [];
    document.querySelectorAll('.option.selected').forEach(option => {
        selectedOptions.push(option.querySelector('.option-title').textContent);
    });

    // Get additional notes
    const additionalNotes = document.getElementById('additional-notes').value;

    // Compose message
    let message = `*🆕 New AI Video Order Request*\n\n\n`;
    message += `*👤 Contact:* ${contactInfo}\n\n\n`;
    message += `*⏹️ Aspect Ratio:* ${selectedOptions[0]}\n\n`;
    message += `*🎬 Video Quality:* ${selectedOptions[1]}\n\n`;
    message += `*🎞️ Frame Rate:* ${selectedOptions[2]}\n\n`;
    message += `*💎 Video Style:* ${selectedOptions[3]}\n\n`;
    message += `*🎵 Music Style:* ${selectedOptions[4]}\n\n`;
    message += `*📸 Delivery Option:* ${selectedOptions[5]}\n\n\n`;
    message += `*⭐ Additional Notes:*\n${additionalNotes || 'None'}\n\n\n`;
    message += `*💶 Total Price:* €${totalPrice}`;

    // Prepare form data
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('caption', message);
    formData.append('parse_mode', 'Markdown');
    formData.append('document', file);

    // Send to Telegram
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('loading').style.display = 'none';
            if (data.ok) {
                alert('Order submitted successfully! We\'ll process your video soon.');

                // Reset form
                document.getElementById('additional-notes').value = '';
                document.getElementById('file-preview').innerHTML = '';
                fileInput.value = '';
            } else {
                console.error('Telegram API error:', data);
                alert('Failed to submit order. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('loading').style.display = 'none';
            alert('An error occurred. Please try again.');
        });
});

// Initialize price display
recalculateTotal();
