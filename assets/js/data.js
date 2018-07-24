
// The headers used to identify each row in the csv
const seedHeaders = {
  seed:           "Seed",                      // DNA 6-Mer
  via_heya8:      "Viability HeyA8 (%)",
  std_heya8:      "StDev HeyA8",
  via_h460:       "Viability H460 (%)",
  std_h460:       "StDev H460",
  avg_human:      "Average human cells (%)",
  via_m565:       "Viability M565 (%)",
  std_m565:       "StDev M565",
  via_3ll:        "Viability 3LL (%)",
  std_3ll:        "StDev 3LL",
  avg_mouse:      "Average mouse cells (%)",
  avg_all:        "Average all cells (%)",
  mi_rna:         "miRNAs",                    // filled in later 
};



// Mer6 Data Default Constructor
function Mer6(  obj, 
                via_heya8, 
                std_heya8, 
                via_h460, 
                std_h460, 
                avg_human, 
                via_m565, 
                std_m565,
                via_3ll,
                std_3ll,
                avg_mouse,
                avg_all) {
  // obj is seed string
  if(typeof(obj) === "string")
    this.set(   obj,        via_heya8,  std_heya8,  via_h460,   std_h460,   avg_human, 
                via_m565,   std_m565,   via_3ll,    std_3ll,    avg_mouse,  avg_all);
  // obj is a row array
  else if(Array.isArray("array"))
    this.set(obj[0], obj[1], obj[2], obj[3], obj[4], obj[5], obj[6], obj[7], obj[8], obj[9], obj[10], obj[11]);
  // obj is row object
  else
    this.set(
      obj.seed,
      obj.via_heya8,
      obj.std_heya8,
      obj.via_h460,
      obj.std_h460,
      obj.avg_human,
      obj.via_m565,
      obj.std_m565,
      obj.via_3ll,
      obj.std_3ll,
      obj.avg_mouse,
      obj.avg_all
    );
}

Mer6.prototype.set = function(seed, via_heya8, std_heya8, via_h460, std_h460, avg_human, 
                            via_m565, std_m565, via_3ll, std_3ll, avg_mouse, avg_all, mi_rna) {
  this.seed              = seed;
  this.via_heya8         = +via_heya8;
  this.std_heya8         = +std_heya8;
  this.via_h460          = +via_h460;
  this.std_h460          = +std_h460;
  this.avg_human         = +avg_human;
  this.via_m565          = +via_m565;
  this.std_m565          = +std_m565;
  this.via_3ll           = +via_3ll;
  this.std_3ll           = +std_3ll;
  this.avg_mouse         = +avg_mouse;
  this.avg_all           = +avg_all;
  this.mi_rna            = (mi_rna !== undefined) ? mi_rna : [];
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
    this.avg_human,
    this.via_m565,
    this.std_m565,
    this.via_3ll,
    this.std_3ll,
    this.avg_mouse,
    this.avg_all,
    `"${this.mi_rna.join(",")}"`,
  ];
}

// takes an array with a 'columns' field
var Mer6ArrayToCSV = function(dataArr)
{
  // Set up headers
  let csv = dataArr.columns.map( col => seedHeaders[col] ).join(",") 
    //+ "," + seedHeaders.avg_human 
    + "," + seedHeaders.mi_rna + "\n";

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
