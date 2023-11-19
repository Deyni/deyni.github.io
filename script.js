(function () {
  if (!("mediaDevices" in navigator) || !("getUserMedia" in navigator.mediaDevices) || !("MediaRecorder" in window)) {
    alert("Camera API or MediaRecorder is not available in your browser");
    return;
  }

  // elementos pagina
  const video = document.querySelector("#video");
  const btnPause = document.querySelector("#btnPause");
  const btnRecord = document.querySelector("#btnRecord");
  const btnStopRecord = document.querySelector("#btnStopRecord");
  const btnTakephoto = document.querySelector("#btnTakephoto");
  const btnChangeCamera = document.querySelector("#btnChangeCamera");
  const filesContainer = document.querySelector("#files");
  const canvas = document.querySelector("#canvas");
  const devicesSelect = document.querySelector("#devicesSelect");

  // tamanhos video
  const constraints = {
    video: {
      width: {
        min: 256,
        ideal: 384,
        max: 512,
      },
      height: {
        min: 261,
        ideal: 392,
        max: 524,
      },
    },
  };

  // camera frontal
  let useFrontCamera = true;

  // video fluxo
  let videoStream;
  let mediaRecorder;
  let recordedChunks = [];

  // Coordenadas geográficas
  let latitude;
  let longitude;

  // iniciar
  async function initializeCamera() {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Display the video element immediately
      const video = document.querySelector("#video");
      video.srcObject = videoStream;

      if ("geolocation" in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const geoCoordinates = document.createElement("div");
        geoCoordinates.id = "geoCoordinates";
        geoCoordinates.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
        document.body.appendChild(geoCoordinates);

         // Adicione o estilo para posicionar no topo da tela
      geoCoordinates.style.position = "fixed";
      geoCoordinates.style.top = "560px";
      geoCoordinates.style.left = "7%";
      geoCoordinates.style.transform = "translateX(-50%)";
      
      } else {
        console.error("Geolocalização não suportada pelo navegador");
      }
    } catch (err) {
      alert("Could not access the camera");
    }
  }

  // iniciar gravacao
  btnRecord.addEventListener("click", function () {
    if (mediaRecorder) return;

    mediaRecorder = new MediaRecorder(videoStream);
    mediaRecorder.ondataavailable = function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = function () {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded-video.webm";
      a.textContent = "Download Video";
      filesContainer.appendChild(a);
    };

    mediaRecorder.start();
    btnRecord.classList.add("is-hidden");
    btnStopRecord.classList.remove("is-hidden");
  });

  // parar gravação
  btnStopRecord.addEventListener("click", function () {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder = null;
      btnStopRecord.classList.add("is-hidden");
      btnRecord.classList.remove("is-hidden");
    }
  });

  // tirar foto
  btnTakephoto.addEventListener("click", function () {
    const img = document.createElement("img");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    img.src = canvas.toDataURL("image/png");
    filesContainer.prepend(img);
  });

  // virar camera
  btnChangeCamera.addEventListener("click", function () {
    useFrontCamera = !useFrontCamera;
    initializeCamera();
  });

  // parar video
  function stopVideoStream() {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  initializeCamera();
})();
