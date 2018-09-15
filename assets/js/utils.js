function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b, a) {
    let hex = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    if(a !== undefined)
        hex += componentToHex(a);
    return hex;
}

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

// Lerps this array with another using a weighted value [0:1]
Array.prototype.lerp = function(arr, t) {
    t = t.clamp(0,1);
    let t_n = 1-t;

    let minLen = Math.min(this.length, arr.length);

    // Both intersect
    for(let i = 0; i < minLen; ++i)
        this[i] = (t_n*this[i] + t*arr[i]);

    // Assume values of 0 for shorter array.
    for(let i = minLen; i < this.length; ++i)
        this[i] = t_n*this[i];
};

// Lerps two arrays using a weight value [0:1]
// If one is longer assumes 0 values for other
function lerpArray(a, b, t) {
    let ret = [];
    t = t.clamp(0,1);
    let t_n = 1-t;

    let minLen = Math.min(a.length, b.length);
    let maxLen = Math.max(a.length, b.length);

    // Both intersect
    for(let i = 0; i < minLen; ++i) 
        ret.push(t_n*a[i] + t*b[i]);

    // Assume values of 0 for shorter array.
    if(a.length = maxLen) {
        for(let i = minLen; i < maxLen; ++i)
            ret.push(t_n*a[i]);
    } else {
        for(let i = minLen; i < maxLen; ++i)
            ret.push(t*b[i]);
    }

    return ret;
};

// Ensure we can use String.format even if not in ES6
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}
