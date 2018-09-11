"use strict";

// JORDAN: at some point you may want to make some of the object properties getters so that you don't get stale data
// Next factor all the DOM stuff to DISPLAY and make the CONTROLLER the intermediary between DISPLAY and MODEL

let memoria = localStorage.getItem('memoria')
if (memoria) {
  memoria = JSON.parse(memoria);
  memoria.__proto__ = Memoria.prototype; // JSON.stringify, aparently does not preserve any "not-owned" properties
} else {
  memoria = new Memoria();
}

/****************************************************
MEMORIA CLASS
*****************************************************/
function Memoria(sourceText) {
  this.currentChunkIdx = 0;
  this.delimeter = undefined;
  this.sourceText = sourceText;
  this.originalChunks = [];
  this.strippedChunks = [];
  this.chunkWords = [];
  this.chunkWordsLowerCase = [];
  this.voiceWords = [];
  this.voiceWordsLowerCase = [];
  this.missedWords = [];
  this.addedWords = [];
}

Memoria.prototype.createChunks = function() {
  this.originalChunks = this.sourceText.split(this.delimeter).map(x => x.trim());
}

Memoria.prototype.stripPunctuationAndNewlines = function(str) {
  const punctuation = '.,-$?!()[]\'";:@#%/';
  const whitespaceChars = '\n'
  let stripped = str.split('').filter(function(elem) {
    return !punctuation.includes(elem) && !whitespaceChars.includes(elem);
  }).join('');
  return stripped;
}

Memoria.prototype.createStrippedChunks = function() {
  this.strippedChunks = this.originalChunks.map(chunk => this.stripPunctuationAndNewlines(chunk));
}

Memoria.prototype.trimSourceInput = function() {
  let text = this.sourceText.trim();
  let last = text.length - this.delimeter.length;
  if (text.slice(last) === this.delimeter) {
    text = text.slice(0, last);
  }
  this.sourceText = text;
}

Memoria.prototype.createChunkWords = function() {
  this.chunkWords = this.strippedChunks[this.currentChunkIdx].split(' ');
  this.chunkWordsLowerCase = this.chunkWords.map(word => word.toLowerCase());
}

Memoria.prototype.createVoiceWords = function() {
  let voiceText = controller.getVoiceText();
  voiceText = memoria.stripPunctuationAndNewlines(voiceText);
  let lowerCaseVoiceText = voiceText.toLowerCase();

  this.voiceWords = voiceText ? voiceText.split(' ') : [];
  this.voiceWordsLowerCase = lowerCaseVoiceText ? lowerCaseVoiceText.split(' ') : [];
}

Memoria.prototype.createMissedWords = function() {
  this.missedWords = _.reduce(this.chunkWordsLowerCase, function(acc, word, index) {
    if (!this.voiceWordsLowerCase.includes(word)) {
      acc.push(this.chunkWords[index]);
    }
    return acc;
  }, [], memoria);
}

Memoria.prototype.createAddedWords = function() {
  this.addedWords = _.reduce(this.voiceWordsLowerCase, function(acc, word, index) {
    if (!this.chunkWordsLowerCase.includes(word)) {
      acc.push(this.voiceWords[index]);
    }
    return acc;
  }, [], memoria);
}

Memoria.prototype.getMissedWordsStr = function() {
  if (this.missedWords.length === 0) {
    return 'Missed: none!';
  } else {
    return 'Missed: ' + this.missedWords.join(' ');
  }
}

Memoria.prototype.getAddedWordsStr = function() {
  if (this.addedWords.length === 0) {
    return 'Added: none!';
  } else {
    return 'Added: ' + this.addedWords.join(' ');
  }
}

Memoria.prototype.compareCurrentChunk = function(voiceString) {
  this.createVoiceWords();
  this.createChunkWords();
  this.createMissedWords();
  this.createAddedWords();
  //JORDAN: split the 'compareToChunk' function into smaller pieces and then add to prototype
}


/*
JORDAN: you're in the middle of factoring out most of memorizeButton.
It should just tell the model and the display what to, but not do it itself (perhaps instantiate a memoria object)??
*/

function memorizeButton(delimeter) {
  memoria.delimeter = '\n';
  memoria.sourceText = $('#source-text-input').val(); 
  memoria.trimSourceInput();

  memoria.createChunks();
  memoria.createStrippedChunks();

  memoria.currentChunkIdx = 0;
  view.clearComparisonDisplay();
  view.clearSourceTextDisplay();

  localStorage.setItem('memoria', JSON.stringify(memoria));
  view.displayLineLocation();
  console.log(memoria);
}

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
  view.displayLineLocation();

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
CONTROLLER
*****************************************************/
var controller = {
  getVoiceText: function() {
    return $('#final-span').html().trim();
  }
}

function nextButton() {
  if (memoria.originalChunks.length - 1 === memoria.currentChunkIdx) {
    view.displayError('You\'ve reached the end!');
  } else {
    view.clearComparisonDisplay();
    memoria.currentChunkIdx++;
    view.displayLineLocation();
  }
}

function previousButton() {
  if (memoria.currentChunkIdx === 0) {
    view.displayError('You\'re already at the beginning!');
  } else {
    view.clearComparisonDisplay();
    memoria.currentChunkIdx--;
    view.displayLineLocation();
  }
}

function againButton() {
  view.clearComparisonDisplay();
}

function startOverButton() {
  view.clearComparisonDisplay();
  memoria.currentChunkIdx = 0;
  view.displayLineLocation();
} 

function compareButton() {
  memoria.compareCurrentChunk();
  view.displayMissed(memoria.getMissedWordsStr());
  view.displayAdded(memoria.getAddedWordsStr());
  view.displayOriginalChunk(memoria.originalChunks[memoria.currentChunkIdx]);
}

/****************************************************
VIEW
*****************************************************/
let view = {
  displayMissed: function(str) {
    $('#comparison-missed').html(str);
  },
  displayAdded: function(str) {
    $('#comparison-added').html(str);
  },
  displayOriginalChunk: function(str) {
    $('#original-chunk').html(str);
  },
  displayError: function(str) {
    $('#error-display').html(str)
  },
  clearComparisonDisplay: function() {
    $('#original-chunk').html('');
    $('#comparison-missed').html('');
    $('#comparison-added').html('');
    $('#error-display').html('');
    $('#final-span').html('');
  },
  clearSourceTextDisplay: function() {
    $('#source-text-input').val('');
  },
  displayLineLocation: function() {
    let lineNumDisplay;
    if (memoria.originalChunks.length === 0) {
      lineNumDisplay = '0/0';
    } else {
      lineNumDisplay = (memoria.currentChunkIdx + 1).toString() + '/' + (memoria.originalChunks.length).toString(); 
    }
    $('#line-location-display').html(lineNumDisplay);
  }
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
