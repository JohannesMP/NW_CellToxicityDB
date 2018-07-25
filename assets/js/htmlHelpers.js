
// Hide at SM or below

let MakeSpan = function(classes, str) { return '<span class="' + classes + '">' + str + '</span>'; }

let SpanHideOnXS = function(str) { return MakeSpan("d-none d-sm-inline", str); }
let SpanHideOnSM = function(str) { return MakeSpan("d-sm-none d-md-inline", str); }
let SpanHideOnMD = function(str) { return MakeSpan("d-md-none d-lg-inline", str); }
let SpanHideOnLG = function(str) { return MakeSpan("d-lg-none d-xl-inline", str); }
let SpanHideOnXL = function(str) { return MakeSpan("d-xl-none", str); }

let SpanShowOnXS = function(str) { return MakeSpan("d-inline d-sm-none", str); }
let SpanShowOnSM = function(str) { return MakeSpan("d-none d-sm-inline d-md-none", str); }
let SpanShowOnMD = function(str) { return MakeSpan("d-none d-md-inline d-lg-none", str); }
let SpanShowOnLG = function(str) { return MakeSpan("d-none d-lg-inline d-xl-none", str); }
let SpanShowOnXL = function(str) { return MakeSpan("d-none d-xl-inline", str); }

let SpanShowAboveXS = function(str) { return MakeSpan("d-none d-sm-inline", str);}
let SpanShowAboveSM = function(str) { return MakeSpan("d-none d-md-inline", str);}
let SpanShowAboveMD = function(str) { return MakeSpan("d-none d-lg-inline", str);}
let SpanShowAboveLG = function(str) { return MakeSpan("d-none d-xl-inline", str);}

let SpanHideAboveXS = function(str) { return MakeSpan("d-inline d-sm-none", str);}
let SpanHideAboveSM = function(str) { return MakeSpan("d-inline d-md-none", str);}
let SpanHideAboveMD = function(str) { return MakeSpan("d-inline d-lg-none", str);}
let SpanHideAboveLG = function(str) { return MakeSpan("d-inline d-xl-none", str);}
