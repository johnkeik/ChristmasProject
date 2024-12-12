import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-detection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './face-detection.component.html',
  styleUrl: './face-detection.component.scss'
})
export class FaceDetectionComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  loading = true;

  async ngOnInit() {
    // Load face detection models
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models');
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/assets/models');
    
    this.loading = false;
    this.startCamera();

    this.videoElement?.nativeElement.addEventListener('play', () => {
      setInterval(async () => {

      })
    })
  }

  async startCamera() {
    const video = this.videoElement.nativeElement;
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();
  
      console.log('Webcam stream started:', stream);
      this.detectFaces();
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }

  async detectFaces() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    video.addEventListener('play', async () => {

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const canvasContext = canvas.getContext('2d');
        if (canvasContext) {
          canvasContext.clearRect(0, 0, canvas.width, canvas.height);  // Clear previous frame
          faceapi.draw.drawDetections(canvas, resizedDetections);     // Draw detections (bounding box)
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);   // Draw landmarks
        }
      },200)
    });
  }

  saveImage() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    faceapi.detectSingleFace(video).withFaceLandmarks().then((detection) => {
      if (detection) {
        // Extract the bounding box of the detected face
      const { x, y, width, height } = detection.detection.box;
      
      // Add padding to capture a larger area (for hair)
      const padding = 20; // Adjust this value to control how much extra area is captured

      const paddedX = Math.max(x - padding, 0); // Prevent going out of bounds
      const paddedY = Math.max(y - padding, 0); // Prevent going out of bounds
      const paddedWidth = width + 2 * padding; // Increase the width to include more area
      const paddedHeight = height + 2 * padding; // Increase the height to include more area

      // Create a new canvas to crop the face image
      const faceCanvas = document.createElement('canvas');
      const faceCanvasContext = faceCanvas.getContext('2d');
      
      if (faceCanvasContext) {
        // Set the canvas size to the padded bounding box
        faceCanvas.width = paddedWidth;
        faceCanvas.height = paddedHeight;

        // Draw the face image onto the new canvas with padding
        faceCanvasContext.drawImage(
          video,                     // Source: the video stream
          paddedX, paddedY,          // Source coordinates (with padding)
          paddedWidth, paddedHeight, // Source size (with padding)
          0, 0, paddedWidth, paddedHeight // Destination coordinates and size
        );

        // Save the image
        const imageUrl = faceCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'face-image.png';  // Download face image with this name
        link.click();
      }
      } else {
        console.log('No face detected, try again.');
      }
      return detection;
    }).catch((error) => {
      console.error('Error during face detection:', error);
    });
  }
}

