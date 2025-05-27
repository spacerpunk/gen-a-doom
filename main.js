// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const startStopButton = document.getElementById('startStopButton');
    const tempoSlider = document.getElementById('tempoSlider');
    const tempoValueDisplay = document.getElementById('tempoValue');

    let synth;
    let distortion;
    let sequence; // Added
    let isPlaying = false;

    // Initialize Tone.js components
    function setupAudio() {
        // Simple Synth
        synth = new Tone.Synth({
            oscillator: {
                type: 'square' // Square wave for a classic 8-bit sound
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.2,
                release: 0.1
            }
        }); // Do not connect to destination directly here

        // Distortion Effect
        distortion = new Tone.Distortion(0.6).toDestination(); // Increased distortion slightly

        // Connect synth to distortion, then distortion to master output
        synth.connect(distortion);

        console.log('Tone.js audio components initialized and synth connected through distortion.');

        // Define a Doom-like sequence
        // Using C minor scale notes (C, D, Eb, F, G, Ab, Bb)
        // A simple, driving bassline pattern
        const notes = [
            'C3', ['Eb3', 'C3'], 'G2', ['Ab2', 'G2']
        ];

        sequence = new Tone.Sequence((time, note) => {
            synth.triggerAttackRelease(note, '8n', time);
        }, notes, '4n'); // Events are scheduled every quarter note. '8n' in triggerAttackRelease determines actual length.

        sequence.loop = true; // Ensure the sequence loops
    }

    // Event listener for the start/stop button
    startStopButton.addEventListener('click', async () => {
        if (!Tone.context.state || Tone.context.state !== 'running') {
            await Tone.start();
            console.log('AudioContext started!');
            if (!synth) { // Initialize audio components only after Tone.start()
                setupAudio();
            }
        }

        // Check if synth and sequence are initialized (they should be if setupAudio was called)
        if (!synth || !sequence) {
            console.error('Audio components not ready. Please try again.');
            // Potentially call setupAudio() again if it failed or wasn't called
            if (!synth) setupAudio(); 
            if (!synth || !sequence) return; // Exit if still not ready
        }

        if (isPlaying) {
            // Stop the music
            Tone.Transport.stop();
            sequence.stop(); // Stop the sequence explicitly
            // Tone.Transport.cancel(0); // Clears scheduled events, good for a hard stop
            
            startStopButton.textContent = 'Start';
            isPlaying = false;
            console.log('Music stopped. Transport and sequence stopped.');
        } else {
            // Start the music
            // Ensure Transport is at the beginning if re-starting
            Tone.Transport.seconds = 0; // Reset transport time to 0 for a clean start
            Tone.Transport.start();
            sequence.start(0); // Start the sequence from the beginning of the transport timeline
            
            startStopButton.textContent = 'Stop';
            isPlaying = true;
            console.log('Music started. Transport and sequence started.');
        }
    });

    // Event listener for the tempo slider
    tempoSlider.addEventListener('input', (event) => {
        const newTempo = event.target.value;
        tempoValueDisplay.textContent = `${newTempo} BPM`;
        Tone.Transport.bpm.value = newTempo; // This will be enabled when transport is used
        console.log(`Tempo changed to: ${newTempo}`);
    });

    // Initial tempo display
    tempoValueDisplay.textContent = `${tempoSlider.value} BPM`;

    console.log('main.js loaded and event listeners attached.');
});
