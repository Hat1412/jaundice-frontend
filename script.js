const API_URL = 'https://hf.space/embed/Hat1412/Jaundice_AI_model/raw/api/predict/';

const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const predictionText = document.getElementById('prediction');
const uploadInput = document.getElementById('imageUpload');
const canvas = document.getElementById('frameCanvas');
const ctx = canvas.getContext('2d');

// Setup webcam
function startWebcam() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Webcam error:", err);
    });
}
window.startWebcam = startWebcam;

// Webcam capture
captureButton.addEventListener('click', () => {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => sendImageToServer(blob), 'image/jpeg');
});

// Image upload
uploadInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = function (e) {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => sendImageToServer(blob), 'image/jpeg');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Send image to backend
function sendImageToServer(blob) {
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64data = reader.result.split(',')[1];
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: ["data:image/jpeg;base64," + base64data]
      })
    })
      .then(res => res.json())
      .then(data => {
        predictionText.innerText = `Result: ${data.data[0]}`;
      })
      .catch(err => {
        predictionText.innerText = "Error predicting image.";
        console.error("Prediction error:", err);
      });
  };
  reader.readAsDataURL(blob);
}
