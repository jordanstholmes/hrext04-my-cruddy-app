

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
    startButton(event);
  });
});

function startButton(event) {
  console.log('Start button clicked');
  if (recognizing) {
    $('#speak-button').html('Speak');
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = 'en-US';
  recognition.start();
  ignore_onend = false;
  $("#speech-output").html('');
  $('#speak-button').html('Stop');
  // interim_span.innerHTML = '';
  // start_img.src = 'mic-slash.gif';
  // showInfo('info_allow');
  // showButtons('none');
  start_timestamp = event.timeStamp;
}

function initializeSpeechObject() {
  var speechObj = new webkitSpeechRecognition();
  speechObj.continuous = true;
  speechObj.interimResults = true;

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
    $("#speech-output").html(final_transcript);
    // final_transcript = capitalize(final_transcript);
    // final_span.innerHTML = linebreak(final_transcript);
    // interim_span.innerHTML = linebreak(interim_transcript);
    // if (final_transcript || interim_transcript) {
    //   showButtons('inline-block');
    // }
  };
}

function addEndBehavior(speechObj) {
  speechObj.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    // start_img.src = 'mic.gif';
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    // showInfo('');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
    // if (create_email) {
    //   create_email = false;
    //   createEmail();
    // }
  };
}

function addStartBehavior(speechObj) {
  speechObj.onstart = function() {
    recognizing = true;
  };
}
