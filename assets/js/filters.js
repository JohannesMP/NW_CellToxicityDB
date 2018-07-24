
// given a potential input seed, cleans it up
// - Can only be 6 chars long
// - All uppercase
// - U or T based on if in RNA or DNA mode
// - If str is longer, will return last `len`
//    Eg: ("AxCxTxG",3) -> "CUG" 
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
    str = "hsa-" + str.replace("hsa-", "")
    return str.replace(/-/g,"").toLowerCase();
}
