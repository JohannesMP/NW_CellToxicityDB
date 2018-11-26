// Currently global for console debugging
var dataStore;
var table;
var filteredRowCount;
var filteredRowData;

var show_mirma = localStorage.getItem('show_mirna') === "false" ? false : true;

// How long after the mirna search field received an input before we process it
var mirnaSearchInputDelay = 100;

$(document).ready(function() {

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

    UpdateVersionList( (versions) =>{
        versionPlaceholder.remove();
        if(versions !== undefined)
        {
            let versionNumber = versions[0].number;
            versionTitle.text(versionNumber);
            document.title += " | " + versionNumber;
            for(var i = 0; i < versions.length; ++i)
            {
                AddVersionEntry(versionList, template, versions[i]);
            }
        }
        loadData();
    });

    var loadData = function() {
        // Asynchronous load required data, then process it
        async.parallel(
            [
                // load seed data
                (callback) => {
                    d3.csv("data/seed_viability.csv")
                        .row( r => { return new Mer6(r); })
                        .get( callback );
                },

                // load miRNA data
                (callback) => {
                    d3.csv("data/miRNA_data.csv")
                        .row( r => { return r; } )
                        .get( callback );
                }
            ], 

            // once loaded, process data
            (err, results) => {
                if(err) {
                    console.error(err);
                    return;
                }
                console.log("loaded data");
                console.log(results);

                // set up our data storage
                dataStore = {
                    // A list of all 4096 seeds and their metadata (viability, std dev data, etc.)
                    seedArr:   results[0],
                    seedMap:   {},
                    // a list of all miRNAs and their metadata (is predominant, seed, etc.)
                    stemArr: results[1],
                    // maps 
                    stemMap: {},
                    stemAccMap: {},

                    // help searching by miRNA stem
                    stemIndex: {},
                }

                // A lookup map of seed to its data
                for(var i = 0; i < dataStore.seedArr.length; ++i)
                    dataStore.seedMap[dataStore.seedArr[i].seed] = dataStore.seedArr[i];

                // A lookup map of mi_rna to its data
                for(var i = 0; i < dataStore.stemArr.length; ++i) {
                    let item = dataStore.stemArr[i];
                    dataStore.stemMap[FilterMiRNAString(item.mi_rna)] = item;
                    dataStore.stemAccMap[item.accession] = item;
                    dataStore.seedMap[item.seed].mi_rna.push(item.mi_rna);
                }

                // Helper for inserting into the index
                var walkAndInsert = function(tree, steps, key, value, filter) {
                    let cur = tree;
                    for(let i = 0; i < steps.length; ++i)
                    {
                        let step = steps[i];
                        if(!(step in cur))
                            cur[step] = {};
                        cur = cur[step];
                    }
                    cur[key] = value;
                }

                // For each stem, add it to the index tree
                for(var i = 0; i < dataStore.stemArr.length; ++i)
                {
                    let item = dataStore.stemArr[i];
                    let parts = SanitizeStemString(item.mi_rna).split('-');
                    // remove trailing letters - we will filter those out manually at runtime
                    for(let part_i = 0; part_i < parts.length; ++part_i)
                    {
                        let digits = ExtractLeadingDigits(parts[part_i]);
                        if(digits !== "")
                            parts[part_i] = digits;
                    }

                    walkAndInsert(dataStore.stemIndex, parts, "_seed", item);
                    // and also try to index without the first prefix ("let" or "miR")
                    parts.shift();
                    walkAndInsert(dataStore.stemIndex, parts, "_seed", item);
                }

                console.log("datastore");
                console.log(dataStore);

                InitTable(dataStore);
                InitAutocomplete(dataStore);
            });


        var InitTable = function(dataset) {
            loadingEl.remove();

            table = tableEl.DataTable({
                data: dataset.seedArr,
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
                order:       [6, 'asc'],    

                columns: [
                    // Seed
                    { data: "seed", title: seedHeaders.seed, searchable: true,  
                        orderable: true,  className: "h-seed", 
                        render: function ( data, type, row, meta ) { 
                            return `<span class="seq-rna"><a href="#${DNAtoRNA(data)}">${DNAtoRNA(data)}</a></span>`;
                        } 
                    },
                    // miRNA stats
                    { data: "mi_rna" , title: seedHeaders.mi_rna, searchable: false, 
                        orderable: true, className: "h-mir d-none d-lg-table-cell", render: 
                            function( data, type, row, meta ) { return data.length }
                    },
                    // heya8
                    { data: "via_heya8", title: seedHeaders.via_heya8, searchable: false, 
                        orderable: true, className: "h-via d-none d-md-table-cell", render: renderNumColorRange },
                    { data: "std_heya8", title: seedHeaders.std_heya8, searchable: false, 
                        orderable: false, className: "h-std d-none d-xl-table-cell", render: renderNum  },

                    // h460
                    { data: "via_h460", title: seedHeaders.via_h460, searchable: false, 
                        orderable: true,  className: "h-via d-none d-md-table-cell", render: renderNumColorRange  },
                    { data: "std_h460", title: seedHeaders.std_h460, searchable: false, 
                        orderable: false, className: "h-std d-none d-xl-table-cell", render: renderNum  },

                    // Average for Humans
                    { data: "avg_human",  title: seedHeaders.avg_human,  searchable: false, 
                        orderable: true,  className: "h-avg", render: renderNumColorRange  },

                    // m565
                    { data: "via_m565", title: seedHeaders.via_m565, searchable: false, 
                        orderable: true, className: "h-via d-none d-md-table-cell", render: renderNumColorRange },
                    { data: "std_m565", title: seedHeaders.std_m565, searchable: false, 
                        orderable: false, className: "h-std d-none d-xl-table-cell", render: renderNum  },

                    // m565
                    { data: "via_3ll", title: seedHeaders.via_3ll, searchable: false, 
                        orderable: true, className: "h-via d-none d-md-table-cell", render: renderNumColorRange },
                    { data: "std_3ll", title: seedHeaders.std_3ll, searchable: false, 
                        orderable: false, className: "h-std d-none d-xl-table-cell", render: renderNum  },

                    // Average for Mouse
                    { data: "avg_mouse",  title: seedHeaders.avg_mouse,  searchable: false, 
                        orderable: true,  className: "h-avg", render: renderNumColorRange  },

                    // Average for All
                    { data: "avg_all",  title: seedHeaders.avg_all,  searchable: false, 
                        orderable: true,  className: "h-avg", render: renderNumColorRange  },
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
                    if($(evt.target).prop('checked') == show_mirma)
                        return;
                    show_mirma = !show_mirma;
                    localStorage.setItem('show_mirna', show_mirma)

                    if(show_mirma)
                        tableEl.removeClass("hide-mirma");
                    else
                        tableEl.addClass("hide-mirma");

                    $(".data-mirna-toggle").each( (id, el) => {
                        $(el).prop('checked', show_mirma).change();
                    })
                });

            // Initialize miRNA toggle state on table
            if(show_mirma)
                tableEl.removeClass("hide-mirma");
            else
                tableEl.addClass("hide-mirma");


            // Add miRNA child rows
            table.rows().every(function(row_index) {
                let row = table.row(row_index);
                let data = row.data();

                if(data.mi_rna.length == 0)
                    return;

                let str = "";
                for(let i = 0; i < data.mi_rna.length; ++i)
                {
                    let id = data.mi_rna[i];
                    let mirnaInfo = dataStore.stemMap[FilterMiRNAString(id)];
                    let is_dom = mirnaInfo.is_predominant == "1";
                    let is_drosha_processed = mirnaInfo.is_drosha_processed == "1";
                    let is_mirtron = mirnaInfo.is_mirtron == "1";
                    let arm_class = is_dom ? "mi-arm-dom" : "mi-arm-less";
                    arm_class += is_drosha_processed ? " mi-arm-drosha" : "";
                    arm_class += is_mirtron ? " mi-arm-mirtron" : "";
                    let url = `http://www.mirbase.org/cgi-bin/mature.pl?mature_acc=${mirnaInfo.accession}`;
                    str += `<a href="${url}"><div class="badge badge-light mi-arm ${arm_class}">${id}</div></a>`;
                }
                row.child('<div class="mi-rna">' + str + '</div>').show();
                // ensure correct sizing when small window and scaling up
                row.child().find("td").attr("colspan", 20);
            });

            //Search Result Highlighting
            table.on( 'draw', function () {
                var body = $( table.table().body() );
                body.unhighlight();

                if ( table.rows( { filter: 'applied' } ).data().length ) {
                    body.highlight( seedSearchEl.val() );
                } 
            } );


            // mouse-over potentially
            tableEl.find("tbody")
                .on('mouseenter', 'td', function() {
                    var index = table.cell(this).index();
                    //console.log(index);
                    // $( table.cells().nodes() ).removeClass('highlight');
                    // $( table.rows().nodes() ).removeClass('highlight');
                    // $( table.column(index.column).nodes() ).addClass('highlight');
                    // $( table.row(index.row).node() ).addClass('highlight');
                });

            // Helper function to sanitize search field and update table
            var PerformSeedSearch = function(updateHash) {
                let content = SanitizeSequence(seedSearchEl.val(), 6);
                seedSearchEl.val(content);

                if(updateHash === undefined || updateHash === true)
                    location.hash = content;

                let rna = DNAtoRNA(content);
                console.log(`Searching for: ${rna}`);
                let regExSearch = ".*" + rna + ".*";
                let result = table.column(0).search(rna, true, false);
                result.draw();
            }

            // Store filtered rows for saving
            table.on('search.dt', function() {
                filteredRowCount = table.rows( { filter : 'applied'} ).nodes().length;
                filteredRowData  = table.rows( { filter : 'applied'} ).data();
                filteredRowData.columns = dataStore.seedArr.columns;
            });
            

            // Check hash for data 
            let initialSearch = GetSequenceFromHash();
            // If no sequence in hash, attempt to load from past search state
            if(initialSearch === "")
                initialSearch = table.state().search.search;
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

                mirnaInputTimeout = setTimeout( function() { ProcessMirnaInput(val); }, mirnaSearchInputDelay);
            });

            let ProcessMirnaInput = (input) => {
                let filtered = FilterMiRNAString(input);
                let seed;

                if(filtered in dataStore.stemMap)
                    seed = dataStore.stemMap[filtered].seed;
                else if(input in dataStore.stemAccMap)
                    seed = dataStore.stemAccMap[input].seed;
                else
                    console.log("none");

                seedSearchEl.val(seed);
                PerformSeedSearch();
            }

            // Reset button
            resetButtonEl.on('click' , (e) => {
                window.localStorage.clear();

                // Handle reloading
                if(window.location.hash == "")
                    window.location = window.location.href.replace("#",'');
                else
                    window.location = window.location.href.replace(window.location.hash, '');
            });

            // Save button
            saveButtonEl.on('click', (e) => {
                let csvData = Mer6ArrayToCSV(filteredRowData);

                var filterStr = seedSearchEl.val();
                if(filterStr == "")
                    filterStr = "all";
                var csvFileName = `6mer_${filterStr}.csv`

                // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                if (window.navigator.msSaveOrOpenBlob)
                    window.navigator.msSaveBlob(csvData, csvFileName);
                // save using FileSaver.js
                else
                    saveAs(new Blob([csvData], {type: "text/csv"}), csvFileName);
            });


            // Handle user manually changing hash string
            if("onhashchange" in window) {
                window.addEventListener("hashchange", () => {
                    //console.log("Hash String Changed");

                    let newVal = GetSequenceFromHash();
                    if(newVal === seedSearchEl.val())
                      return;

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

        var InitAutocomplete = function(dataset) {
            
            var autocompleter;

            var options = {
                data: dataset.stemArr,

                getValue: function(element) {
                    return element.mi_rna.replace("hsa-", "")
                },

                template: {
                    type: "custom",
                    
                    method: function(value, item) {
                        let dom = item.is_predominant == 1 ? " mi-arm-dom" : " mi-arm-less";
                        let drosha = item.is_drosha_processed == 1 ? " mi-arm-drosha" : "";
                        let mirtron = item.is_mirtron == 1 ? " mi-arm-mirtron" : "";
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

                    onChooseEvent: function() {
                                let item = autocompleter.getSelectedItemData();
                                mirnaSearchEl.val(item.mi_rna);
                                mirnaSearchEl.trigger('input');
                            },
                },
            };

            // Search field autocomplete
            autocompleter = mirnaSearchEl.easyAutocomplete(options);
        };
    }
});
