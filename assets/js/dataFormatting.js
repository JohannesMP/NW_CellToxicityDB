// Defines how data from a Seed objet is printed, given a specific key
const SeedEntryPrintDefinition = function(key, printHandler) {
    this.key = key;
    if (printHandler === undefined) {
        printHandler = seedEntry => seedEntry.rawData[key];
    }
    this.printHandler = printHandler
}

SeedEntryPrintDefinition.prototype.print = function(seedEntry) {
    return this.printHandler(seedEntry);
}


const headerPercent = SpanShowAboveXS("(%)", "h-percent");
const headerCells = SpanShowAboveSM("cells ");

// The headers used to identify each row in the csv
//const SeedTableHeaders.= {
const SeedTableHeaders = {
    'seed':           'Seed',                      // DNA 6-Mer
    'via_heya8':      'Viability HeyA8 ' + headerPercent,
    'std_heya8':      'StDev',
    'via_h460':       'Viability H460 '  + headerPercent,
    'std_h460':       'StDev',
    'via_h4':         'Viability H4 ' + headerPercent,
    'std_h4':         'StDev',
    'avg_human':      'Avg ' + SpanHideAboveSM("viability ") + 'human ' + headerCells + headerPercent,
    'via_m565':       'Viability M565 '  + headerPercent,
    'std_m565':       'StDev',
    'via_3ll':        'Viability 3LL '   + headerPercent,
    'std_3ll':        'StDev',
    'via_gl261':      'Viability GL261 ' + headerPercent,
    'std_gl261':      'StDev',
    'avg_mouse':      'Avg ' + SpanHideAboveSM("viability ") + 'mouse ' + headerCells + headerPercent,
    'avg_all':        'Avg ' + SpanHideAboveSM("viability ") + 'all '   + headerCells + headerPercent,
    'mi_rna':         'miRNAs',                    // filled in later 
};

// When printing to CSV, what order are columns displayed in, and how are they output.
const StandardCSVOutputDefinitions =
[
    new SeedEntryPrintDefinition('seed', seedEntry => seedEntry.seed),
    new SeedEntryPrintDefinition('hsa-miRNA_count', seedEntry => seedEntry.mi_rna.length),
    new SeedEntryPrintDefinition('via_heya8'),
    new SeedEntryPrintDefinition('std_heya8'),
    new SeedEntryPrintDefinition('via_h460'),
    new SeedEntryPrintDefinition('std_h460'),
    new SeedEntryPrintDefinition('via_h4'),
    new SeedEntryPrintDefinition('std_h4'),
    new SeedEntryPrintDefinition('avg_human'),
    new SeedEntryPrintDefinition('via_m565'),
    new SeedEntryPrintDefinition('std_m565'),
    new SeedEntryPrintDefinition('via_3ll'),
    new SeedEntryPrintDefinition('std_3ll'),
    new SeedEntryPrintDefinition('via_gl261'),
    new SeedEntryPrintDefinition('std_gl261'),
    new SeedEntryPrintDefinition('avg_mouse'),
    new SeedEntryPrintDefinition('avg_all'),
    new SeedEntryPrintDefinition('mi_rna', seedEntry => `"${seedEntry.mi_rna.join(',')}"`),
]

function FormatSeedEntryCSV(seedEntry, printDefinitions) {
    return printDefinitions
        .map(def => def.print(seedEntry))
        .join(",") + "\n";
}

// takes an array with a 'columns' field
function FormatSeedEntryArrayCSV(seedEntries, printDefinitions) {
    let csv = printDefinitions.map(def => def.key).join(',') + "\n";

    const count = seedEntries.length;
    for (let index = 0; index < count; ++index) {
        let seedEntry = seedEntries[index];
        csv += FormatSeedEntryCSV(seedEntry, printDefinitions);
    }
    
    return csv;
}
