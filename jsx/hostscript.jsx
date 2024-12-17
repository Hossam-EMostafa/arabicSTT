// jsx/hostscript.jsx
function getSequenceAudio() {
    if (app.project.activeSequence === null) return false;

    const sequence = app.project.activeSequence;
    const audioTracks = sequence.audioTracks;

    if (audioTracks.numTracks === 0) return false;

    return true;
}

function createSubtitle(text, startTime, endTime) {
    const sequence = app.project.activeSequence;
    if (!sequence) return;

    // Create or get the subtitle video track
    let textTrack;
    if (sequence.videoTracks.numTracks === 0) {
        textTrack = sequence.videoTracks.add();
    } else {
        textTrack = sequence.videoTracks[sequence.videoTracks.numTracks - 1];
    }

    // Create text item
    const textItem = textTrack.insertTextItem(text, startTime, endTime);
    styleSubtitle(textItem);

    return true;
}

function styleSubtitle(textItem) {
    const textProperties = textItem.components[1];
    textProperties.properties.getProperty("Source Text").setValue(text);

    // Style settings
    const textDocument = textProperties.properties.getProperty("Source Text").getValue();
    textDocument.font = "Arial";
    textDocument.fontSize = 36;
    textDocument.fillColor = [1, 1, 1];
    textDocument.strokeColor = [0, 0, 0];
    textDocument.strokeWidth = 2;
    textDocument.justification = ParagraphJustification.CENTER;
    textDocument.tracking = 50;

    // Set the styled text back to the layer
    textProperties.properties.getProperty("Source Text").setValue(textDocument);

    // Position the text
    const position = textProperties.properties.getProperty("Position");
    position.setValue([sequence.width / 2, sequence.height - 100]);
}

function getCurrentTime() {
    const sequence = app.project.activeSequence;
    if (sequence) {
        return sequence.getPlayerPosition().seconds;
    }
    return 0;
}

function updateSubtitle(index, newText) {
    const sequence = app.project.activeSequence;
    if (!sequence) return;

    const textTrack = sequence.videoTracks[sequence.videoTracks.numTracks - 1];
    const textItem = textTrack.clips[index];

    if (textItem) {
        const textProperties = textItem.components[1];
        textProperties.properties.getProperty("Source Text").setValue(newText);
    }
}