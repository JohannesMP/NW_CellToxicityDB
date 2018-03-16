// The headers used to identify each row in the csv
const seedHeaders = {
  seed   : "Seed",                      // DNA 6-Mer
  via1   : "Cell viability HeyA8 (%)",
  std1   : "STDEV (HeyA8)",
  via2   : "Cell viability M565 (%)",
  std2   : "STDEV (M565)",
  avg    : "Average viability (%)",     // calculated when needed from via1, via2
  mi_rna : "miRNAs",                    // filled in later 
};



// Mer6 Data Default Constructor
function Mer6(obj, via1, std1, via2, std2, avg) {
  // obj is seed string
  if(typeof(obj) === "string")
    this.set(obj, via1, std1, via2, std2, avg);
  // obj is a row array
  else if(Array.isArray("array"))
    this.set( obj[0], obj[1], obj[2], obj[3], obj[4], obj[5]);
  // obj is row object
  else
    this.set(
      obj.seed,
      obj.via1,
      obj.std1,
      obj.via2,
      obj.std2,
      obj.avg,
    );
}

Mer6.prototype.set = function(seed, via1, std1, via2, std2, avg, mi_rna) {
  this.seed   = seed;
  this.via1   = +via1;
  this.std1   = +std1;
  this.via2   = +via2;
  this.std2   = +std2;
  this.avg    = (avg    !== undefined) ? +avg   : this.getAvg();
  this.mi_rna = (mi_rna !== undefined) ? mi_rna : [];
}

Mer6.prototype.getAvg = function() {
  return (this.via1 + this.via2) / 2;
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
    this.avg,
    this.mi_rna.join(","),
  ];
}

// takes an array with a 'columns' field
var Mer6ArrayToCSV = function(dataArr)
{
  // Set up headers
  let csv = dataArr.columns.join(",") + "," 
    + seedHeaders.avg + ", " + seedHeaders.mi_rna + "\n";

  for(var i = 0; i < dataArr.length; ++i)
    csv += dataArr[i].toCSVRow();
  
  return csv;
}


var RNAtoDNA = function (str) {
  return str.split('U').join('T');
}

var DNAtoRNA = function (str) {
  return str.split('T').join('U');
}
