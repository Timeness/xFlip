
const features = [
  { id: 28, name: "Sensor APIs", test: () => 'Not directly testable without permissions' },
  { id: 29, name: "Share API", test: async () => {
    if (navigator.share) {
      return 'Supported (Click to test)'; 
    } else return 'Not Supported';
  }, action: async () => {
    try {
      await navigator.share({ title: "Hello", text: "Testing Share API", url: location.href });
    } catch(e) { alert("Share cancelled or failed."); }
  }},
  { id: 30, name: "Speech Recognition", test: () => 'Check browser SpeechRecognition support manually' },
  { id: 31, name: "Speech Synthesis", test: () => {
    const voices = speechSynthesis.getVoices();
    return voices.length > 0 ? "Supported" : "No voices available";
  }, action: () => {
    const utterance = new SpeechSynthesisUtterance("Hello! This is a speech synthesis test.");
    speechSynthesis.speak(utterance);
  }},
  { id: 32, name: "Storage Estimate", test: async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const est = await navigator.storage.estimate();
      return `Quota: ${(est.quota/1048576).toFixed(2)} MB, Used: ${(est.usage/1048576).toFixed(2)} MB`;
    } else return 'Not Supported';
  }},
  { id: 33, name: "Touch Events", test: () => 'ontouchstart' in window ? "Supported" : "Not Supported" },
  { id: 34, name: "USB Access", test: () => navigator.usb ? "Supported (Click to test)" : "Not Supported", action: async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [] });
      alert(`Connected: ${device.productName}`);
    } catch (e) { alert("No USB selected or not supported."); }
  }},
  { id: 35, name: "Vibration", test: () => navigator.vibrate ? "Supported (Click to test)" : "Not Supported", action: () => navigator.vibrate([200, 100, 200]) },
  { id: 36, name: "Wake Lock", test: () => 'wakeLock' in navigator ? "Supported" : "Not Supported" },
  { id: 37, name: "Web Bluetooth", test: () => 'bluetooth' in navigator ? "Supported (Click to test)" : "Not Supported", action: async () => {
    try {
      await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      alert("Device selected.");
    } catch (e) { alert("Bluetooth request cancelled."); }
  }},
  { id: 38, name: "Web Share Target", test: () => 'Not directly testable here' },
  { id: 39, name: "WebRTC", test: () => 'RTCPeerConnection' in window ? "Supported" : "Not Supported" },
  { id: 40, name: "Window Management", test: () => 'getScreenDetails' in window ? "Supported" : "Not Supported" },
  { id: 41, name: "Gamepad API", test: () => 'getGamepads' in navigator ? "Supported (Use gamepad)" : "Not Supported" },
  { id: 42, name: "Screen Orientation", test: () => screen.orientation ? `Type: ${screen.orientation.type}` : "Not Supported" },
  { id: 43, name: "Pointer Lock", test: () => 'pointerLockElement' in document ? "Supported" : "Not Supported" },
  { id: 44, name: "Proximity Sensor", test: () => "Needs HTTPS & Permissions API (Hard to test here)" },
  { id: 45, name: "Presentation API", test: () => 'presentation' in navigator ? "Supported" : "Not Supported" },
  { id: 46, name: "Encrypted Media Extensions", test: () => 'requestMediaKeySystemAccess' in navigator ? "Supported" : "Not Supported" },
  { id: 47, name: "Media Session API", test: () => 'mediaSession' in navigator ? "Supported" : "Not Supported" },
  { id: 48, name: "Credential Management", test: () => 'credentials' in navigator ? "Supported" : "Not Supported" }
];

async function render() {
  const container = document.getElementById('features');
  for (let f of features) {
    const div = document.createElement('div');
    div.className = "feature-box";
    const result = await (typeof f.test === 'function' ? f.test() : f.test);
    div.innerHTML = `<h2 class="text-lg font-semibold">${f.id}. ${f.name}</h2>
                     <p class="text-sm mb-2">Result: ${result}</p>`;
    if (f.action) {
      const btn = document.createElement('button');
      btn.textContent = "Test Feature";
      btn.onclick = f.action;
      div.appendChild(btn);
    }
    container.appendChild(div);
  }
}

render();
