
const canvas = document.getElementById('frameCanvas');
const ctx = canvas.getContext('2d');
const predictionText = document.getElementById('predictionText');

function sendImageToServer(blob) {
    console.log("Sending image to server...");
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
    console.log("Image sent successfully.");
}
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
            if (canvas.toBlob) {
                canvas.toBlob(blob => {
                    sendImageToServer(blob);
                }, 'image/jpeg');
            } else {
                const dataURL = canvas.toDataURL('image/jpeg');
                const byteString = atob(dataURL.split(',')[1]);
                const arrayBuffer = new ArrayBuffer(byteString.length);
                const uint8Array = new Uint8Array(arrayBuffer);
                for (let i = 0; i < byteString.length; i++) {
                    uint8Array[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
                sendImageToServer(blob);
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
