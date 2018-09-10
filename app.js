
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
  $('#speak-button').click(function(event) {
    speakButton(event);
  });
  $('#memorize-button').click(function(event) {
    memorizeButton();
  });
});

/****************************************************
HANDLING SOURCE INPUT
*****************************************************/

function memorizeButton() {
  let sourceText = $('#source-text-input').val();
  localStorage.setItem('source text', sourceText);
}

/****************************************************
SPEECH RECOGNITION STUFF
*****************************************************/


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
