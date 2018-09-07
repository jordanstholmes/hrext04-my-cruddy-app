# MVP
- [√] store items
 - [√] create new item
 - [√] select item
 - [√] edit/update item
 - [√] delete item


 # Detail Todo
 - [ ] Front End
   - [√] display items
   - [√] enter new item
   - [√] select item for edit
   - [√] select item for delete
   - [√] a form!

   - [ ] UI/UX
     - [ ] Confirmation of delete/update
     - [ ] Sortable list
     - [ ] Navigation/Pagination
     - [ ] Mouse over Preview
     - [ ] Searching/Filtering
     - [ ] Animations/Transitions

  - [ ] Library Considerations
    - [ ] underscore
    - [√] jquery
    - [ ] moment.js
    - [ ] c3.js (charts.js)

 ## Next Steps

  - [ ] factor out common functionality
  - [ ] testing


  ## Feature list
  * denotes on my to do for the project
  2.5 days = 20 hours

  Header shows difficulty for basic functionality
Some sub bullets add additional functionality and therefore add their own difficulty (+) once basic functionality has been achieved
Other sub bullets are just notes about what the header includes

Features:
  • IMPORT OPTIONS:
    ○ *(5) 3:00 Manually input all data
      § input fields and buttons
      § *OR just input fields and ADD button
    ○ 10 Upload data from excel sheet
      § +5 Upload several contractors at once
      § +5 configure data locations in source (i.e, find transactionDate in column 2, etc.)
    ○ 8 Upload data from CSV
      § +5 upload several commission sheets
      § +5 configure data locations in source (i.e, find transactionDate in column 2, etc.)
  • DATA VALIDATION
    ○ *(2) 0:30 Truncate data for consistent formatting
      § *memo/description
      § *client name
    ○ 8 handle a variety of formats for data
      ○ 3 dates e.g., 1/12/2018 vs 01/12/2018
      ○ 4 dollar values (with $, without $, with decimals, without decimals, white spaces, commas)
      ○ 1 case insensitive
    ○ 4 handle empty variables
  • AUTO CALCULATE/POPULATE
    ○ 8 Auto-calculate and populate comm amounts
      § based off object with corresponding product rates
      § take into account rates for different clients (clients object?)
    ○ 7 Auto-calculate and populate rate
      § based off object with corresponding rates
    ○ 8 Auto-calculate paydate
      § based off transaction date
      § and product object
  • GUI
    ○ *(5) 3:00 Variable Elements
      § *Singular elements
        □ *period date
        □ *payout date
        □ *total revenue
        □ *total commission
          ® +3 make multiple "total commission" by date
        □ +3 commissions pending
      § *(9) 6:00  Commission Item (rows)
        □ *contractor
        □ *transaction date
        □ *product/service
        □ *invoice number
        □ *client name
        □ *memo/description
        □ *revenue
        □ *commission rate
        □ *commission
    ○ *(3) 1:00 Static Elements
      § *Company Name
      § *column headings (see Commission Items)
    ○ 7 Make it pretty
      § *General layout
      § *font styles
      § *font sizes
      § +3 colors
      § +8 design
      § +6 animations
  • EDIT OPTIONS
    ○ *(4) 1:30 click to edit datum in GUI
      § *(4) 1:30 updates dependencies
        □ *commission
          ® +4 by date
          ® +3 commissions pending
        □ *revenue total
        □ *total commission
    ○ *(6) 3:30 delete commission item (whole row)
      § *updates dependencies
    ○ 8 Reorder commission items
      § input field for order
      § +10?? drag and drop to reorder 
    ○ *(4) 1:30 add commission item(s)
    ○ 7 Alert if your payout date is invalid
      § weekend
      § holiday
    ○ *(4) 1:30 Clear all fields
  • EXPORT OPTIONS
    ○ 8 Export to excel sheet
      § +10?? format correctly
      § + 3 generate default save name
    ○ *(8) 4:30 Export to PDF
      § +10?? format correctly
      § +3 generate default save name
    ○ 5 Export to CSV
      § +3 generate default save name
LIBRARIES
  • *jquery
  • *underscore?
  • something for dates
  • something for number format?
  • *something for PDF generation
  • something for excel generation/importing

  ### difficulty scale 1-10. 1 meaning it's already finished 10 meaning what?!?!

  5 = 3 hours
  7 = 5 hours
  10 = full day + ??

  *(5) add due date
  *(7) time stamps (moment.js)
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
  strike-through completed/deleted items (styling)
  add more items button, that shows another input section allowing for multiple items to be added at once
  Fun stuff
  auto-complete when searching/filtering








