let SequenceMode = undefined;
const SequenceModeStoreStr = "App.Settings.SequenceMode";

const query = document.querySelector.bind(document);
const queryAll = document.querySelectorAll.bind(document);

// for console debugging
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
  let loadingEl = $('#loading-display');

  if(showModeToggle)
  {
    modeEl.bootstrapToggle('disable');
    modeEl.parent().addClass('disabled')
    modeEl.parent().find('.btn').each( (index, value) => {$(value).addClass('disabled'); } );
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
      else if(SequenceMode === "RNA" && chars[i] == 'T') 
        chars[i] = 'U';
      else if(SequenceMode === "DNA" && chars[i] == 'U') 
        chars[i] = 'T';
    }

    return chars.join('');
  }

  // small helper function for only 
  var RNAtoDNA = function (str) {
    return str.split('U').join('T');
  }
  var DNAtoRNA = function (str) {
    return str.split('T').join('U');
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

  // Builds the hash string 
  var BuildHash = function(sequence)
  {
    let mode = "";
    if(SequenceMode !== undefined)
    {
      if(SequenceMode === "RNA" && GetModeFromHash() != undefined)
        mode = "RNA";
      else if(SequenceMode === "DNA")
        mode = "DNA";
    }
    return `${mode}${mode == "" ? "" : ":"}${sequence}`; 
  }


  d3.csv("data/6Mer_Data.csv")
    .row( r => { return new Mer6(r); })
    .get( (error, dataArr) => {
      if(error) throw error;

      // A lookup map of seed to index
      let dataMap = {};
      for(var i = 0; i < dataArr.length; ++i)
        dataMap[dataArr[i].seed] = +i;

      InitTable(dataArr, dataMap)
    });


  var numRender = function( data, type, row, meta ) {
    return Math.round(data*10)/10;
  }


  var InitTable = function(dataArr, dataMap) {
    loadingEl.remove();

    table = tableEl.DataTable({
      data: dataArr,
      dom: `
  <"row t-controls"
    <"col" <"float-left" l > <"float-right" p > <"float-left" i > >
  >
  r
  t
  <"row t-controls"
    <"col" <"float-left" l > <"float-right" p > <"float-left" i > >
  >`,
      paging: true,
      search: {
        smart: false
      },
      searchDelay: 100,
      processing: true,
      stateSave: true,
      lengthMenu: [[ 10, 50, 100, 500, -1], [ 10, 50, 100, 500, "All (slow)"]],
      columns: [
        // Seed
        { data: "seed", title: TableHeaders.seed, searchable: true,  orderable: true,  className: "h-seed", render: function ( data, type, row, meta ) { 
            return `<span class="seq-dna">${RNAtoDNA(data)}</span><span class="hidden">.</span><span class="seq-rna">${DNAtoRNA(data)}</span>`
          } 
        },
        // Vitality 1
        { data: "via1", title: TableHeaders.via1, searchable: false, orderable: true,  className: "h-via", render: numRender },
        // STDEV 1
        { data: "std1", title: TableHeaders.std1, searchable: false, orderable: false, className: "h-std", render: numRender  },
        // Vitality 2
        { data: "via2", title: TableHeaders.via2, searchable: false, orderable: true,  className: "h-via", render: numRender  },
        // STDEv 2
        { data: "std2", title: TableHeaders.std2, searchable: false, orderable: false, className: "h-std", render: numRender  },
        // Average
        { data: "avg",  title: TableHeaders.avg,  searchable: false, orderable: true,  className: "h-avg", render: numRender  },
      ]
    });

    // Helper function to sanitize search field and update table
    var PerformSearch = function(updateHash) {
      let content = SanitizeSequence(searchEl.val(), 6);
      searchEl.val(content);

      if(updateHash === undefined || updateHash === true)
        location.hash = BuildHash(content);

      console.log(`Searching for: ${DNAtoRNA(content)}`);
      regExSearch = ".*" + DNAtoRNA(content) + ".*";
      table.column(0).search(regExSearch, true, false).draw();
    }

    // true  = RNA
    // false = DNA
    var SetMode = function(val, updateSearch) {
      // default for invalid inputs is RNA
      val = (!val ? "RNA" : val);
      if(SequenceMode !== undefined && SequenceMode == val)
        return;
      SequenceMode = val;

      console.log(`Mode is now: ${SequenceMode}`);
      // Update table view
      if(SequenceMode !== "RNA") {
        tableEl.addClass("mode-dna");
        tableEl.removeClass("mode-rna");
      } else {
        tableEl.addClass("mode-rna");
        tableEl.removeClass("mode-dna");
      }

      // Update toggle input
      if(showModeToggle)
        modeEl.bootstrapToggle(SequenceMode === "RNA" ? "on" : "off");
   
      // Store mode
      window.localStorage.setItem(SequenceModeStoreStr, SequenceMode);
    }

    if(showModeToggle)
    {
      modeEl.parent().removeClass('disabled')
      modeEl.parent().find('.btn').each( (index, value) => {$(value).removeClass('disabled'); } );
      modeEl.bootstrapToggle('enable');
    }

    // If mode given in hash use that
    let initialMode = GetModeFromHash();
    // If no mode in hash, try to use saved
    if(initialMode === undefined)
    {
      initialMode = window.localStorage.getItem(SequenceModeStoreStr);
    }

    SetMode(initialMode);

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
    
    if(showModeToggle)
    {
      modeEl.on('change', (e) => {
        // console.log("On Mode Switch Change");
        let newMode = modeEl.prop('checked') ? "RNA" : "DNA";
        SetMode(newMode);
        PerformSearch();
      });
    }

    resetButtonEl.on('click' , (e) => {
      window.localStorage.clear();

      // Handle reloading
      if(window.location.hash == "")
        window.location = window.location.href.replace("#",'');
      else
        window.location = window.location.href.replace(window.location.hash, '');
    });

    saveButtonEl.on('click', (e) => {
      let csvData = dataArr.columns.join(",") + "," + TableHeaders.avg + "\n";
      for(var i = 0; i < filteredRowCount; ++i)
        csvData += filteredRowData[i].toCSVRow();

      var filterStr = searchEl.val();
      if(filterStr == "")
        filterStr = "all";
      var csvFileName = `6mer_${filterStr}_${SequenceMode}.csv`

      var blob = new Blob([csvData]);
      if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
          window.navigator.msSaveBlob(csvData, csvFileName);
      else
      {
          var a = window.document.createElement("a");
          a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
          a.download = csvFileName;
          document.body.appendChild(a);
          a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
          document.body.removeChild(a);
      }
      
    });

    // Handle user manually changing hash string
    if("onhashchange" in window) {
      window.addEventListener("hashchange", () => {
        console.log("Hash String Was Change");
        SetMode(GetModeFromHash());

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
