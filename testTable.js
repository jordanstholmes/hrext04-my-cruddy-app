$(document).ready(function() {
  $('table').append(createHeaderRow());
  $('#newCommItem').click(function() {
    $('table').append(createTableRow());
  });
});

function createTableRow() {
  let cells = _.reduce(rowHeaders, function(acc, val, key) {
    return acc + `<td contenteditable="true" class="${key}"></td>`
  }, '');
  return '<tr>' + cells + '</tr>';
}


function createHeaderRow() {
  let cells = _.reduce(rowHeaders, function(acc, val, key) {
    return acc + `<th id='${key}'>${val}</th>`;
  }, '');
  return '<tr>' + cells + '</tr>';
}

var rowHeaders = {
  date: 'Date',
  salesPerson: 'Sales Person',
  product: 'Product',
  transactionType: 'Transaction Type',
  invoice: 'Invoice',
  client: 'Client',
  memo: 'Memo/Description',
  revenue: 'Revenue',
  rate: 'Rate',
  comm: 'Comm'
}





