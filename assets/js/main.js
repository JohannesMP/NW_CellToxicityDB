
$(function() {

const query = document.querySelector.bind(document);

// Dom Manipulation
const gist_form     = query('#gist-form');
const gist_field    = query('#gist-field');
const reply_content = query('#reply-content');

// The headers used to identify each row in the csv
const TableHeaders = {
  seed : "Seed",                 // DNA 6-Mer
  via1 : "Cell viability HeyA8",
  std1 : "STDEV (HeyA8)",
  via2 : "Cell viability M565",
  std2 : "STDEV (M565)",
  avg  : "Average"                // calculated when needed from via1, via2
};


// Mer6 Data Constructor
function Mer6(seed, via1, std1, via2, std2) {
  this.seed = seed;
  this.via1 = +via1;
  this.std1 = +std1;
  this.via2 = +via2;
  this.std2 = +std2;
}

Mer6.prototype.getAvg = function() {
  return (this.via1 + this.via2) / 2;
}

Mer6.prototype.toCSVRow = function(){
  return [
    this.seed,
    this.via1,
    this.std1,
    this.via2,
    this.std2,
    this.getAvg(),
  ].join(',') + "\n";
}


d3.csv("data/sample.csv")
  .row( r => {
    return new Mer6(
      r[TableHeaders.seed],
      r[TableHeaders.via1],
      r[TableHeaders.std1],
      r[TableHeaders.via2],
      r[TableHeaders.std2],
    );
  })
  .get( (error, dataArr) => {
    if(error) throw error;

    // Quick lookup map of seed to index
    let dataMap = {};

    for(var i = 0; i < dataArr.length; ++i)
      dataMap[dataArr[i].seed] = +i;

    console.log(dataArr);
    console.log(dataMap);

    Mer6ArrayToCSV(dataArr);
  });


// takes an array with a 'columns' field
var Mer6ArrayToCSV = function(dataArr)
{
  // Set up headers
  let csv = dataArr.columns.join(",") + "," + TableHeaders.avg + "\n";

  for(var i = 0; i < dataArr.length; ++i)
    csv += dataArr[i].toCSVRow();
  
  return csv;
}

});
