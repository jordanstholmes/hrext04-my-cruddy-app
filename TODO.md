# MVP
* [x] Input field for text to memorize
* [x] Split input text into chunks
* [x] Button to save source text and begin memorization process
* [x] Figure out API to input voice to text into text box
* [x] Input field to make edits
  * [] protect against newline characters turning into line breaks
* [x] display missed and added words
* [x] Check for missing words (without regard for order)
* [x] Check for extra words
* [x] Display full correct chunk
  * [] deal with weird terminal punctuation
* [] Button to display source text
* [x] Button to go to next chunk
* [x] Button to return to previous chunk
* [x] Button to start from the beginning of memorization process
* [x] Button to compare voice-to-text vs. stripped chunk

* [] Make line location clickable/editable
* [] Make buttons have animation https://codemyui.com/pure-css-cartoon-style-angled-button/
* [] Make landing page
* [] Animate recording button
* [] Animate transitions between pages
* [] Make sure background loads before page displays


* [] Add naming memorization sources
* [] Add option to save and select several memorization things
* [] Refactor for Model View Controller 

## App Features
I propose to create an app that helps you memorize a speech, monologue, poem, etc.

### App Basic Functionality:
* user inputs a text to memorize.
* the text is split into sentences and stripped of punctuation.
* user is prompted to recall the first sentence.
* user presses a button to activate voice to text (web speech API), and attempts to speak the line aloud
* app then compares the words spoken by user with the words of the first sentence and highlights any errors or omissions
* user presses a button to move on to the next sentence or return to the previous sentence.

### Additional (Potential) Functionality:
* Allow user to dynamically edit and update source text during memorization
  * (useful when you've written a speech and notice while you're memorizing it that some parts are awkward when spoken)
  * Output updated source text.
* Allow user to edit the text produced by voice to text (in case it has made errors)
* Allow user to input a list of words to autocorrect
  * (for when there is a word that speech to text consistently gets wrong - like a unusual name, etc.)
* Track errors and provide user with feedback about which sentences they're weakest on
* Gamification, give points for correct words so user can try to beat previous score
* Make it pretty

### Brainstorm Features:
* 2.5 days = 20 hours
* Approximate Difficulty = 46
* Approximate time = 21 hours
* difficulty in brackets
* sub features are included in the difficulty of their header
* If a subheader has its own difficulty, however, this is additional difficulty (+) beyond header's basic functionality
* __Bold__ features are those I've chosen to attempt
* *Italic* features are those I'm hoping to attempt after bold
* Difficulty Key:
  * [1] = done/trivial
  * [2] = .5 hours
  * [3] = 1 hour 
  * [4] = 2 hours
  * [5] = 3 hours
  * [6] = 4 hours
  * [7] = 5 hours 
  * [8] = 6 hours 
  * [9] = 7 hours 
  * [10] = 8+ hours 


### Input Source Text 

* __[2] Input field for text to memorize__
* __[3] Split input text into chunks__
  * __split by sentence (default)__
  * __strip punctuation__
  * __strip capitalization__
  * __store both original and stripped versions (with corresponding indices)__  
  * [+5] allow user to input the delimiter used to split text
* __[2] Button to save source text and begin memorization process__

### Enable voice-to-text
* __[6] Figure out API to input voice to text into text box__

### Edit Source Text During Memorization 

* [3] Input field to make edits
* [2] Button to save edits
  * [4] Save edits to chunked array
  * [4] Save edits to full source
* [4] Replace source with current voice-to-text results ("you know what, I like what I said better...")

### Edit voice-to-text output 
  
* __[3] Input field to make edits__
* *[3] Button to submit edits for comparison with chunk*

### Display full source text 

* *[3] Display full source text*
* Include any edits

### Compare voice-to-text with current chunk 
  
* __[3] Check for missing words (without regard for order)__
* __[3] Check for extra words__
* [3] Check for correct word in correct order
* [7] Be able to distinguish when one word has been skipped (without marking the rest of the chunk as wrong)

### Display results of comparison 

* __[4] Display full correct chunk__
* *[5] Display list of missing words*
* *[5] Display list of extra words*
* [9] Display voice-to-text highlighted usefully
  * with missing words added and highlighted
  * with incorrect words highlighted a different color
  * Words out of order highlighted a different color
  * Manage case where word IS in chunk, but was used too many times

### Navigation 
  
* __[4] Button to return to source text input__
* __[4] Button to go to next chunk__
* __[4] Button to return to previous chunk__
* __[4] Button to start from the beginning of memorization process__
* __[4] Button to compare voice-to-text vs. stripped chunk__

### Make it pretty 

* [6] Make buttons pretty
* [6] Make voice-to-text font display pretty
* [9] Make comparison results pretty
* [6] Make source input pretty
* [9] Make transitions between functionality pretty
* [8] Make page design pretty

### Gamification 

* [6] Award points per correct word
* [6] Subtract points per extraneous word
* [8] Display score results at the end of full text
  * words correct out of total words
  * extra words added
  * chunks completely correct out of total chunks
* [5] Disable "return to previous chunk" during game

### Auto correct for voice-to-text 

* [8] Allow user to input words to auto correct
  * input field and button for incorrect word
  * input field and button for corresponding correct word
  * Allow user to edit autocorrect list
  * Button to apply autocorrect?
  * Iterate through voice-to-text results and replace words based on autocorrect list


## Libraries
* jquery
* underscore?

## John's Brainstorm

  ### difficulty scale 1-10. 1 meaning it's already finished 10 meaning what?!?!

  5 = 3 hours
  7 = 5 hours
  10 = full day + ??

  * (5) add due date
  * (7) time stamps (moment.js)
  (5) format the display of the items in a list (need to add more detail)
  (??) fix the layout
  (7) color coded priority
  highlight certain items
  mouse over to see details
  ability to select and delete multiple items (checkbox?)
  add status/priorty and allow for sorting based on status/priority
  Item categories
  ability to add/leave comments on item
  upload files/images
  share item
  drag and drop to arrange
  search/filter on keyup/keydown
  reminders? (push operation?)
  secret corgi
  delete item confirmation
  fillet edges of boxes
  font changes/choices? (google fonts)
  Panic Button
  Highlight based on status/priority/due date
  options page (ability to set/toggle options)
  show deleted items and allow for undelete
  pagination (if more than 10 show a next button)
  category pages (not really pages, just a show/hide trick)
  strike*through completed/deleted items (styling)
  add more items button, that shows another input section allowing for multiple items to be added at once
  Fun stuff
  auto*complete when searching/filtering

 # Detail Todo
 * [ ] Front End
   * [√] display items
   * [√] enter new item
   * [√] select item for edit
   * [√] select item for delete
   * [√] a form!

   * [ ] UI/UX
     * [ ] Confirmation of delete/update
     * [ ] Sortable list
     * [ ] Navigation/Pagination
     * [ ] Mouse over Preview
     * [ ] Searching/Filtering
     * [ ] Animations/Transitions

  * [ ] Library Considerations
    * [ ] underscore
    * [√] jquery
    * [ ] moment.js
    * [ ] c3.js (charts.js)

 ## Next Steps

  * [ ] factor out common functionality
  * [ ] testing






