let numClicks = 0;
let startTime;
let endTime;
let testStarted = false;
const results = document.getElementById('results');
const clickButton = document.getElementById('clickButton');
const inputTime = document.getElementById('inputTime');

function clicked() {
    if (!testStarted) {
        // Start the test
        const time = parseInt(inputTime.value, 10);

        if (isNaN(time) || time <= 0) {
            results.textContent = 'Please enter a valid number greater than 0';
            return;
        }

        numClicks = 0;
        startTime = Date.now();
        endTime = startTime + (time * 1000);
        testStarted = true;

        results.textContent = 'Test Started! Click as fast as you can!';
        
        // Disable button for the duration of the test
        setTimeout(() => {
            clickButton.disabled = true;
            const totalTime = (endTime - startTime) / 1000;
            const cps = (numClicks / totalTime).toFixed(2);
            results.textContent = `Test Ended! You clicked ${numClicks} times. CPS: ${cps}`;
        }, time * 1000);
    } else {
        // Count clicks if the test has started
        numClicks++;
    }
}

function restart() {
    numClicks = 0;
    startTime = null;
    endTime = null;
    inputTime.value = '';
    results.textContent = 'Click to Start';
    clickButton.disabled = false;
    testStarted = false;
}
