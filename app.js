"use strict";

/****************************************************
MODEL
*****************************************************/
let memoria = localStorage.getItem('memoria')
if (memoria) {
  memoria = JSON.parse(memoria);
} else {
  memoria = new Memoria();
}

function Memoria(sourceText) {
  this.currentChunkIdx = 0;
  this.delimeter = undefined;
  this.sourceText = sourceText;
  this.originalChunks = undefined;
  this.strippedChunks = undefined;
}

Memoria.prototype.createChunks = function() {
  this.originalChunks = this.sourceText.split(this.delimeter).map(x => x.trim());
}

Memoria.prototype.stripChunk = function(chunkStr) {
  chunkStr = chunkStr.toLowerCase();
  const punctuation = '.,-$?!()[]\'";:@#%/';
  const whitespaceChars = '\n'
  let stripped = chunkStr.split('').filter(function(elem) {
    return !punctuation.includes(elem) && !whitespaceChars.includes(elem);
  }).join('');
  return stripped;
}

Memoria.prototype.createStrippedChunks = function() {
  this.strippedChunks = this.originalChunks.map(chunk => this.stripChunk(chunk));
}

Memoria.prototype.trimSourceInput = function() {
  let text = this.sourceText.trim();
  let last = text.length - this.delimeter.length;
  if (text.slice(last) === this.delimeter) {
    text = text.slice(0, last);
  }
  this.sourceText = text;
}

/*
JORDAN: you're in the middle of factoring out most of memorizeButton.
It should just tell the model and the display what to, but not do it itself (perhaps instantiate a memoria object)??
*/

function memorizeButton(delimeter) {
  memoria.delimeter = delimeter;
  memoria.sourceText = $('#source-text-input').val(); 
  memoria.trimSourceInput();

  memoria.createChunks();
  memoria.createStrippedChunks();

  memoria.currentChunkIdx = 0;
  clearComparisonDisplay();
  clearSourceTextDisplay();

  localStorage.setItem('memoria', JSON.stringify(memoria));
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
var controller = {

}

/****************************************************
COMPARING VOICE TO CHUNK
*****************************************************/

function compareToChunk(voiceString, chunkIdx) {
  let voiceWords = voiceString.trim().toLowerCase().split(' ');
  let chunkWords = memoria.strippedChunks[chunkIdx].split(' ');
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
  if (memoria.originalChunks.length - 1 === memoria.currentChunkIdx) {
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
  let currentChunkOriginal = memoria.originalChunks[memoria.currentChunkIdx];
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

function displayLineLocation() {
  let lineNumDisplay;
  if (memoria.originalChunks === undefined) {
    lineNumDisplay = '0/0';
  } else {
    lineNumDisplay = (memoria.currentChunkIdx + 1).toString() + '/' + (memoria.originalChunks.length).toString(); 
  }
  $('#line-location-display').html(lineNumDisplay);
}

function clearSourceTextDisplay() {
  $('#source-text-input').val('');
}

