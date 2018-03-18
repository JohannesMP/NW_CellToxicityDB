// print a number rounded to one decimal place
var renderNum = function( data, type, row, meta ) {
  return Number.parseFloat(data).toFixed(1);
}

// print a viability number colord red/green based on its value
var renderNumColorRange = function( data, type, row, meta ) {
  var val = renderNum(data);

  // No color
  if(val == 50)
    return val;

  var rgb_red   = [255,0,0];
  var rgb_green = [0,255,0];

  var a_low  = 0;
  var a_high = 0.5;

  var t = 0;

  // Red color
  if(val < 50) {
    low  = rgb_red.concat(a_low);
    high = rgb_red.concat(a_high);
    t = 1 - (val / 50);
  }

  // Green color
  else if(val > 50) {
    low  = rgb_green.concat(a_low);
    high = rgb_green.concat(a_high);
    t = (val / 50) - 1;
  }

  var rgba = lerpArray(low, high, t);
  var color = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]})`

  return `<div class="num-wrap" style="background-color: ${color}">${renderNum(data)}</div>`;
}
