// js/main.js
const csInterface = new CSInterface();
let subtitles = [];
let currentEditingIndex = -1;

// Initialize Speech Recognition
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.lang = 'ar-SA';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Error handling for speech recognition
recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
    alert('Speech recognition error: ' + event.error);
};

// Success handling for speech recognition
recognition.onresult = function(event) {
    const transcript = event.results[event.results.length - 1][0].transcript;
    const confidence = event.results[event.results.length - 1][0].confidence;
    
    if (confidence > 0.8) {
        addSubtitle({
            text: transcript,
            startTime: getCurrentPlayheadTime(),
            endTime: getCurrentPlayheadTime() + 2,
            confidence: confidence
        });
    }
};

// Initialize UI elements
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('transcribeBtn').addEventListener('click', startTranscription);
    document.getElementById('updateSubtitle').addEventListener('click', updateCurrentSubtitle);
    
    // Initialize CSInterface event listeners
    csInterface.addEventListener('com.adobe.csxs.events.playheadChanged', function(event) {
        updatePreview(event.data);
    });
});

function startTranscription() {
    csInterface.evalScript('getSequenceAudio()', function(result) {
        if (result === 'false') {
            alert('No active sequence found. Please open a sequence first.');
            return;
        }
        
        recognition.start();
        document.getElementById('transcribeBtn').textContent = 'Transcribing...';
        document.getElementById('transcribeBtn').disabled = true;
    });
}

function addSubtitle(subtitle) {
    subtitles.push(subtitle);
    updateSubtitleList();
    csInterface.evalScript(`createSubtitle("${subtitle.text}", ${subtitle.startTime}, ${subtitle.endTime})`);
}

function updateSubtitleList() {
    const subtitleList = document.getElementById('subtitleList');
    subtitleList.innerHTML = '';
    
    subtitles.forEach((subtitle, index) => {
        const subtitleElement = document.createElement('div');
        subtitleElement.className = 'subtitle-item';
        subtitleElement.textContent = `${formatTime(subtitle.startTime)} - ${subtitle.text}`;
        subtitleElement.onclick = () => editSubtitle(index);
        subtitleList.appendChild(subtitleElement);
    });
}

function editSubtitle(index) {
    currentEditingIndex = index;
    const subtitle = subtitles[index];
    document.getElementById('currentSubtitle').value = subtitle.text;
}

function updateCurrentSubtitle() {
    if (currentEditingIndex === -1) return;
    
    const newText = document.getElementById('currentSubtitle').value;
    subtitles[currentEditingIndex].text = newText;
    
    csInterface.evalScript(`updateSubtitle(${currentEditingIndex}, "${newText}")`);
    updateSubtitleList();
}

function formatTime(seconds) {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
}

function getCurrentPlayheadTime() {
    return new Promise((resolve) => {
        csInterface.evalScript('getCurrentTime()', (time) => {
            resolve(parseFloat(time));
        });
    });
}