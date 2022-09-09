////////////////////////////////////////////////////////////////////////////////////
//           _______  ________ ______         _______   ______  ________          //
//          /       \/        /      \       /       \ /      \/        |         //
//          $$$$$$$  $$$$$$$$/$$$$$$  |      $$$$$$$  /$$$$$$  $$$$$$$$/          //
//          $$ |__$$ |  $$ | $$ |  $$/       $$ |__$$ $$ |  $$ |  $$ |            //
//          $$    $$<   $$ | $$ |            $$    $$<$$ |  $$ |  $$ |            //
//          $$$$$$$  |  $$ | $$ |   __       $$$$$$$  $$ |  $$ |  $$ |            //
//          $$ |__$$ |  $$ | $$ \__/  |      $$ |__$$ $$ \__$$ |  $$ |            //
//          $$    $$/   $$ | $$    $$/       $$    $$/$$    $$/   $$ |            //
//          $$$$$$$/    $$/   $$$$$$/        $$$$$$$/  $$$$$$/    $$/             //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
//            Copyright © 2022 Tyler J. Kenney. All rights reserved.              //
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

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

// Parse the last <lengthOfSuffix> characters of the string <x> as an
// integer and return it.
function parseSuffixAsInt(x,lengthOfSuffix) {
  var len = x.length;
  return parseInt(x.substring(len-lengthOfSuffix-1));
}

// Parse the first <lengthOfPrefix> characters of the string <x> as a
// float and return it.
function parsePrefixAsFloat(x,lengthOfPrefix) {
  return parseFloat(x.substring(0,lengthOfPrefix));
}

// Parse a multiple-change value (e.g., 40.33X) as a float and return it.
function parseMultipleChangeAsFloat(change) {
  assert(change.endsWith('X'),"Invalid change value");
  return parsePrefixAsFloat(change,change.length-1);
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

// Return the given string with the given suffix, if present, removed.
function trimString(x, suffix)
{
  if (x.endsWith(suffix)) {
    x = x.substring(0,x.length-suffix.length);
  }
  return x;
}

// For each Rolling-ROI sheet in the given spreadsheet,
// generate a dictionary summarizing the most recently
// completed window.
// Returns a list of these summary dictionaries.
function getMostRecentWindowEntries(ss)
{
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
    var sheetName = sheet.getName().split(" - ");
    assert(sheetName.length == 2,"Unexpected Rolling-ROI sheet name");
    w.windowSize = "Last " + sheetName[1] + ":";

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

  return windows;
}

// Return URL of given spreadsheet, without any suffixes such as '/edit'.
function getBaseURL(ss)
{
  // TODO: How can we control the tab thats opened on-click?
  var URL = ss.getUrl();
  URL = trimString(URL,"/edit");
  Logger.log("URL = " + URL);
  return URL;
}

// Return the ID of the <idx>-th chart in sheet <sheetName>.
// If <checkLast> is true, then verify that the given sheet
// does not contain any charts with index greater than <idx>.
function getChartID(ss, sheetName, idx=0, checkLast=true)
{
  var sheet = ss.getSheetByName(sheetName);
  assert(sheet != null,"Failed to retrieve sheet: " + sheetName);
  var charts = sheet.getCharts();
  assert(charts.length > idx,"Unexpected # of charts: invalid index?");
  var chartID = charts[idx].getChartId();

  if (checkLast) {
    assert(charts.length == idx+1,
           "Unexpected # of charts: Extra chart(s) beyond idx (" + idx + ")");
  }

  Logger.log("chartID = " + chartID);
  return chartID;
}

// Parse the given Rolling-ROI sheet and return the first instance of the window.
function getFirstWindow(sheet)
{
  assert(sheet != null, "Invalid sheet");
  assert(sheet.getName().startsWith("Rolling ROI"),"Not a Rolling-ROI sheet?");

  var startLabel = sheet.getRange("C4").getDisplayValue();
  var startFirst = sheet.getRange("C5").getDisplayValue();
  var endLabel   = sheet.getRange("D4").getDisplayValue();
  var endFirst   = sheet.getRange("D5").getDisplayValue();

  assert(startLabel.toLowerCase().startsWith("start"),"Failed to find first window");
  assert(  endLabel.toLowerCase().startsWith("end"),  "Failed to find first window");

  // TODO: Add prices & change values, only returning start & end dates for now.
  var firstWindow = {
    start: startFirst,
    end: endFirst
  };

  return firstWindow;
}

// Parse the given Rolling-ROI sheet and return the window size.
// Returns window size as lower-case string with format 'xx-unit'.
// For example: 180-day, 4-year.
function getWindowSize(sheet)
{
  assert(sheet != null, "Invalid sheet");
  assert(sheet.getName().startsWith("Rolling ROI"),"Not a Rolling-ROI sheet?");

  var windowSizeLabel = sheet.getRange("J4").getValue();
  var windowSizeValue = sheet.getRange("K4").getValue();
  var windowSizeUnits = sheet.getRange("L4").getValue();

  assert(windowSizeLabel.toLowerCase().startsWith("window size"),"Missing window size?");

  // The units should be plural (e.g., 'days') - chop the s off the end.
  if (windowSizeUnits.endsWith('s')) {
    windowSizeUnits = windowSizeUnits.substring(0,windowSizeUnits.length-1);
  }

  // Merge value & units into hyphenated string
  var windowSizeString = windowSizeValue + "-" + windowSizeUnits.toLowerCase();
  return windowSizeString;
}

// Send email summarizing most recent entry in each Rolling-ROI sheet.
function emailResults(ss = SpreadsheetApp.getActive(), price = getPrice("BTC"))
{
  var URL = getBaseURL(ss)
  var chartID = getChartID(ss,"Overview");
  var windows = getMostRecentWindowEntries(ss);
  var template = HtmlService.createTemplateFromFile('EmailTemplate.html');

  template.URL = URL;
  template.chartID = chartID;
  // FIXME: This doesn't display second decimal if price is an even dime.
  //        See github issue #1.
  template.btcPrice = price.toLocaleString();
  template.windows = windows;
  var body = template.evaluate().getContent();

  // Send results.
  MailApp.sendEmail({
    to: mailingList,
    subject: subject,
    name: "BTC-bot",
    htmlBody: body
  });
}

// Update BTC History spreadsheet
//
// Steps:
//   - Update price history log with current time & price of BTC
//   - Append row to each 'Rolling ROI' sheet
//
// Returns: The recorded BTC price.
//
function appendEntry(ss = SpreadsheetApp.getActive())
{
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

  return btcPrice;
}

// Update BTC history & send summary email.
function appendEntryAndEmailResults()
{
  var ss = SpreadsheetApp.getActive();
  var btcPrice = appendEntry(ss);
  emailResults(ss,btcPrice);
}

////////////////////////////////////////////////////////////////////////////////////
////////////////    ____ _______ _____   ____   ____ _______   /////////////////////
////////////////   |  _ |__   __/ ____| |  _ \ / __ |__   __|  /////////////////////
////////////////   | |_) | | | | |      | |_) | |  | | | |     /////////////////////
////////////////   |  _ <  | | | |      |  _ <| |  | | | |     /////////////////////
////////////////   | |_) | | | | |____  | |_) | |__| | | |     /////////////////////
////////////////   |____/  |_|  \_____| |____/ \____/  |_|     /////////////////////
////////////////                                               /////////////////////
////////////////////////////////////////////////////////////////////////////////////
