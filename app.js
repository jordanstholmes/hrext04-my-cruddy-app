"use strict";

/****************************************************
GLOBAL VARIABLES (refactor)
*****************************************************/


var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
var currentChunkIdx = undefined;

if (!('webkitSpeechRecognition' in window)) {
  console.log('speech recognition not available in this browser');
} else {
  var recognition = initializeSpeechObject();
}

 //    <button id="next-button">Next</button>
 //    <button id="previous-button">Previous</button>
 //    <button id="start-over-button">Start Over</button>
 //    <script src="app.js"></script>

$(document).ready(function() {
  $('#speak-button').click(function(event) {
    speakButton(event);
  });
  $('#memorize-button').click(function() {
    console.log('memorize was clicked');
    memorizeButton('\n');
  });
  $('#compare-button').click(function() {
    compareButton();
  });
  $('#again-button').click(function() {
    againButton();
  });
  $('#next-button').click(function() {
    nextButton();
  });
  $('#previous-button').click(function() {
    previousButton();
  });
  $('#start-over-button').click(function() {
    startOverButton();
  })
});

/****************************************************
HANDLING SOURCE INPUT
*****************************************************/

function stripChunk(string) {
  string = string.toLowerCase();
  const punctuation = '.,-$?!()[]\'";:@#%/';
  const whitespaceChars = '\n'
  let stripped = string.split('').filter(function(elem) {
    return !punctuation.includes(elem) && !whitespaceChars.includes(elem);
  }).join('');
  return stripped;
}

/****************************************************
COMPARING VOICE TO CHUNK
*****************************************************/

function compareToChunk(voiceString, chunkIdx) {
  let voiceWords = voiceString.split(' ');
  let chunkWords = getChunksArray(chunkIdx)[1].split(' '); // The chunks array has 2-element nested arrays, the element at index 1 has the stripped version
  let missed = chunkWords.reduce(function(acc, word) {
    if (!voiceWords.includes(word.toLowerCase())) {
      acc += '\t' +word + '\n';
    }
    return acc;
  }, '');
  let missedStr = 'Missed:\n' + (missed || 'none!');
  $('#comparison-missed').html(missedStr);

  let added = voiceWords.reduce(function(acc, word) {
    if (!chunkWords.includes(word.toLowerCase())) {
      acc += '\t' + word + '\n';
    }
    return acc;
  }, '');
  let addedStr = 'Added:\n' + (added || 'none!');
  $('#comparison-added').html(addedStr);

  // return 'Missed:\n' + (missed || 'none!')+ '\n' + 'Added:\n' + (added || 'none!');
}

/****************************************************
BUTTONS
*****************************************************/
function nextButton() {
  if (getChunksArray().length - 1 === currentChunkIdx) {
    $('#error-display').html('You\'ve reached the end!');
  } else {
    clearComparisonDisplay();
    currentChunkIdx++;
    displayLineLocation();
  }
}

function previousButton() {
  if (currentChunkIdx === 0) {
    $('#error-display').html('You\'re already at the beginning!');
  } else {
    clearComparisonDisplay();
    currentChunkIdx--;
    displayLineLocation();
  }
}

function againButton() {
  clearComparisonDisplay();
}

function startOverButton() {
  clearComparisonDisplay();
  currentChunkIdx = 0;
  displayLineLocation();
} 

function compareButton() {
  let voiceString = $('#final-span').html();
  console.log(voiceString);
  // let resultStr = compareToChunk(voiceString, currentChunkIdx);
  compareToChunk(voiceString, currentChunkIdx);
  let currentChunkOriginal = getChunksArray(currentChunkIdx)[0];
  $('#original-chunk').html(currentChunkOriginal);
  // $('#comparison-details').html(resultStr);
  // console.log(resultStr); 
}

function memorizeButton(delimeter) {
  let sourceText = $('#source-text-input').val().trim();
  let last = sourceText.length - delimeter.length;
  if (sourceText.slice(last) === delimeter) {
    sourceText = sourceText.slice(0, last);
  } 
  localStorage.setItem('source text', sourceText);

  let chunkedSourceText = sourceText.split(delimeter).map(chunk => chunk.trim());
  let strippedChunks = chunkedSourceText.map(chunk => stripChunk(chunk));

  let chunks = chunkedSourceText.reduce(function(result, sourceChunk, idx) {
    result.push([sourceChunk, strippedChunks[idx]]);
    return result;
  }, []);

  localStorage.setItem('chunks', JSON.stringify(chunks));

  currentChunkIdx = 0;
  displayLineLocation();

  console.log(chunkedSourceText);
  console.log(strippedChunks);
  // console.log(chunks);
  console.log(getChunksArray());
}

function speakButton(event) {
  if (recognizing) {
    $('#speak-button').html('Speak');
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.start();
  ignore_onend = false;
  $('#final-span').html('');
  $('#interim-span').html('');
  $('#speak-button').html('Stop');
  start_timestamp = event.timeStamp;
}


/****************************************************
SPEECH RECOGNITION STUFF
*****************************************************/

function initializeSpeechObject() {
  var speechObj = new webkitSpeechRecognition();
  speechObj.continuous = true;
  speechObj.interimResults = true;
  speechObj.lang = 'en-US';

  addErrorBehavior(speechObj);
  addResultBehavior(speechObj);
  addEndBehavior(speechObj);
  addStartBehavior(speechObj);

  return speechObj;
}

function addErrorBehavior(speechObj) {
  speechObj.onerror = function(event) {
    if (event.error == 'no-speech') {
      // start_img.src = 'mic.gif';
      console.log('No speech was detected.');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      // start_img.src = 'mic.gif';
      console.log('No microphone was found.');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        console.log('Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream');
      } else {
        console.log('Permission to use microphone was denied.');
      }
      ignore_onend = true;
    }
  };
}

function addResultBehavior(speechObj) {
  speechObj.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    $("#final-span").html(final_transcript);
    $("#interim-span").html(interim_transcript);
  };
}

function addEndBehavior(speechObj) {
  speechObj.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    if (!final_transcript) {
      // showInfo('info_start');
      return;
    }
  };
}

function addStartBehavior(speechObj) {
  speechObj.onstart = function() {
    recognizing = true;
  };
}

/****************************************************
HELPER FUNCTIONS
*****************************************************/
// <div id="original-chunk"></div>
//       <div id="comparison-details">
//         <div id="comparison-missed"></div>
//         <div id="comparison-added"></div>
function clearComparisonDisplay() {
  $('#original-chunk').html('');
  $('#comparison-missed').html('');
  $('#comparison-added').html('');
  $('#error-display').html('');
  $('#final-span').html('');
}

function getChunksArray(idx) {
  if (idx === undefined) {
    return JSON.parse(localStorage.getItem('chunks'));
  } else {
    return JSON.parse(localStorage.getItem('chunks'))[idx]; 
  }
}

function displayLineLocation() {
  let lineNumDisplay = (currentChunkIdx + 1).toString() + '/' + (getChunksArray().length).toString(); 
  $('#line-location-display').html(lineNumDisplay);
}


