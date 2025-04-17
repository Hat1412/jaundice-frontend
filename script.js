const canvas = document.getElementById('frameCanvas');
const ctx = canvas.getContext('2d');
const predictionText = document.getElementById('predictionText');

function sendImageToServer(blob) {
    const formData = new FormData();
    formData.append('image', blob, 'frame.jpg');

    fetch('/predict', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            predictionText.innerText = `Result: ${data.result}`;
        })
        .catch(err => {
            predictionText.innerText = "Error predicting image.";
            console.error(err);
        });
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
            canvas.toBlob(blob => {
                sendImageToServer(blob);
            }, 'image/jpeg');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}