// Currently global for console debugging
var dataStore;
var table;
var filteredRowCount;
var filteredRowData;

var show_mirma = localStorage.getItem('show_mirna') === "false" ? false : true;

// How long after the mirna search field received an input before we process it
var mirnaSearchInputDelay = 100;

$(document).ready( () => {

    // Dom Manipulation
    let headerHelp = $('#header-help');
    let howToUse = $('#how-to-use');
    headerHelp.click(() => { $(document).scrollTop(howToUse.offset().top); });

    let infoLink = $('#info-link');
    let infoSection = $('#info');
    infoLink.click(() => {$(document).scrollTop(infoSection.offset().top); });

    let versionPlaceholder = $('#version-placeholder')

    let versionTitle = $('#version-title');
    let versionList = $('#version-history');
    let templateHolder = $('#version-template');
    let template = templateHolder.find("li").clone();
    templateHolder.remove();

    let tableEl       = $('#data-table');
    let settingsEl    = $('#settings-content');
    let searchBoxEl   = $('#data-search-box');
    let seedSearchEl  = $('#data-seed-field');
    let mirnaSearchEl = $('#data-mirna-field');

    let modeBoxEl     = $('#data-mode-box');
    let modeEl        = $('#data-mode-field');
    let resetButtonEl = $('#reset-button');
    let saveButtonEl  = $('#save-button');
    let loadingEl     = $('#loading-display');
    let toggleMiEl    = $('#data-mirna-toggle');

    UpdateVersionList( (versions) => {
        versionPlaceholder.remove();
        if (versions !== undefined) {
            let versionNumber = versions[0].number;
            versionTitle.text(versionNumber);
            document.title += " | " + versionNumber;
            for (var i = 0; i < versions.length; ++i) {
                AddVersionEntry(versionList, template, versions[i]);
            }
        }
        LoadData();
    });

    let ignoreNextHashChange = false;

    function LoadData() {
        // Asynchronous load required data, then process it
        async.parallel(
            [
                // load seed data
                (callback) => {
                    d3.csv("data/seed_viability.csv")
                        .row( rowData => { return new SeedEntry(rowData); })
                        .get( callback );
                },

                // load miRNA data
                (callback) => {
                    d3.csv("data/miRNA_data.csv")
                        .row( rowData => { return new StemEntry(rowData); } )
                        .get( callback );
                }
            ], 

            // once loaded, process data
            (err, results) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("loaded data");
                console.log(results);

                // set up our data storage
                dataStore = {
                    // Data for each seed
                    seedEntries: results[0],

                    // Data for each miRNA
                    stemEntries: results[1],
                    stemEntryMiRNALookup: {},
                    stemEntryAccLookup: {},

                    // help searching by miRNA stem
                    stemIndex: {},
                }

                // data store lookup helpers
                dataStore.GetSeedEntryBySequence = (sequence) => {
                    let seedIndex = ConvertSequenceToIndex(sequence);
                    return dataStore.seedEntries[seedIndex];
                };
                dataStore.GetStemEntryByMiRNAString = (mirnaStr) => {
                    let mirna = SanitizeStemString(mirnaStr);
                    return dataStore.stemEntryMiRNALookup[mirna];
                };
                dataStore.GetStemEntryByAccession = (accession) => {
                    return dataStore.stemEntryAccLookup[accession];
                };

                // Populate lookup data for Stem Entries
                const stemCount = dataStore.stemEntries.length;
                for (var stemIndex = 0; stemIndex < stemCount; ++stemIndex) {
                    const stemEntry = dataStore.stemEntries[stemIndex];

                    // Populate Stem->Mirna lookup
                    const mirna = SanitizeStemString(stemEntry.mi_rna);
                    dataStore.stemEntryMiRNALookup[mirna] = stemEntry;

                    // Populate Stem->Accession Lookup
                    dataStore.stemEntryAccLookup[stemEntry.accession] = stemEntry;

                    // Populate seed's lookup to this mirna
                    const seedEntry = dataStore.GetSeedEntryBySequence(stemEntry.seed);
                    seedEntry.mi_rna.push(stemEntry.mi_rna);
                }

                // Helper for inserting into the index
                function WalkAndInsert(tree, steps, key, value, filter) {
                    let cur = tree;
                    for (let stepIndex = 0; stepIndex < steps.length; ++stepIndex) {
                        let step = steps[stepIndex];
                        if (!(step in cur)) {
                            cur[step] = {};
                        }
                        cur = cur[step];
                    }
                    cur[key] = value;
                }

                // For each stem, add it to the index tree
                for (var stemIndex = 0; stemIndex < stemCount; ++stemIndex) {
                    let stemEntry = dataStore.stemEntries[stemIndex];
                    let parts = SanitizeStemString(stemEntry.mi_rna).split('-');

                    // remove trailing letters - we will filter those out manually at runtime
                    for (let part_i = 0; part_i < parts.length; ++part_i) {
                        let digits = ExtractLeadingDigits(parts[part_i]);
                        if (digits !== "") {
                            parts[part_i] = digits;
                        }
                    }

                    walkAndInsert(dataStore.stemIndex, parts, "_seed", stemEntry);
                    // and also try to index without the first prefix ("let" or "miR")
                    parts.shift();
                    walkAndInsert(dataStore.stemIndex, parts, "_seed", stemEntry);
                }

                console.log("datastore");
                console.log(dataStore);

                InitTable(dataStore);
                InitAutocomplete(dataStore);
            });

        var allAvgColIndex = 16;

        // Helper to construct Table config for an abitrary data column
        function ConfigTableDataCol(key, header) {
            const config = { 
                data: seedEntry => seedEntry.rawData[key], 
                title: header, 
                searchable: false, 
                orderable: true, 
                className: "h-via d-none d-md-table-cell", 
                render: RenderNumColorRange 
            };
            return config;
        }

        // Helper to construct table config for a standard deviation column
        function ConfigTableAvgCol(key, header) {
            const config = { 
                data: seedEntry => seedEntry.rawData[key],  
                title: header,  
                searchable: false, 
                orderable: true,  
                className: "h-avg", 
                render: RenderNumColorRange  
            };
            return config;
        }

        // Helper to construct table config for a standard deviation column
        function ConfigTableStdvCol(key, header) {
            const config =
            {
                data: seedEntry => seedEntry.rawData[key], 
                title: header, 
                searchable: false, 
                orderable: false, 
                className: "h-std d-none d-xl-table-cell", 
                render: RenderNum
            };
            return config;
        }


        function InitTable(dataset) {
            loadingEl.remove();

            table = tableEl.DataTable({
                data: dataset.seedEntries,
                dom: `
    <"row t-controls"
      <"col" <"float-left" l > <"mi-rna-toggle float-left"> <"float-right" p > <"float-left" i > >
    >
    <"row t-processing" r>
    <"t-table" t>
    <"row t-controls"
      <"col" <"float-left" l > <"mi-rna-toggle float-left"> <"float-right" p > <"float-left" i > >
    >`,
                paging:      true,
                search:      { smart: false },
                searchHighlight: false,
                processing:  true,
                stateSave:   true,
                lengthMenu:  [ [ 10, 50, 100, 500, -1], 
                               [ 10, 50, 100, 500, "All (slow)"] ],
                pageLength:  10,
                order:       [allAvgColIndex, 'asc'],    

                // 'data' here maps to a given SeedEntry
                columns: [
                    // Seed
                    { data: (seedEntry) => seedEntry.seed, title: SeedTableHeaders.seed, searchable: true,  
                        orderable: true,  className: "h-seed", 
                        render: ( data, type, row, meta ) => { 
                            return `<span class="seq-rna"><a href="#${ConvertDNAToRNA(data)}">${ConvertDNAToRNA(data)}</a></span>`;
                        } 
                    },
                    // miRNA stats
                    { data: "mi_rna" , title: SeedTableHeaders.mi_rna, searchable: false, 
                        orderable: true, className: "h-mir d-none d-lg-table-cell", render: 
                            ( data, type, row, meta ) => { return data.length }
                    },

                    // human: heya8
                    ConfigTableDataCol("via_heya8", SeedTableHeaders.via_heya8),
                    ConfigTableStdvCol("std_heya8", SeedTableHeaders.std_heya8),

                    // human: h460
                    ConfigTableDataCol("via_h460", SeedTableHeaders.via_h460),
                    ConfigTableStdvCol("std_h460", SeedTableHeaders.std_h460),

                    // human: h4
                    ConfigTableDataCol("via_h4", SeedTableHeaders.via_h4),
                    ConfigTableStdvCol("std_h4", SeedTableHeaders.std_h4),

                    // Average for Humans
                    ConfigTableAvgCol("avg_human", SeedTableHeaders.avg_human),

                    // mouse: m565
                    ConfigTableDataCol("via_m565", SeedTableHeaders.via_m565),
                    ConfigTableStdvCol("std_m565", SeedTableHeaders.std_m565),

                    // mouse: 3ll
                    ConfigTableDataCol("via_3ll", SeedTableHeaders.via_3ll),
                    ConfigTableStdvCol("std_3ll", SeedTableHeaders.std_3ll),

                    // mouse: gl261
                    ConfigTableDataCol("via_gl261", SeedTableHeaders.via_gl261),
                    ConfigTableStdvCol("std_gl261", SeedTableHeaders.std_gl261),

                    // Average for Mouse
                    ConfigTableAvgCol("avg_mouse", SeedTableHeaders.avg_mouse),

                    // Average for All
                    ConfigTableAvgCol("avg_all", SeedTableHeaders.avg_all),
                ],
                fixedHeader: { header: true, footer: true }
            });

            // Set up double toggle switch
            $(".mi-rna-toggle")
                .html(`<input class="data-mirna-toggle" type="checkbox" checked data-toggle="toggle">`);

            $(".data-mirna-toggle").bootstrapToggle({
                    on:       'hide miRNAs',
                    off:      'show miRNAs',
                    offstyle: 'secondary',
                    size:     'small',
                })
                .prop('checked', show_mirma).change()
                .change((evt) => {
                    if ($(evt.target).prop('checked') == show_mirma) {
                        return;
                    }
                    show_mirma = !show_mirma;
                    localStorage.setItem('show_mirna', show_mirma)

                    if (show_mirma) {
                        tableEl.removeClass("hide-mirma");
                    } else {
                        tableEl.addClass("hide-mirma");
                    }

                    $(".data-mirna-toggle").each( (id, el) => {
                        $(el).prop('checked', show_mirma).change();
                    })
                });

            // Initialize miRNA toggle state on table
            if (show_mirma) {
                tableEl.removeClass("hide-mirma");
            } else {
                tableEl.addClass("hide-mirma");
            }


            // Add miRNA child rows
            table.rows().every( (row_index) => {
                const row = table.row(row_index);
                const seedEntry = row.data();
                const stemCount = seedEntry.mi_rna.length;

                if (stemCount == 0) {
                    return;
                }

                let str = "";
                for (let stemIndex = 0; stemIndex < stemCount; ++stemIndex) {
                    const mirna = seedEntry.mi_rna[stemIndex];
                    const stemEntry = dataStore.GetStemEntryByMiRNAString(mirna);

                    let arm_class = stemEntry.is_predominant ? "mi-arm-dom" : "mi-arm-less";
                    arm_class += stemEntry.is_drosha_processed ? " mi-arm-drosha" : "";
                    arm_class += stemEntry.is_mirtron ? " mi-arm-mirtron" : "";

                    const url = `http://www.mirbase.org/cgi-bin/mature.pl?mature_acc=${stemEntry.accession}`;
                    str += `<a href="${url}" target="_blank"><div class="badge badge-light mi-arm ${arm_class}">${mirna}</div></a>`;
                }
                row.child('<div class="mi-rna">' + str + '</div>').show();
                // ensure correct sizing when small window and scaling up
                row.child().find("td").attr("colspan", 20);
            });

            //Search Result Highlighting
            table.on( 'draw', () => {
                const body = $( table.table().body() );
                body.unhighlight();

                if ( table.rows( { filter: 'applied' } ).data().length ) {
                    body.highlight( seedSearchEl.val() );
                } 
            } );


            // mouse-over potentially
            tableEl.find("tbody")
                .on('mouseenter', 'td', () => {
                    var index = table.cell(this).index();
                    //console.log(index);
                    // $( table.cells().nodes() ).removeClass('highlight');
                    // $( table.rows().nodes() ).removeClass('highlight');
                    // $( table.column(index.column).nodes() ).addClass('highlight');
                    // $( table.row(index.row).node() ).addClass('highlight');
                });

            // Helper function to sanitize search field and update table
            function PerformSeedSearch(updateHash) {
                let content = SanitizeSequence(seedSearchEl.val(), 6);
                seedSearchEl.val(content);

                if (updateHash === undefined || updateHash === true) {
                    ignoreNextHashChange = true;
                    location.hash = content;
                }

                let rna = ConvertDNAToRNA(content);
                console.log(`Searching for: ${rna}`);
                let regExSearch = ".*" + rna + ".*";
                let result = table.column(0).search(rna, true, false);
                result.draw();
            }

            // Store filtered rows for saving
            table.on('search.dt', () => {
                filteredRowCount = table.rows( { filter : 'applied'} ).nodes().length;
                filteredRowData  = table.rows( { filter : 'applied'} ).data();
            });
            

            // Check hash for data 
            let initialSearch = GetSequenceFromHash();
            // If no sequence in hash, attempt to load from past search state
            if (initialSearch === "") {
                initialSearch = table.state().search.search;
            }
            // Update Search field
            seedSearchEl.val(initialSearch);
            PerformSeedSearch();

            seedSearchEl.on('input', (e) => {
                // console.log("On Search Input");
                PerformSeedSearch();
                mirnaSearchEl.val("");
            });

            // Require a delay after input before we process it.
            var mirnaInputTimeout;

            mirnaSearchEl.on('input', (e) => {
                clearTimeout(mirnaInputTimeout);

                let field = $(e.target);
                let input = field.val();
                let val = input.replace("hsa-", "").replace("hsa","");
                field.val(val);

                mirnaInputTimeout = setTimeout( () => { ProcessMirnaInput(val); }, mirnaSearchInputDelay);
            });

            function ProcessMirnaInput(input) {
                let filtered = SanitizeStemString(input);
                let seed;

                if (filtered in dataStore.stemEntryMiRNALookup) {
                    seed = dataStore.stemEntryMiRNALookup[filtered].seed;
                } else if (input in dataStore.stemEntryAccLookup) {
                    seed = dataStore.stemEntryAccLookup[input].seed;
                } else {
                    console.log("none");
                }

                seedSearchEl.val(seed);
                PerformSeedSearch();
            }

            // Reset button
            resetButtonEl.on('click' , (e) => {
                window.localStorage.clear();

                // Handle reloading
                if (window.location.hash == "") {
                    window.location = window.location.href.replace("#",'');
                } else {
                    window.location = window.location.href.replace(window.location.hash, '');
                }
            });

            // Save button
            saveButtonEl.on('click', (e) => {
                let csvData = FormatSeedEntryArrayCSV(filteredRowData, StandardCSVOutputDefinitions);

                let filterStr = seedSearchEl.val();
                if (filterStr == "") {
                    filterStr = "all";
                }
                let csvFileName = `6mer_${filterStr}.csv`

                if (window.navigator.msSaveOrOpenBlob) {
                    // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                    window.navigator.msSaveBlob(csvData, csvFileName);
                } else {
                    // save using FileSaver.js
                    saveAs(new Blob([csvData], {type: "text/csv"}), csvFileName);
                }
            });


            // Handle user manually changing hash string
            if ("onhashchange" in window) {
                window.addEventListener("hashchange", () => {
                    if (ignoreNextHashChange)
                    {
                        ignoreNextHashChange = false;
                        return;
                    }

                    let newVal = GetSequenceFromHash();
                    if (newVal === seedSearchEl.val()) {
                        return;
                    }

                    seedSearchEl.val(newVal);
                    PerformSeedSearch();
                });

                // Everything is done setting up - make Elements visible
                seedSearchEl.prop("disabled", false);
                mirnaSearchEl.prop("disabled", false);
                resetButtonEl.prop("disabled", false);
                saveButtonEl.prop("disabled", false);
            }
        };

        function InitAutocomplete(dataset) {
            
            var autocompleter;

            var options = {
                data: dataset.stemEntries,

                getValue: (element) => {
                    return element.mi_rna.replace("hsa-", "")
                },

                template: {
                    type: "custom",
                    
                    method: (value, item) => {
                        let dom = item.is_predominant ? " mi-arm-dom" : " mi-arm-less";
                        let drosha = item.is_drosha_processed ? " mi-arm-drosha" : "";
                        let mirtron = item.is_mirtron ? " mi-arm-mirtron" : "";
                        let classes = "mi-arm-marker mi-arm" + dom + drosha + mirtron;
                        let marker = '<div class="' + classes + '"></div>';
                        //let prefix = '<span class="hsa-prefix">hsa-</span>';
                        let prefix = '';
                        return marker + prefix + value;
                    }
                },

                adjustWidth: false,
                list: {   
                    match: {
                        enabled: true
                    },
                    maxNumberOfElements: 128,

                    onChooseEvent: () => {
                            let item = autocompleter.getSelectedItemData();
                            mirnaSearchEl.val(item.rawData.mi_rna);
                            mirnaSearchEl.trigger('input');
                        },
                },
            };

            // Search field autocomplete
            autocompleter = mirnaSearchEl.easyAutocomplete(options);
        };
    }
});
