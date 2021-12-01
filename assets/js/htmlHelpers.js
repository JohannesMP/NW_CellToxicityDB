
function MakeSpan(classesReq, classesOpt, str) { 
    if (classesOpt === undefined) {
        return `<span class="${classesReq}">${str}</span>`; 
    }
    return `<span class="${classesReq} ${classesOpt}">${str}</span>`; 
}

function SpanHideOnXS(str, classes) { return MakeSpan("d-none d-sm-inline", classes, str); }
function SpanHideOnSM(str, classes) { return MakeSpan("d-sm-none d-md-inline", classes, str); }
function SpanHideOnMD(str, classes) { return MakeSpan("d-md-none d-lg-inline", classes, str); }
function SpanHideOnLG(str, classes) { return MakeSpan("d-lg-none d-xl-inline", classes, str); }
function SpanHideOnXL(str, classes) { return MakeSpan("d-xl-none", classes, str); }

function SpanShowOnXS(str, classes) { return MakeSpan("d-inline d-sm-none", classes, str); }
function SpanShowOnSM(str, classes) { return MakeSpan("d-none d-sm-inline d-md-none", classes, str); }
function SpanShowOnMD(str, classes) { return MakeSpan("d-none d-md-inline d-lg-none", classes, str); }
function SpanShowOnLG(str, classes) { return MakeSpan("d-none d-lg-inline d-xl-none", classes, str); }
function SpanShowOnXL(str, classes) { return MakeSpan("d-none d-xl-inline", classes, str); }

function SpanShowAboveXS(str, classes) { return MakeSpan("d-none d-sm-inline", classes, str); }
function SpanShowAboveSM(str, classes) { return MakeSpan("d-none d-md-inline", classes, str); }
function SpanShowAboveMD(str, classes) { return MakeSpan("d-none d-lg-inline", classes, str); }
function SpanShowAboveLG(str, classes) { return MakeSpan("d-none d-xl-inline", classes, str); }

function SpanHideAboveXS(str, classes) { return MakeSpan("d-inline d-sm-none", classes, str); }
function SpanHideAboveSM(str, classes) { return MakeSpan("d-inline d-md-none", classes, str); }
function SpanHideAboveMD(str, classes) { return MakeSpan("d-inline d-lg-none", classes, str); }
function SpanHideAboveLG(str, classes) { return MakeSpan("d-inline d-xl-none", classes, str); }
