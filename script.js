
const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const predictionText = document.getElementById('prediction');
const uploadInput = document.getElementById('upload');

const API_URL = 'https://huggingface.co/spaces/Hat1412/Jaundice_AI_model/run/predict'; // Replace if your space name is different

// Setup webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error("Webcam error:", err));

// Handle webcam capture
captureButton.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  canvas.toBlob(blob => sendImageToServer(blob), 'image/jpeg');
});

// Handle upload input
uploadInput.addEventListener('change', () => {
  const file = uploadInput.files[0];
  if (file) {
    sendImageToServer(file);
  }
});

// Convert blob or file to base64 and send to Gradio
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
