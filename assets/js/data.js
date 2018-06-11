
// The headers used to identify each row in the csv
const seedHeaders = {
  seed:           "Seed",                      // DNA 6-Mer
  via_heya8:      "Viability HeyA8 (%)",
  std_heya8:      "STDEV (HeyA8)",
  via_h460:       "Viability H460 (%)",
  std_h460:       "STDEV (H460)",
  avg_heya8_h460: "Average human cells (%)",     // calculated when needed from via_heya8, via_m565
  via_m565:       "Viability M565 (%)",
  std_m565:       "STDEV (M565)",
  mi_rna:         "miRNAs",                    // filled in later 
};



// Mer6 Data Default Constructor
function Mer6(obj, via_heya8, std_heya8, via_h460, std_h460, avg_heya8_h460, via_m565, std_m565) {
  // obj is seed string
  if(typeof(obj) === "string")
    this.set(obj, via_heya8, std_heya8, via_h460, std_h460, avg_heya8_h460, via_m565, std_m565);
  // obj is a row array
  else if(Array.isArray("array"))
    this.set(obj[0], obj[1], obj[2], obj[3], obj[4], obj[5], obj[6], obj[7]);
  // obj is row object
  else
    this.set(
      obj.seed,
      obj.via_heya8,
      obj.std_heya8,
      obj.via_h460,
      obj.std_h460,
      obj.avg_heya8_h460,
      obj.via_m565,
      obj.std_m565
    );
}

Mer6.prototype.set = function(seed, via_heya8, std_heya8, via_h460, std_h460, avg_heya8_h460, via_m565, std_m565, mi_rna) {
  this.seed              = seed;
  this.via_heya8         = +via_heya8;
  this.std_heya8         = +std_heya8;
  this.via_h460          = +via_h460;
  this.std_h460          = +std_h460;
  this.avg_heya8_h460    = (avg_heya8_h460 !== undefined) ? +avg_heya8_h460  : this.getavg_heya8_h460();
  this.via_m565          = +via_m565;
  this.std_m565          = +std_m565;
  this.mi_rna            = (mi_rna !== undefined) ? mi_rna : [];
}

Mer6.prototype.getavg_heya8_h460 = function() {
  return (this.via_heya8 + this.via_h460) / 2;
}

Mer6.prototype.updateavg_heya8_h460 = function() {
  this.avg_heya8_h460 = getavg_heya8_h460();
}

Mer6.prototype.toCSVRow = function() {
  return this.toArray().join(',') + "\n";
}

Mer6.prototype.toArray = function() {
  return [
    this.seed,
    this.via_heya8,
    this.std_heya8,
    this.via_h460,
    this.std_h460,
    this.avg_heya8_h460,
    this.via_m565,
    this.std_m565,
    `"${this.mi_rna.join(",")}"`,
  ];
}

// takes an array with a 'columns' field
var Mer6ArrayToCSV = function(dataArr)
{
  // Set up headers
  let csv = dataArr.columns.map( col => seedHeaders[col] ).join(",") + "," 
    + seedHeaders.avg_heya8_h460 + ", " + seedHeaders.mi_rna + "\n";

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
