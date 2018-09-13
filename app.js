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
CLASSES
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

Memoria.prototype.stripPunctuationAndWhiteSpace = function(str) {
  str = str.trim();
  str = str.split('&nbsp').join(''); // I have a space start in final-span so that it formats correctly. This gets rid of it for parsing.
  const punctuation = '.,-$?!()[]\'";:@#%/';
  const whitespaceChars = '\n'
  let stripped = str.split('').filter(function(elem) {
    return !punctuation.includes(elem) && !whitespaceChars.includes(elem);
  }).join('');
  return stripped;
}

Memoria.prototype.createStrippedChunks = function() {
  this.strippedChunks = this.originalChunks.map(chunk => this.stripPunctuationAndWhiteSpace(chunk));
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
  voiceText = memoria.stripPunctuationAndWhiteSpace(voiceText);
  let lowerCaseVoiceText = voiceText.toLowerCase(); 

  this.voiceWords = voiceText ? voiceText.split(' ').filter(x => x.length !== 0) : [];
  this.voiceWordsLowerCase = lowerCaseVoiceText ? lowerCaseVoiceText.split(' ').filter(x => x.length !== 0) : [];

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
    return '';
  } else {
    return this.missedWords.join(', ');
  }
}

Memoria.prototype.getAddedWordsStr = function() {
  if (this.addedWords.length === 0) {
    return '';
  } else {
    return this.addedWords.join(', ');
  }
}

Memoria.prototype.compareCurrentChunk = function(voiceString) {
  this.createVoiceWords();
  this.createChunkWords();
  this.createMissedWords();
  this.createAddedWords();
}

// function Pulse() {
//   this.seconds = 0;
//   this.timer = setInterval(function(my) {
//     if (my.seconds >= 60) {
//       view.stopMicPulse();
//     } else {
//       this.seconds++;
//     }
//   }, 1000, this);
// }

// Pulse.prototype.stopTimer = function() {
//   clearInterval(this.timer);
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
  view.displayLineLocation();
  // $("#final-span").focus();
  $('.memory-box').animate({height: '400px', opacity: 1}, 1500, function() {
    $('#memory-box-fade').css({display: 'hidden'});
    $('#memory-box-fade').show();
    $('#memory-box-fade').animate({opacity: 1}, 1000, function() {
      view.focusVoiceSpan();
    });
  });

  $('#mic').click(function(event) {
    speakButton(event);
  });
  $('#memorize-button').click(function() {
    memorizeButton('\n');
  });

  $('#voice-text-input-box').click(function() {
    view.focusVoiceSpan();
  });

  $("#final-span").on('keydown', function(event) {
    if (event.which === 13) { // enter button
      event.preventDefault();
      // console.log(event);

      compareButton();
    }
    if (event.which === 37) { // left arrow button
      previousButton();
    }
    if (event.which === 39) { // right arrow button
      nextButton();
    }
  });

  $("html").keyup(function(event) {
    if (event.keyCode === 192) {
      speakButton(event);
    }
  });

  // $('#compare-button').click(function() {
  //   compareButton();
  // });
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
CONTROLLER
*****************************************************/
var controller = {
  getVoiceText: function() {
    return $('#final-span').html().trim();
  },
}

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

function speakButton(event) {
  if (recognizing) {
    // view.stopPulse('#mic');
    recognition.stop();
    view.stopMicPulse();
    return;
  }

  // view.startPulse('#mic');
  final_transcript = '';
  view.startMicPulse();
  recognition.start();
  ignore_onend = false;
  $('#final-span').html('');
  $('#interim-span').html('');
  $('#speak-button').html('Stop');
  start_timestamp = event.timeStamp;
}

function nextButton() {
  if (memoria.originalChunks.length - 1 === memoria.currentChunkIdx) {
    view.displayError('You\'ve reached the end!');
  } else {
    view.clearComparisonDisplay();
    memoria.currentChunkIdx++;
    view.displayLineLocation();
    view.focusVoiceSpan();
    view.clearVoiceText();
  }
}

function previousButton() {
  if (memoria.currentChunkIdx === 0) {
    view.displayError('You\'re already at the beginning!');
  } else {
    view.clearComparisonDisplay();
    view.clearVoiceText();
    memoria.currentChunkIdx--;
    view.displayLineLocation();
    view.focusVoiceSpan();
  }
}

function againButton() {
  view.clearComparisonDisplay();
  view.focusVoiceSpan();
  view.clearVoiceText();
}

function startOverButton() {
  view.clearComparisonDisplay();
  memoria.currentChunkIdx = 0;
  view.displayLineLocation();
  view.focusVoiceSpan();
  view.clearVoiceText();
} 

function compareButton() {
  view.clearComparisonDisplay();
  memoria.compareCurrentChunk();
  console.log(memoria.voiceWords);
  if (memoria.missedWords.length === 0 && memoria.addedWords.length === 0) {
    view.displayAllCorrect();
  } else {
    view.displayMissed(memoria.getMissedWordsStr());
    view.displayAdded(memoria.getAddedWordsStr());
    view.displayOriginalChunk(memoria.originalChunks[memoria.currentChunkIdx]);
  }
  
  view.focusVoiceSpan();
}

/****************************************************
VIEW
*****************************************************/
let view = {
  displayMissed: function(str) {
    if (str.length === 0) {return;}
    $('.missed').html(str);
    $('#missed-headline').animate({opacity: 1, "margin-left": '1px'}, 500);
    $('.missed').animate({opacity: 1}, 500);
  },
  displayAdded: function(str) {
    if (str.length === 0) {return;}
    $('.added').html(str);
    $('#added-headline').animate({opacity: 1, "margin-left": '1px'}, 500);
    $('.added').animate({opacity: 1}, 500);
  },
  displayOriginalChunk: function(str) {
    $('#original-chunk').html(str);
    // $('#original-chunk').animate({left: '55%'}, 800);
    $('#original-chunk').animate({opacity: 1}, 500)
  },
  displayError: function(str) {
    $('#error-display').html(str);
  },
  clearComparisonDisplay: function() {
    $('#original-chunk').html('');
    $('#error-display').html('');
    $('.comparison-headline').css({opacity: 0, margin: '0 50px'});
    $('.comparison-details').html('');
    $('.comparison-details').css({opacity: 0});
    $("#all-correct").html('');
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
  },
  focusVoiceSpan: function() {
    $("#final-span").focus();
  },
  clearVoiceText: function() {
    $("#final-span").html('');
  },
  displayAllCorrect: function() {
    $("#all-correct").html('You nailed it!');
    $('#all-correct').addClass('all-correct');
    setTimeout(function() {
      $("#all-correct").html('');
      $('#all-correct').removeClass('all-correct');
    }, 2100);
  },
  // pulses: [],
  startMicPulse: function() {
    $('#mic').animate({opacity: 0}, 1000, function() {
      $('#mic').animate({opacity: 1}, 1000, view.startMicPulse);
    });
    // view.pulses.push(new Pulse());
    // console.log(view.pulses);
  },
  stopMicPulse: function() {
    // view.pulses.forEach(function(pulse) {
    //   pulse.stopTimer();
    // });
    // view.pulses = [];
    $('#mic').stop(false, false).css({opacity: 1});
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
      view.stopMicPulse();
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
