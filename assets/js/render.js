// print a number rounded to one decimal place
function RenderNum( data, type, row, meta ) {
    return Number.parseFloat(data).toFixed(1);
}

// print a viability number colord red/green based on its value
function RenderNumColorRange( data, type, row, meta ) {
    const val = RenderNum(data);

    const rgb_red   = [255,0,0];
    const rgb_orange = [255,255,128]
    const rgb_green = [0,255,0];

    const a_low  = 0;
    const a_high = 0.5;
    const midpoint = 50;

    let t = 0;

    let low = [];
    let high = [];

    if (val < midpoint) {
        low  = rgb_red.concat(a_low);
        high = rgb_red.concat(a_high);
        t = 1 - (val / midpoint);
    }
    else if (val > midpoint) {
        low  = rgb_green.concat(a_low);
        high = rgb_green.concat(a_high);
        t = (val / midpoint) - 1;
    }

    const rgba = lerpArray(low, high, t);
    const color = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]})`

    return `<div class="num-wrap" style="background-color: ${color}">${RenderNum(data)}</div>`;
}
