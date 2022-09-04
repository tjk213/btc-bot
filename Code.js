////////////////////////////////////////////////////////////////////////////////////
//               ,:                                                         ,:    //
//             ,' |                                                       ,' |    //
//            /   :                                                      /   :    //
//         --'   /       :::::::::::   :::::::::::   :::    :::       --'   /     //
//         \/ />/           :+:            :+:       :+:   :+:        \/ />/      //
//         / /_\           +:+            +:+       +:+  +:+          / /_\       //
//      __/   /           +#+            +#+       +#++:++         __/   /        //
//      )'-. /           +#+            +#+       +#+  +#+         )'-. /         //
//      ./  :\          #+#        #+# #+#       #+#   #+#         ./  :\         //
//       /.' '         ###         #####        ###    ###          /.' '         //
//     '/'                                                        '/'             //
//     +                                                          +               //
//    '                                                          '                //
////////////////////////////////////////////////////////////////////////////////////
//            Copyright © 2022 Tyler J. Kenney. All rights reserved.              //
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


//  _______  ________ ______         _______   ______  ________
// /       \/        /      \       /       \ /      \/        |
// $$$$$$$  $$$$$$$$/$$$$$$  |      $$$$$$$  /$$$$$$  $$$$$$$$/
// $$ |__$$ |  $$ | $$ |  $$/       $$ |__$$ $$ |  $$ |  $$ |
// $$    $$<   $$ | $$ |            $$    $$<$$ |  $$ |  $$ |
// $$$$$$$  |  $$ | $$ |   __       $$$$$$$  $$ |  $$ |  $$ |
// $$ |__$$ |  $$ | $$ \__/  |      $$ |__$$ $$ \__$$ |  $$ |
// $$    $$/   $$ | $$    $$/       $$    $$/$$    $$/   $$ |
// $$$$$$$/    $$/   $$$$$$/        $$$$$$$/  $$$$$$/    $$/
//

// Email distribution subject.
var subject = 'BTC Update'

// comma-separated list of recipients.
var mailingList = 'tjk213@gmail.com'

// Throw an error if \p condition is false.
function assert(condition, message = "")
{
  if (!condition) {
    throw new Error("AssertionError: " + message);
  }
}

// Return the price in USD of the given token.
function getPrice(coin)
{
  var url = "https://cryptoprices.cc/" + coin;
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  return parseFloat(response);
}

// Return a string representation of the given date, in active locale.
// If includeTime is true, the timestamp is included after a space delimiter.
// In locale=US, returns 'MM/DD/YYYY HH:MM:SS'.
function getDateString(secondsSinceEpoch = -1, includeTime = true)
{
  var dateObj = new Date();
  var date = dateObj.toLocaleDateString();
  var time = dateObj.toLocaleTimeString();
  return date + (includeTime ? (" " + time) : "");
}

// Return the index of the last value in given column.
//
// Notes:
//   - Empty cells before the data begins are skipped.
//   - Empty cells after the first non-empty cell but before the last
//     trigger an exception.
function getLastRowInColumn(ss, col)
{
  // Get all values in column
  var fullCol = col + "1:" + col;
  var vals = ss.getRange(fullCol).getValues();

  // Skip leading empty cells
  var numblanks = 0;
  while (vals[numblanks] == String()) {
    numblanks += 1;
  }

  // Filter null values
  var nonnull_vals = vals.filter(String);
  var numvals = nonnull_vals.length;

  // Check that there are no other empty cells
  for (var i=0; i < numvals; ++i)
  {
    if (vals[numblanks+i] == String()) {
      throw Error("Unexpected empty cell");
    }
  }

  return numblanks+numvals;
}

// Find the last row in <searchCol> and copy it to the next row.
//
// The copy operation is identical to highlight+click+drag in the
// spreadsheet - formulas are copied over values and relative references
// are extended. <numcols> specifies the width of the row.
function addRow(ss,searchCol="A",numCols=32)
{
  var lastrow = getLastRowInColumn(ss,searchCol);
  var nextrow = lastrow + 1;
  var range = ss.getRange("R"+lastrow+"C1:R"+lastrow+"C"+numCols);
  range.copyTo(ss.getRange("R"+nextrow+"C1"));
}

// Load template from EmailTemplate.html and evaluate over given price and
// ROI windows.
function buildHTMLSummary(price, windows)
{
  // TODO: How can we control the tab thats opened on-click?
  var URL = SpreadsheetApp.getActive().getUrl();
  var template = HtmlService.createTemplateFromFile('EmailTemplate.html');

  template.URL = URL;
  template.btcPrice = price.toLocaleString();
  template.windows = windows;
  return template.evaluate().getContent();
}

// Update BTC History spreadsheet
//
// Steps:
//   - Update price history log with current time & price of BTC
//   - Append row to each 'Rolling ROI' sheet
//   - Email results
//
function update()
{
  var ss = SpreadsheetApp.getActive();
  ss.setActiveSheet(ss.getSheetByName('Price Log'));

  // Get time & price
  var currTime = getDateString();
  var btcPrice = getPrice("BTC");

  Logger.log(currTime + ": $" + btcPrice);

  // Log time & price in history tab
  var nextRow = getLastRowInColumn(ss,"B") + 1;
  ss.getRange("R"+nextRow+"C2").setValue(currTime);
  ss.getRange("R"+nextRow+"C3").setValue(btcPrice);

  // Append row to each 'Rolling ROI' sheet
  for (var i=0; i < ss.getNumSheets(); ++i)
  {
    var sheet = ss.getSheets()[i];
    if (sheet.getName().startsWith("Rolling ROI")) {
      Logger.log("Updating sheet '" + sheet.getName() + "'...");
      addRow(sheet,"C",8);
    }
  }

  // Extract results from each 'Rolling ROI' sheet
  var windows = [];
  for (var i=0; i < ss.getNumSheets(); ++i)
  {
    var sheet = ss.getSheets()[i];

    // Skip sheet if its not a Rolling ROI sheet
    if (!sheet.getName().startsWith("Rolling ROI")) {
      continue;
    }

    var w = {};

    // Get window size from sheet name
    var nameLen = sheet.getName().length;
    w.windowSize = sheet.getName().substring(nameLen-4);

    // Get change values
    var row = getLastRowInColumn(sheet,"G");
    w.percentChange  = sheet.getRange("G"+row).getDisplayValue();
    w.multipleChange = sheet.getRange("H"+row).getDisplayValue();

    // Verify change values
    Logger.log(sheet.getName() + ": " + w.percentChange + " = " + w.multipleChange);
    assert(w.percentChange.endsWith("%"), "Invalid percentage change");
    assert(w.multipleChange.endsWith("X"),"Invalid multiple change");

    // Append to window list
    windows.push(w);
  }

  // Send summary email.
  MailApp.sendEmail({
    to: mailingList,
    subject: subject,
    name: "BTC-bot",
    htmlBody: buildHTMLSummary(btcPrice,windows)
  });
}

// Send update email with fake data.
// No spreadsheet modifications.
function testEmail()
{
  var currTime = getDateString();
  var btcPrice = getPrice("BTC");

  var windows = [
    {windowSize: "Last 90 days:", percentChange: "+4.1%", multipleChange: "1.04X"},
    {windowSize: "Last 60 days:", percentChange: "+3.1%", multipleChange: "1.03X"},
    {windowSize: "Last 30 days:", percentChange: "+2.1%", multipleChange: "1.02X"}
  ];

  MailApp.sendEmail({
    to: mailingList,
    subject: subject,
    name: "BTC-bot",
    htmlBody: buildHTMLSummary(btcPrice,windows)
  });
}

//
//   ____ _______ _____   ____   ____ _______
//  |  _ |__   __/ ____| |  _ \ / __ |__   __|
//  | |_) | | | | |      | |_) | |  | | | |
//  |  _ <  | | | |      |  _ <| |  | | | |
//  | |_) | | | | |____  | |_) | |__| | | |
//  |____/  |_|  \_____| |____/ \____/  |_|
//
