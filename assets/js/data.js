
const StemEntry = function(rawData) {
    this.mi_rna = rawData.mi_rna;
    this.seed = rawData.seed;

    this.accession = rawData.accession;
    this.is_predominant = rawData.is_predominant == "1";
    this.is_drosha_processed = rawData.is_drosha_processed == "1";
    this.is_mirtron = rawData.is_mirtron == "1";

    this.rawData = rawData;
}

const SeedEntry = function(rawData) {
    this.seed = rawData.seed;
    this.index = ConvertSequenceToIndex(this.seed);
    this.mi_rna = [];

    this.rawData = rawData;
}

function ConvertRNAToDNA(rnaSequence) {
    return rnaSequence.split('U').join('T');
}

function ConvertDNAToRNA(dnaSequence) {
    return dnaSequence.split('T').join('U');
}

// Maps a base4 digit to its corresponding RNA base
function ConvertDigitToRNA(digit) {
    switch (digit) {
        case '0': return 'A';
        case '1': return 'C';
        case '2': return 'G';
        case '3': return 'U';
    }
}

// Maps a base4 digit to its corresponding DNA base
function ConvertDigitToRNA(digit) {
    switch (digit) {
        case '0': return 'A';
        case '1': return 'C';
        case '2': return 'G';
        case '3': return 'T';
    }
}

// Maps an RNA or DNA Base to its corresponding base4 digit
function ConvertBaseToDigit(sequenceBase) {
    switch (sequenceBase) {
        case 'A': return '0';
        case 'C': return '1';
        case 'G': return '2';
        case 'T':
        case 'U': return '3';
    }
}

// Maps a given RNA/DNA sequence to its zero-based index
function ConvertSequenceToIndex(sequence) {
    const callback = ConvertBaseToDigit;
    const base4Str = sequence.map(callback);
    return parseInt(base4Str, 4);
}

// Maps a zero-based index to its corresponding RNA/DNA sequence
function ConvertIndexToSequence(index, isDNA) {
    const callback = isDNA ? GetDNAFromDigit : GetRNAFromDigit;
    let base4Str = index.toString(4);
    if (base4Str.length < 6) {
        base4Str = "0".repeat(6 - base4Str.length) + base4Str;
    }
    return base4Str.map(callback);
}
