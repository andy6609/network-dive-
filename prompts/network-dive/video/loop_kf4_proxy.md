# LOOP CLIP — KF4 Proxy Gate  (seamless background loop, Seedance)

> **Seedance mode:** Image-to-video, **LOOP**. FIRST FRAME = LAST FRAME = `images/network-dive/KF4.png` (the SAME image for both). This is the only true loop in the project — it plays continuously as a pinned background while the page scrolls over it (interaction spec, mode C). Everything must return to its exact starting state so the loop point is invisible.

### SCENE
- A single monolithic brushed-metal PROXY checkpoint gate — one dark archway scanner portal standing in a deep near-black digital void, with the word 'PROXY' engraved into its top crossbeam. Inside the tall aperture, a luminous cyan scan grid. A continuous horizontal river of glowing cyan binary code (1s and 0s) flows through the aperture from left to right.
- Environment: deep near-black void, faint volumetric haze, sparse drifting light particles.
- Mood references: Apple/Nvidia product-film hero loop; a calm, authoritative checkpoint that never stops working.
- Color palette: near-black background, electric cyan dominant on stream and scan, small controlled amber indicator lights on the gate frame.

### CAMERA
- **Static locked shot.** No orbit, no push, no drift. Centered symmetrical hero framing on the gate, identical to the KF4 reference image.
- The only motion in frame is the flowing stream, the scan, and ambient particles — the camera itself never moves. (A static camera is the safest guarantee of a seamless loop.)
- Shallow depth of field: the gate and aperture sharp, the stream softly blurred at the far left and right extremes.

### ACTION ARC (continuous cycle, ~8 seconds)
- The binary stream flows steadily left → right through the aperture at a calm, readable speed — never speeding up or slowing down. The stream is a uniform, tiling river of code with no unique landmark cluster, so the eye cannot tell where the loop resets.
- Inside the aperture, a thin cyan scan line sweeps the passing stream on a smooth repeating cycle (e.g. top → bottom over ~4 seconds, then again), reading the packets. As the scan passes, faint wireframe brackets briefly lock onto individual packet-blocks, then release — a steady, rhythmic inspection pulse.
- The amber indicator lights on the gate glow with a slow, subtle steady pulse.
- There is no dramatic peak — this is an ambient, hypnotic, always-working loop. The rhythm is calm and constant.

### TEXT
No text baked into the video. Background plate only. The headline (*"The proxy has two faces."*) and the "what the proxy does" description text are all **web (HTML/CSS) overlays** placed over the calm dark corners of this plate.

### LIGHTING & ATMOSPHERE
- **Static lighting throughout.** The cyan scan glow, the cool rim light on the metal, and the amber indicators never shift color temperature or flicker.
- The scan sweep and indicator pulse are moving *elements*, not lighting changes.
- Atmosphere: faint volumetric haze and sparse drifting particles at a constant density. The particle field must be identical at the first and last frame.

### LOOP SEAL
- **First frame and last frame are the same reference image** (`KF4.png`): gate centered, stream mid-flow, scan at its start position.
- The binary stream is a seamless tiling flow — the pattern at the loop point matches the start exactly, so the left→right flow appears endless with no visible seam.
- The scan sweep completes a whole number of cycles and returns to its exact starting position by the final frame.
- Wireframe brackets are released (not mid-lock) at the loop point.
- Particle field and amber pulse return to their starting state.
- No residual motion, no jump. A brief moment of steady-state at both ends makes the seam invisible.

### TECHNICAL
- Duration: 8 seconds (seamless loop)
- Image-to-video generation mode: use the SAME image (`KF4.png`) for both first frame and last frame
- Seamlessly looping — designed to play on repeat forever
- No watermarks
- 4K resolution if supported

> **Seedance setup:** Image-to-video, loop mode. Set `KF4.png` as BOTH the first-frame and last-frame reference to force a seamless loop.
