
// Hide at SM or below

let MakeSpan = function(classes, str) { return '<span class="' + (classes !== undefined ? classes : "") + '">' + str + '</span>'; }

let SpanHideOnXS = function(str, classes) { return MakeSpan("d-none d-sm-inline " + (classes !== undefined ? classes : ""), str); }
let SpanHideOnSM = function(str, classes) { return MakeSpan("d-sm-none d-md-inline " + (classes !== undefined ? classes : ""), str); }
let SpanHideOnMD = function(str, classes) { return MakeSpan("d-md-none d-lg-inline " + (classes !== undefined ? classes : ""), str); }
let SpanHideOnLG = function(str, classes) { return MakeSpan("d-lg-none d-xl-inline " + (classes !== undefined ? classes : ""), str); }
let SpanHideOnXL = function(str, classes) { return MakeSpan("d-xl-none " + (classes !== undefined ? classes : ""), str); }

let SpanShowOnXS = function(str, classes) { return MakeSpan("d-inline d-sm-none " + (classes !== undefined ? classes : ""), str); }
let SpanShowOnSM = function(str, classes) { return MakeSpan("d-none d-sm-inline d-md-none " + (classes !== undefined ? classes : ""), str); }
let SpanShowOnMD = function(str, classes) { return MakeSpan("d-none d-md-inline d-lg-none " + (classes !== undefined ? classes : ""), str); }
let SpanShowOnLG = function(str, classes) { return MakeSpan("d-none d-lg-inline d-xl-none " + (classes !== undefined ? classes : ""), str); }
let SpanShowOnXL = function(str, classes) { return MakeSpan("d-none d-xl-inline " + (classes !== undefined ? classes : ""), str); }

let SpanShowAboveXS = function(str, classes) { return MakeSpan("d-none d-sm-inline " + (classes !== undefined ? classes : ""), str);}
let SpanShowAboveSM = function(str, classes) { return MakeSpan("d-none d-md-inline " + (classes !== undefined ? classes : ""), str);}
let SpanShowAboveMD = function(str, classes) { return MakeSpan("d-none d-lg-inline " + (classes !== undefined ? classes : ""), str);}
let SpanShowAboveLG = function(str, classes) { return MakeSpan("d-none d-xl-inline " + (classes !== undefined ? classes : ""), str);}

let SpanHideAboveXS = function(str, classes) { return MakeSpan("d-inline d-sm-none " + (classes !== undefined ? classes : ""), str);}
let SpanHideAboveSM = function(str, classes) { return MakeSpan("d-inline d-md-none " + (classes !== undefined ? classes : ""), str);}
let SpanHideAboveMD = function(str, classes) { return MakeSpan("d-inline d-lg-none " + (classes !== undefined ? classes : ""), str);}
let SpanHideAboveLG = function(str, classes) { return MakeSpan("d-inline d-xl-none " + (classes !== undefined ? classes : ""), str);}
