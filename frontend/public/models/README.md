# Face detection models

As of this update, the AI Quiz Proctor loads face-api.js's model weights
from a public CDN by default (`https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights`),
so face-count / gaze-deviation detection now works out of the box — you no
longer need to put anything in this folder.

To self-host instead (recommended for production, so an exam doesn't
depend on a third-party CDN being reachable):

1. Download these two model sets from the face-api.js weights repo:
   https://github.com/justadudewhohacks/face-api.js/tree/master/weights
   - `tiny_face_detector_model-weights_manifest.json` + its `.shard` file
   - `face_landmark_68_model-weights_manifest.json` + its `.shard` file
2. Place them directly in this folder (`frontend/public/models`).
3. Set `VITE_FACE_MODELS_URL=/models` in `frontend/.env` and rebuild.

`frontend/src/utils/faceDetection.js` picks up `VITE_FACE_MODELS_URL` if
set, otherwise falls back to the CDN. If neither is reachable,
`loadFaceModels()` fails gracefully and only the face/gaze checks are
skipped — tab-switch, copy/paste, fullscreen-exit, devtools, and
voice-activity detection are unaffected.
