const query = document.querySelector.bind(document);
const queryAll = document.querySelectorAll.bind(document);

// for console debugging
var dataStore;
var table;
var filteredRowCount;
var filteredRowData;

var show_mirma = true;

var showModeToggle = false;

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

    chars = str.toUpperCase().split('');
    ret = [];
    
    for(var i = chars.length-1; i >= 0 && ret.length < 6; --i)
    {
      if(['A','C','T','G','U'].includes(chars[i]))
      {
        if(chars[i] == 'T') 
          ret.push('U');
        else
          ret.push(chars[i]);
      }
    }

    return ret.reverse().join('');
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

  // Allows us to search for miRNA strings with or without dashes.
  var FilterMiRNAString = function(str) {
    return str.replace("-","").toLowerCase();
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
        mi_accMap : {},
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
  <"col" <"float-left" l > <"mi-rna-toggle float-left"> <"float-right" p > <"float-left" i > >
>
<"row t-processing" r>
<"t-table" t>
<"row t-controls"
  <"col" <"float-left" l > <"mi-rna-toggle float-left"> <"float-right" p > <"float-left" i > >
>`,
      paging: true,
      search: { smart: false },
      searchDelay: 100,
      processing: true,
      stateSave: true,
      lengthMenu: [ [ 10, 50, 100, 500, -1], 
                    [ 10, 50, 100, 500, "All (slow)"] ],
      order: [6, 'asc'],    

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
        let acc = dataStore.mi_rnaMap[FilterMiRNAString(id)].accession;
        let url = `http://www.mirbase.org/cgi-bin/mature.pl?mature_acc=${acc}`;
        str += `<a href="${url}"><div class="badge badge-light">${id}</div></a>`;
      }
      row.child('<div class="mi-rna">' + str + '</div>').show();
      // ensure correct sizing when small window and scaling up
      row.child().find("td").attr("colspan", 20);
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

    // Set up toggles for showing/hiding miRNA

    if(show_mirma)
      tableEl.removeClass("hide-mirma");
    else
      tableEl.addClass("hide-mirma");

    $(".mi-rna-toggle").html(`<input class="data-mirna-toggle" type="checkbox" checked data-toggle="toggle">`);
    $(".data-mirna-toggle").bootstrapToggle({
        on: 'hide miRNAs',
        off: 'show miRNAs',
        offstyle: 'secondary',
        size: 'small',
      })
      .prop('checked', show_mirma).change()
      .change((evt) => {
        if($(evt.target).prop('checked') == show_mirma)
          return;
        show_mirma = !show_mirma;

        if(show_mirma)
          tableEl.removeClass("hide-mirma");
        else
          tableEl.addClass("hide-mirma");

        $(".data-mirna-toggle").each( (id, el) => {
          $(el).prop('checked', show_mirma).change();
        })
      });

    // Helper function to sanitize search field and update table
    var PerformSeedSearch = function(updateHash) {
      let content = SanitizeSequence(seedSearchEl.val(), 6);
      seedSearchEl.val(content);

      if(updateHash === undefined || updateHash === true)
        location.hash = content;

      console.log(`Searching for: ${DNAtoRNA(content)}`);
      regExSearch = ".*" + DNAtoRNA(content) + ".*";
      var result = table.column(0).search(regExSearch, true, false);
      result.draw();
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
    seedSearchEl.val(initialSearch);
    PerformSeedSearch();

    seedSearchEl.on('input', (e) => {
      // console.log("On Search Input");
      PerformSeedSearch();
      mirnaSearchEl.val("");
    });

    mirnaSearchEl.on('input', (e) => {
      let input = mirnaSearchEl.val();
      let filtered = FilterMiRNAString(input);
      let seed;

      if(filtered in dataStore.mi_rnaMap)
        seed = dataStore.mi_rnaMap[filtered].seed;
      else if(input in dataStore.mi_accMap)
        seed = dataStore.mi_accMap[input].seed;

      if(seed != undefined)
      {
        seedSearchEl.val(seed);
        PerformSeedSearch();
      }
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
      // let csvData = dataArr.columns.join(",") + "," + seedHeaders.avg + "\n";
      // for(var i = 0; i < filteredRowCount; ++i)
      //   csvData += filteredRowData[i].toCSVRow();
      let csvData = Mer6ArrayToCSV(dataStore.seedArr);

      var filterStr = seedSearchEl.val();
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
        if(newVal === seedSearchEl.val())
          return;

        seedSearchEl.val(newVal);
        PerformSeedSearch();
      });

      // Everything is set up, show settings
      seedSearchEl.prop("disabled", false);
      mirnaSearchEl.prop("disabled", false);
      resetButtonEl.prop("disabled", false);
      saveButtonEl.prop("disabled", false);

    }
  }

});
