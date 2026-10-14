import * as faceapi from 'face-api.js';

/**
 * Real face-count / gaze-deviation detection, running entirely in-browser
 * via face-api.js (TensorFlow.js under the hood). No video frame ever
 * leaves the device - only the derived { faceCount, gazeOffScreen, confidence }
 * result is reported, via useProctoring's handleFaceFrameResult.
 *
 * IMPORTANT — model weight files:
 * This previously pointed at '/public/models', which shipped EMPTY (see the
 * README that used to live there). Because loadFaceModels() failed silently
 * by design (proctoring must never crash the quiz over an optional check),
 * `modelsLoaded` stayed false forever and face/gaze detection silently never
 * ran at all — every session showed "0 events / PASSED" regardless of
 * whether a face was ever in frame.
 *
 * Fix: default to loading the weights from a public CDN mirror at runtime
 * (no local files required, nothing to download at build time). If you'd
 * rather self-host (recommended for production — don't depend on a 3rd
 * party CDN being up during an exam), download the two weight sets from
 * https://github.com/justadudewhohacks/face-api.js/tree/master/weights
 * into /frontend/public/models and set VITE_FACE_MODELS_URL=/models in
 * your .env — the local copy is used automatically when that's set.
 */

const DEFAULT_MODEL_CDN = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

let modelsLoaded = false;
let loadingPromise = null;

export function loadFaceModels(modelUrl) {
  if (modelsLoaded) return Promise.resolve(true);
  if (loadingPromise) return loadingPromise;

  const primaryUrl = modelUrl || import.meta.env?.VITE_FACE_MODELS_URL || '/models';

  loadingPromise = (async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(primaryUrl),
        faceapi.nets.faceLandmark68Net.loadFromUri(primaryUrl),
      ]);
      modelsLoaded = true;
      return true;
    } catch (err) {
      console.warn('[FaceDetection] Failed to load models from primary source:', primaryUrl, err.message);
      if (primaryUrl !== DEFAULT_MODEL_CDN) {
        try {
          console.info('[FaceDetection] Attempting fallback to CDN:', DEFAULT_MODEL_CDN);
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(DEFAULT_MODEL_CDN),
            faceapi.nets.faceLandmark68Net.loadFromUri(DEFAULT_MODEL_CDN),
          ]);
          modelsLoaded = true;
          return true;
        } catch (cdnErr) {
          console.warn('[FaceDetection] Fallback CDN also failed:', cdnErr.message);
        }
      }
      loadingPromise = null;
      return false;
    }
  })();

  return loadingPromise;
}

export function areFaceModelsLoaded() {
  return modelsLoaded;
}

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

/**
 * Run one detection pass on a <video> element.
 * Returns null if models aren't loaded yet or the video has no data.
 */
export async function detectFaceFrame(videoEl) {
  if (!modelsLoaded || !videoEl || videoEl.readyState < 2) return null;

  try {
    const detections = await faceapi.detectAllFaces(videoEl, DETECTOR_OPTIONS).withFaceLandmarks();
    const faceCount = detections.length;

    if (faceCount === 0) {
      return { faceCount: 0, gazeOffScreen: false, confidence: 0.85 };
    }

    // Use the highest-confidence face for the gaze estimate when multiple are present.
    const primary = detections.reduce((best, d) => (d.detection.score > best.detection.score ? d : best), detections[0]);
    const { gazeOffScreen, confidence } = estimateGazeFromLandmarks(primary);

    return { faceCount, gazeOffScreen, confidence };
  } catch (err) {
    console.warn('[FaceDetection] Detection error:', err.message);
    return null;
  }
}

/**
 * Lightweight head-pose proxy: face-api.js's 68-point model doesn't give a full
 * 3D head pose, so we approximate "looking away" from the horizontal symmetry
 * of the eyes/nose within the detected face box. A centered nose between the
 * eyes with a roughly symmetric jaw indicates the face is pointed at the camera;
 * a significant horizontal offset suggests the head is turned away.
 * This is intentionally conservative - small offsets from natural head tilt or
 * off-center camera framing are ignored (see the OFFSET_THRESHOLD margin) so
 * that normal movement isn't flagged, per the "don't be overly aggressive" rule.
 */
function estimateGazeFromLandmarks(faceResult) {
  const landmarks = faceResult.landmarks;
  const box = faceResult.detection.box;
  const nose = landmarks.getNose();
  const jaw = landmarks.getJawOutline();

  const noseTip = nose[Math.floor(nose.length / 2)];
  const jawLeft = jaw[0];
  const jawRight = jaw[jaw.length - 1];

  const faceCenterX = (jawLeft.x + jawRight.x) / 2;
  const faceWidth = Math.max(1, jawRight.x - jawLeft.x);
  const noseOffsetRatio = (noseTip.x - faceCenterX) / faceWidth; // ~0 = facing camera, |x| grows as head turns

  const OFFSET_THRESHOLD = 0.18; // tuned to tolerate normal head movement/tilt
  const gazeOffScreen = Math.abs(noseOffsetRatio) > OFFSET_THRESHOLD;
  const confidence = Math.min(0.85, 0.5 + Math.abs(noseOffsetRatio));

  return { gazeOffScreen, confidence: gazeOffScreen ? confidence : 0.5 };
}
