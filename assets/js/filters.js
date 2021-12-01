
// given a potential input seed, cleans it up
// - Can only be 6 chars long
// - All uppercase
// - U or T based on if in RNA or DNA mode
// - If str is longer, will return last `len`
//    Eg: ("AxCxTxG",3) -> "CUG" 
function SanitizeSequence(str, len) {
    if(len === undefined) {
        len = str.length;
    }

    let chars = str.toUpperCase().split('');
    let ret = [];

    for (var i = chars.length-1; i >= 0 && ret.length < 6; --i) {
        if (['A','C','T','G','U'].includes(chars[i])) {
            if (chars[i] == 'T') {
                ret.push('U');
            } else {
                ret.push(chars[i]);
            }
        }
    }

    return ret.reverse().join('');
}

function GetModeFromHash() {
    const i = location.hash.indexOf(':');

    if (i == -1) {
        return undefined;
    }

    return location.hash.substring(1,i);
}

function GetSequenceFromHash() {
    let index = location.hash.indexOf(':') + 1;
    if (index < 0) {
        index = 0;
    }
    return location.hash.substring(index);
}

// Allows us to search for miRNA strings with or without dashes.
function FilterMiRNAString(str) {
    str = "hsa-" + str.replace("hsa-", "")
    return str.replace(/-/g, "").toLowerCase();
}

function SanitizeStemString(str) {
    return str.replace("hsa-","").replace("hsa","").toLowerCase();
}

// Given a string of ######X???? where # is a digit, X is a character and ? is anything, return just the # prefix.
function ExtractLeadingDigits(str) {
    let index = 0;
    while (index < str.length && IsCharacterDigit(str[index])) {
        ++index;
    }
    return str.substr(0, index);
}

// If a character is a single numeric digit (0-9)
function IsCharacterDigit(char) {
    return char.length == 1 && '0123456789'.indexOf(char) !== -1;
}
