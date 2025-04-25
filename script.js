document.getElementById("imageUpload").addEventListener("change", async (e) => {
    const input = e.target;
    const formData = new FormData();
    formData.append("file", input.files[0]);

    const canvas = document.getElementById("frameCanvas");
    const ctx = canvas.getContext("2d");
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(input.files[0]);

    try {
        const response = await fetch("http://127.0.0.1:8000/predict/", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        document.getElementById("prediction").textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("prediction").textContent = "Error occurred while predicting.";
    }
});

async function startWebcam() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("frameCanvas");
    const captureButton = document.getElementById("capture");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        captureButton.style.display = "inline-block";

        captureButton.onclick = async () => {
            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append("file", blob);

                try {
                    const response = await fetch("http://127.0.0.1:8000/predict/", {
                        method: "POST",
                        body: formData
                    });

                    const data = await response.json();
                    document.getElementById("prediction").textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    console.error("Error:", error);
                    document.getElementById("prediction").textContent = "Error occurred while predicting.";
                }
            }, "image/jpeg");
        };
    } catch (error) {
        console.error("Error accessing webcam:", error);
        document.getElementById("prediction").textContent = "Error accessing webcam.";
    }
}
