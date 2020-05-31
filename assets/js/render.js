// print a number rounded to one decimal place
var renderNum = function( data, type, row, meta ) {
      return Number.parseFloat(data).toFixed(1);
}

// print a viability number colord red/green based on its value
var renderNumColorRange = function( data, type, row, meta ) {
    var val = renderNum(data);

    var rgb_red   = [255,0,0];
    var rgb_orange = [255,255,128]
    var rgb_green = [0,255,0];

    var a_low  = 0;
    var a_high = 0.5;

    var midpoint = 60;
    var t = 0;

    if(val < midpoint) {
        low  = rgb_red.concat(a_low);
        high = rgb_red.concat(a_high);
        t = 1 - (val / midpoint);
    }
    else if(val > midpoint) {
        low  = rgb_green.concat(a_low);
        high = rgb_green.concat(a_high);
        t = (val / midpoint) - 1;
    }

    var rgba = lerpArray(low, high, t);
    var color = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]})`

    return `<div class="num-wrap" style="background-color: ${color}">${renderNum(data)}</div>`;
}
