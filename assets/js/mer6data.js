// The headers used to identify each row in the csv
const TableHeaders = {
  seed : "Seed",                 // DNA 6-Mer
  via1 : "Cell viability HeyA8 (%)",
  std1 : "STDEV (HeyA8)",
  via2 : "Cell viability M565 (%)",
  std2 : "STDEV (M565)",
  avg  : "Average viability (%)"               // calculated when needed from via1, via2
};

// Mer6 Data Default Constructor
function Mer6(obj, via1, std1, via2, std2, avg) {
  // obj is seed string
  if(typeof(obj) === "string")
    this.set(obj, via1, std1, via2, std2, avg);
  // obj is whole row object
  else if(Array.isArray("array"))
    this.set( obj[0], obj[1], obj[2], obj[3], obj[4], obj[5]);
  else
    this.set(
      obj[TableHeaders.seed],
      obj[TableHeaders.via1],
      obj[TableHeaders.std1],
      obj[TableHeaders.via2],
      obj[TableHeaders.std2],
      obj[TableHeaders.avg],
    );
}

Mer6.prototype.set = function(seed, via1, std1, via2, std2, avg) {
  this.seed = seed;
  this.via1 = +via1;
  this.std1 = +std1;
  this.via2 = +via2;
  this.std2 = +std2;
  if(avg !== undefined)
    this.avg = +avg;
  else
    this.updateAvg();
}

Mer6.prototype.updateAvg = function() {
  this.avg = (this.via1 + this.via2) / 2;
}

Mer6.prototype.toCSVRow = function() {
  return this.toArray().join(',') + "\n";
}

Mer6.prototype.toArray = function() {
  return [
    this.seed,
    this.via1,
    this.std1,
    this.via2,
    this.std2,
    this.avg
  ];
}

// takes an array with a 'columns' field
var Mer6ArrayToCSV = function(dataArr)
{
  // Set up headers
  let csv = dataArr.columns.join(",") + "," + TableHeaders.avg + "\n";

  for(var i = 0; i < dataArr.length; ++i)
    csv += dataArr[i].toCSVRow();
  
  return csv;
}
