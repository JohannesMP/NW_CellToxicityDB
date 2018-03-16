const query = document.querySelector.bind(document);
const queryAll = document.querySelectorAll.bind(document);

// for console debugging
var dataStore;
var table;
var filteredRowCount;
var filteredRowData;

var showModeToggle = false;

$(document).ready(function() {

  // Dom Manipulation
  let tableEl       = $('#data-table');
  let settingsEl    = $('#settings-content');
  let searchBoxEl   = $('#data-search-box');
  let searchEl      = $('#data-search-field');
  let modeBoxEl     = $('#data-mode-box');
  let modeEl        = $('#data-mode-field');
  let resetButtonEl = $('#reset-button');
  let saveButtonEl  = $('#save-button');
  let loadingEl     = $('#loading-display');

  if(showModeToggle)
  {
    modeEl.bootstrapToggle('disable');
    modeEl.parent().addClass('disabled')
    modeEl.parent().find('.btn').each( (index, value) => {
      $(value).addClass('disabled'); } );
  }

  // given a potential input seed, cleans it up
  // - Can only be 6 chars long
  // - All uppercase
  // - U or T based on if in RNA or DNA mode
  var SanitizeSequence = function(str, len)
  {
    if(len === undefined)
      len = str.length;
    var chars = str.substring(0,len).toUpperCase().split('');
    for(var i = 0; i < chars.length; ++i)
    {
      if(!['A','C','T','G','U'].includes(chars[i]))
      {
        chars.splice(i,1);
        --i;
      }
      else if(chars[i] == 'T') 
        chars[i] = 'U';
    }

    return chars.join('');
  }

  var GetModeFromHash = function() {
    var i = location.hash.indexOf(':');

    if(i == -1)
      return undefined;

    return location.hash.substring(1,i);
  }

  var GetSequenceFromHash = function() {
    var i = location.hash.indexOf(':');
    if(i == -1)
      i = 0;

    return location.hash.substring(i+1);
    return raw;
  }


  async.parallel(
    // Asynchronous loading of data
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
          .row( r => {return r;} )
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
        seedArr   : results[0],
        seedMap   : {},
        mi_rnaArr : results[1],
        mi_rnaMap : {},
      }

      // A lookup map of seed to its data
      for(var i = 0; i < dataStore.seedArr.length; ++i)
        dataStore.seedMap[dataStore.seedArr[i].seed] = dataStore.seedArr[i];

      // A lookup map of mi_rna to its data
      for(var i = 0; i < dataStore.mi_rnaArr.length; ++i) {
        let id = dataStore.mi_rnaArr[i].mi_rna;
        dataStore.mi_rnaMap[id] = dataStore.mi_rnaArr[i];
        dataStore.seedMap[dataStore.mi_rnaArr[i].seed].mi_rna.push(id);
      }

      InitTable(dataStore);
    });



  // print a number rounded to one decimal place
  var renderNum = function( data, type, row, meta ) {
    return Number.parseFloat(data).toFixed(1);
  }

  var renderNumColorRange = function( data, type, row, meta ) {
    var val = renderNum(data);

    // No color
    if(val == 50)
      return val;

    var rgb_red   = [255,0,0];
    var rgb_green = [0,255,0];

    var a_low  = 0;
    var a_high = 0.5;

    var t = 0;

    // Red color
    if(val < 50) {
      low  = rgb_red.concat(a_low);
      high = rgb_red.concat(a_high);
      t = 1 - (val / 50);
    }

    // Green color
    else if(val > 50) {
      low  = rgb_green.concat(a_low);
      high = rgb_green.concat(a_high);
      t = (val / 50) - 1;
    }

    var rgba = lerpArray(low, high, t);
   // console.log("val: " + val + ", RGB: " + rgb);
    var color = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]})`

    return `<div class="num-wrap" style="background-color: ${color}">${renderNum(data)}</div>`;
  }


  var InitTable = function(dataset) {
    loadingEl.remove();

    table = tableEl.DataTable({
      data: dataset.seedArr,
      dom: `
<"row t-controls"
  <"col" <"float-left" l > <"float-right" p > <"float-left" i > >
>
<"row t-processing" r>
<"t-table" t>
<"row t-controls"
  <"col" <"float-left" l > <"float-right" p > <"float-left" i > >
>`,
      paging: true,
      search: { smart: false },
      searchDelay: 100,
      processing: true,
      stateSave: true,
      lengthMenu: [ [ 10, 50, 100, 500, -1], 
                    [ 10, 50, 100, 500, "All (slow)"] ],
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
      fixedHeader: {
        header: true,
        footer: true
      }
    });

    table.rows().every(function(row_index) {
      let row = table.row(row_index);
      let data = row.data();

      if(data.mi_rna.length == 0)
        return;

      let str = "";
      for(let i = 0; i < data.mi_rna.length; ++i)
      {
        let id = data.mi_rna[i];
        let acc = dataStore.mi_rnaMap[id].accession;
        let url = `http://www.mirbase.org/cgi-bin/mature.pl?mature_acc=${acc}`;
        str += `<a href="${url}"><div class="badge badge-light">${id}</div></a>`;
      }
      row.child('<div class="mi-rna">' + str + '</div>').show();
    });


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
    var PerformSearch = function(updateHash) {
      let content = SanitizeSequence(searchEl.val(), 6);
      searchEl.val(content);

      if(updateHash === undefined || updateHash === true)
        location.hash = content;

      console.log(`Searching for: ${DNAtoRNA(content)}`);
      regExSearch = ".*" + DNAtoRNA(content) + ".*";
      table.column(0).search(regExSearch, true, false).draw();
    }

    // Store filtered rows for saving
    table.on('search.dt', function() {
      filteredRowCount = table.rows( { filter : 'applied'} ).nodes().length;
      filteredRowData  = table.rows( { filter : 'applied'} ).data();    
    });
    
    // Check hash for data 
    let initialSearch = GetSequenceFromHash();
    // If no sequence in hash, attempt to load from past search state
    if(initialSearch === "")
      initialSearch = table.state().search.search;
    // Update Search field
    searchEl.val(initialSearch);
    PerformSearch();

    searchEl.on('input', (e) => {
      // console.log("On Search Input");
      PerformSearch();
    });

    resetButtonEl.on('click' , (e) => {
      window.localStorage.clear();

      // Handle reloading
      if(window.location.hash == "")
        window.location = window.location.href.replace("#",'');
      else
        window.location = window.location.href.replace(window.location.hash, '');
    });

    saveButtonEl.on('click', (e) => {
      let csvData = dataArr.columns.join(",") + "," + seedHeaders.avg + "\n";
      for(var i = 0; i < filteredRowCount; ++i)
        csvData += filteredRowData[i].toCSVRow();

      var filterStr = searchEl.val();
      if(filterStr == "")
        filterStr = "all";
      var csvFileName = `6mer_${filterStr}.csv`

      if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
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
        if(newVal === searchEl.val())
          return;

        searchEl.val(newVal);
        PerformSearch();
      });

      // Everything is set up, show settings
      searchEl.prop("disabled", false);
      resetButtonEl.prop("disabled", false);
      saveButtonEl.prop("disabled", false);
    }
  }

});
