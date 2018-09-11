"use strict";

/****************************************************
MODEL
*****************************************************/
let memoria = localStorage.getItem('chunks')
if (memoria) {
  memoria = JSON.parse(memoria);
} else {
  memoria = {
    currentChunkIdx: 0,
    sourceText: undefined,
    chunks: undefined
  }
}

function memorizeButton(delimeter) {
  // let sourceText = $('#source-text-input').val().trim();
  memoria.sourceText = $('#source-text-input').val().trim();
  let last = memoria.sourceText.length - delimeter.length;
  if (memoria.sourceText.slice(last) === delimeter) {
    memoria.sourceText = memoria.sourceText.slice(0, last);
  } 
  // localStorage.setItem('source text', memoria.sourceText);

  let chunkedSourceText = memoria.sourceText.split(delimeter).map(chunk => chunk.trim());
  let strippedChunks = chunkedSourceText.map(chunk => stripChunk(chunk));

  let chunks = chunkedSourceText.reduce(function(result, sourceChunk, idx) {
    result.push([sourceChunk, strippedChunks[idx]]);
    return result;
  }, []);

  // localStorage.setItem('chunks', JSON.stringify(chunks));
  memoria.chunks = chunks;

  memoria.currentChunkIdx = 0;
  clearComparisonDisplay();
  clearSourceTextDisplay();

  displayLineLocation();
}
// (sourceName) {
//   this.sourceName = sourceName;
//   this.memoria.currentChunkIdx = 0;
//   this.sourceText = undefined;
// }

/****************************************************
GLOBAL VARIABLES (refactor)
*****************************************************/


var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

if (!('webkitSpeechRecognition' in window)) {
  console.log('speech recognition not available in this browser');
} else {
  var recognition = initializeSpeechObject();
}

$(document).ready(function() {
  displayLineLocation();

  $('#speak-button').click(function(event) {
    speakButton(event);
  });
  $('#memorize-button').click(function() {
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
  $('#beginning-button').click(function() {
    startOverButton();
  })
});

/****************************************************
VIEW
*****************************************************/


/****************************************************
CONTROLLER
*****************************************************/


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
  let voiceWords = voiceString.trim().toLowerCase().split(' ');
  let chunkWords = memoria.chunks[chunkIdx][1].split(' '); // The chunks array has 2-element nested arrays, the element at index 1 has the stripped version
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

}

/****************************************************
BUTTONS
*****************************************************/
function nextButton() {
  if (memoria.chunks.length - 1 === memoria.currentChunkIdx) {
    $('#error-display').html('You\'ve reached the end!');
  } else {
    clearComparisonDisplay();
    memoria.currentChunkIdx++;
    displayLineLocation();
  }
}

function previousButton() {
  if (memoria.currentChunkIdx === 0) {
    $('#error-display').html('You\'re already at the beginning!');
  } else {
    clearComparisonDisplay();
    memoria.currentChunkIdx--;
    displayLineLocation();
  }
}

function againButton() {
  clearComparisonDisplay();
}

function startOverButton() {
  clearComparisonDisplay();
  memoria.currentChunkIdx = 0;
  displayLineLocation();
} 

function compareButton() {
  let voiceString = $('#final-span').html();
  compareToChunk(voiceString, memoria.currentChunkIdx);
  let currentChunkOriginal = memoria.chunks[memoria.currentChunkIdx][0];
  $('#original-chunk').html(currentChunkOriginal);
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
      console.log('No speech was detected.');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
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

function clearComparisonDisplay() {
  $('#original-chunk').html('');
  $('#comparison-missed').html('');
  $('#comparison-added').html('');
  $('#error-display').html('');
  $('#final-span').html('');
}

// function getChunksArray(idx) {
//   if (idx === undefined) {
//     return JSON.parse(localStorage.getItem('chunks'));
//   } else {
//     return JSON.parse(localStorage.getItem('chunks'))[idx]; 
//   }
// }

function displayLineLocation() {
  let lineNumDisplay;
  if (memoria.chunks === undefined) {
    lineNumDisplay = '0/0';
  } else {
    lineNumDisplay = (memoria.currentChunkIdx + 1).toString() + '/' + (memoria.chunks.length).toString(); 
  }
  $('#line-location-display').html(lineNumDisplay);
}

function clearSourceTextDisplay() {
  $('#source-text-input').val('');
}

