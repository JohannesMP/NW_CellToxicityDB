// Currently global for console debugging
var dataStore;
var table;
var filteredRowCount;
var filteredRowData;

var show_mirma = localStorage.getItem('show_mirna') === "false" ? false : true;

$(document).ready(function() {

  // Dom Manipulation
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

      // set up our data storage
      dataStore = {
        seedArr:   results[0],
        seedMap:   {},
        mi_rnaArr: results[1],
        mi_rnaMap: {},
        mi_accMap: {},
      }

      // A lookup map of seed to its data
      for(var i = 0; i < dataStore.seedArr.length; ++i)
        dataStore.seedMap[dataStore.seedArr[i].seed] = dataStore.seedArr[i];

      // A lookup map of mi_rna to its data
      for(var i = 0; i < dataStore.mi_rnaArr.length; ++i) {
        let item = dataStore.mi_rnaArr[i];;
        dataStore.mi_rnaMap[FilterMiRNAString(item.mi_rna)] = item;
        dataStore.mi_accMap[item.accession] = item;
        dataStore.seedMap[item.seed].mi_rna.push(item.mi_rna);
      }

      InitTable(dataStore);
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
      searchDelay: 100,
      searchHighlight: false,
      processing:  true,
      stateSave:   true,
      lengthMenu:  [ [ 10, 50, 100, 500, -1], 
                     [ 10, 50, 100, 500, "All (slow)"] ],
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
          orderable: true, className: "h-mir", render: 
            function( data, type, row, meta ) { return data.length }
        },
        // Vitality 1
        { data: "via1", title: seedHeaders.via1, searchable: false, 
          orderable: true, className: "h-via ", render: renderNumColorRange },
        // STDEV 1
        { data: "std1", title: seedHeaders.std1, searchable: false, 
          orderable: false, className: "h-std d-none d-lg-block", render: renderNum  },
        // Vitality 2
        { data: "via2", title: seedHeaders.via2, searchable: false, 
          orderable: true,  className: "h-via", render: renderNumColorRange  },
        // STDEv 2
        { data: "std2", title: seedHeaders.std2, searchable: false, 
          orderable: false, className: "h-std d-none d-lg-block", render: renderNum  },
        // Average
        { data: "avg",  title: seedHeaders.avg,  searchable: false, 
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
        let acc = dataStore.mi_rnaMap[FilterMiRNAString(id)].accession;
        let is_dom = dataStore.mi_rnaMap[FilterMiRNAString(id)].is_predominant == "1";
        let arm_class = is_dom ? "mi-arm-dom" : "mi-arm-less";
        let url = `http://www.mirbase.org/cgi-bin/mature.pl?mature_acc=${acc}`;
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

    mirnaSearchEl.on('input', (e) => {
      let field = $(e.target);
      let input = field.val();
      let filtered = FilterMiRNAString(input);
      let seed;
      console.log(filtered);

      if(filtered in dataStore.mi_rnaMap)
        seed = dataStore.mi_rnaMap[filtered].seed;
      else if(input in dataStore.mi_accMap)
        seed = dataStore.mi_accMap[input].seed;
      else
        console.log("none");

      if(seed != undefined)
      {
        seedSearchEl.val(seed);
        PerformSeedSearch();
      }
    });

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
  }

});
