const canvas = document.getElementById('frameCanvas');
const ctx = canvas.getContext('2d');
const predictionText = document.getElementById('predictionText');

function sendImageToServer(blob) {
    const formData = new FormData();
    formData.append('image', blob, 'frame.jpg');

    function sendImageToServer(blob) {
        const formData = new FormData();
        formData.append('image', blob, 'frame.jpg');

        fetch('https://jaundice-backend-99m0.onrender.com/predict', {
            method: 'POST',
            body: formData
        })
            .then(async res => {
                const contentType = res.headers.get("content-type");
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Server error: ${text}`);
                }
                if (contentType && contentType.includes("application/json")) {
                    return res.json();
                } else {
                    throw new Error("Expected JSON response, got something else.");
                }
            })
            .then(data => {
                predictionText.innerText = `Result: ${data.result}`;
            })
            .catch(err => {
                predictionText.innerText = "Error predicting image.";
                console.error("Prediction error:", err);
            });
    }
}
/*console logging trial */
function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            video.addEventListener('loadeddata', () => {
                ctx.drawImage(video, 0, 0, 224, 224);
                canvas.toBlob(blob => {
                    sendImageToServer(blob);
                    stream.getTracks().forEach(track => track.stop());
                }, 'image/jpeg');
            });
        })
        .catch(err => console.error("Webcam error:", err));
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 224, 224);
            canvas.toBlob(blob => {
                sendImageToServer(blob);
            }, 'image/jpeg');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}