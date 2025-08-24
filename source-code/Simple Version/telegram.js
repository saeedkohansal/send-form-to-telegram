// Telegram credentials (same as provided)
const BOT_TOKEN = "XXXXXXXX:XXXXXXXXXXXXXXXXXXXXXXXX";
const CHAT_ID = "XXXXXXXXXX";

document.getElementById("telegramForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = document.getElementById("submitBtn");
    const resultDiv = document.getElementById("result");

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    resultDiv.className = "hidden";

    try {
        const formData = Object.fromEntries(new FormData(form));

        // Honeypot check (unchanged)
        if (formData.website) {
            throw new Error("Bot detected!");
        }

        // ===== ONLY MODIFIED SECTION ===== //
        // Format message for Telegram
        const telegramMessage = `
📬 New message from website:
👤 *Name*: ${formData.name}
✉️ *Email*: ${formData.email}
💬 *Message*:
${formData.message}
`.trim();

        // Direct Telegram API call
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: telegramMessage,
                parse_mode: "Markdown"
            })
        });
        // ===== END MODIFIED SECTION ===== //

        const result = await response.json();

        if (result.ok) {
            resultDiv.className = "success";
            resultDiv.innerHTML = "✅ Sent to Telegram!";
            form.reset();
        } else {
            throw new Error(result.description || "Telegram API error");
        }
    } catch (error) {
        resultDiv.className = "error";
        resultDiv.innerHTML = `❌ Error: ${error.message}`;
    } finally {
        resultDiv.classList.remove("hidden");
        submitBtn.disabled = false;
        submitBtn.textContent = "Send via Telegram";
    }
});
