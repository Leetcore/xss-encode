// basic format for xss

function decode() {
  if (document.xss.hex.value != '') { 
		var AsciiText = document.xss.hex.value; 
		document.xss.ascii.value = unescape(AsciiText); 
	}
} 

function encode(){ 
	if (document.xss.ascii.value != '') { 
		var AsciiText = document.xss.ascii.value; 
		document.xss.hex.value = convertToHex(AsciiText); 
		document.xss.hexhtml.value = convertToHexHTML(AsciiText); 
		var vEncoded = convertToUnicode(AsciiText); 
		document.xss.unicode.value = vEncoded; 
		document.xss.ascii.focus();
		document.xss.ascii.blur();
		document.xss.ascii.select();
		document.xss.base64.value=encodeBase64(document.xss.ascii.value);
	} 
} 

function convertToUnicode(source) { 
	result = ''; 
	for (i=0; i<source.length; i++) {
		result += '&#' + source.charCodeAt(i); 
	}
	return result;
} 

function convertToHex(num) { 
	var hex = ''; 
	for (i=0;i<num.length;i++) {
		if (num.charCodeAt(i).toString(16).toUpperCase().length < 2) {
			hex += "%0" + num.charCodeAt(i).toString(16).toUpperCase(); 
		} else {
			hex += "%" + num.charCodeAt(i).toString(16).toUpperCase(); 
		}
	}
	return hex; 
} 

function convertToHexHTML(num) { 
	var hexhtml = ''; 
	for (i=0;i<num.length;i++) {
		if (num.charCodeAt(i).toString(16).toUpperCase().length < 2) {
			hexhtml += "&#x0" + num.charCodeAt(i).toString(16).toUpperCase() + ";"; 
		} else {
			hexhtml += "&#x" + num.charCodeAt(i).toString(16).toUpperCase() + ";"; 
		}
	}
	return hexhtml; 
} 

function convertToASCII() {
	if (document.xss.unicode.value != '') {
		var uniText = document.xss.unicode.value;
		var testText = uniText.substring(2,uniText.length).split("&#")
		var resultString = ""
		for (i=0;i<testText.length;i++) {
			if  (dec2hex(testText[i]).length < 2) {
				resultString += "%0" + dec2hex(testText[i])
			} else {
				resultString += "%" + dec2hex(testText[i])
			}
			document.xss.ascii.value = unescape(resultString);
		}
	}
}

function convertHexToASCII() {
	if (document.xss.hexhtml.value != '') {
		var hexText = document.xss.hexhtml.value;
		var testText = hexText.substring(3,hexText.length).split("&#x");
		var resultString = '';
		var sub = '';
		for (i=0;i<testText.length;i++) {
			sub = testText[i].substring(testText[i].length-3,testText[i].length-1) 
			if  (sub.length < 2) {
				resultString += "%0" + sub;
			} else {
				resultString += "%" + sub;
			}
			document.xss.ascii.value = unescape(resultString);
		}
	}
}

function dec2hex(n){
	var hex = "0123456789ABCDEF";
	var mask = 0xf;
	var retstr = "";
	while(n != 0){
		retstr = hex.charAt(n&mask) + retstr;
		n>>>=4;
	}
	return retstr.length == 0 ? "0" : retstr;
}

var base64Chars = new Array(
    'A','B','C','D','E','F','G','H',
    'I','J','K','L','M','N','O','P',
    'Q','R','S','T','U','V','W','X',
    'Y','Z','a','b','c','d','e','f',
    'g','h','i','j','k','l','m','n',
    'o','p','q','r','s','t','u','v',
    'w','x','y','z','0','1','2','3',
    '4','5','6','7','8','9','+','/'
);

var reverseBase64Chars = new Array();
for (var i=0; i < base64Chars.length; i++){
    reverseBase64Chars[base64Chars[i]] = i;
}

var base64Str;
var base64Count;
function setBase64Str(str){
    base64Str = str;
    base64Count = 0;
}
function readBase64(){    
    if (!base64Str) return -1;
    if (base64Count >= base64Str.length) return -1;
    var c = base64Str.charCodeAt(base64Count) & 0xff;
    base64Count++;
    return c;
}
function encodeBase64(str){
    setBase64Str(str);
    var result = '';
    var inBuffer = new Array(3);
    var lineCount = 0;
    var done = false;
    while (!done && (inBuffer[0] = readBase64()) != -1){
        inBuffer[1] = readBase64();
        inBuffer[2] = readBase64();
        result += (base64Chars[ inBuffer[0] >> 2 ]);
        if (inBuffer[1] != -1){
            result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30) | (inBuffer[1] >> 4) ]);
            if (inBuffer[2] != -1){
                result += (base64Chars [((inBuffer[1] << 2) & 0x3c) | (inBuffer[2] >> 6) ]);
                result += (base64Chars [inBuffer[2] & 0x3F]);
            } else {
                result += (base64Chars [((inBuffer[1] << 2) & 0x3c)]);
                result += ('=');
                done = true;
            }
        } else {
            result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30)]);
            result += ('=');
            result += ('=');
            done = true;
        }
        lineCount += 4;
        if (lineCount >= 76){
            result += ('\n');
            lineCount = 0;
        }
    }
    return result;
}

function readReverseBase64(){   
    if (!base64Str) return -1;
    while (true){      
        if (base64Count >= base64Str.length) return -1;
        var nextCharacter = base64Str.charAt(base64Count);
        base64Count++;
        if (reverseBase64Chars[nextCharacter]){
            return reverseBase64Chars[nextCharacter];
        }
        if (nextCharacter == 'A') return 0;
    } 
}

function ntos(n){
    n=n.toString(16);
    if (n.length == 1) n="0"+n;
    n="%"+n;
    return unescape(n);
}

function decodeBase64(str){
    setBase64Str(str);
    var result = "";
    var inBuffer = new Array(4);
    var done = false;
    while (!done && (inBuffer[0] = readReverseBase64()) != -1
        && (inBuffer[1] = readReverseBase64()) != -1){
        inBuffer[2] = readReverseBase64();
        inBuffer[3] = readReverseBase64();
        result += ntos((((inBuffer[0] << 2) & 0xff)| inBuffer[1] >> 4));
        if (inBuffer[2] != -1){
            result +=  ntos((((inBuffer[1] << 4) & 0xff)| inBuffer[2] >> 2));
            if (inBuffer[3] != -1){
                result +=  ntos((((inBuffer[2] << 6)  & 0xff) | inBuffer[3]));
            } else {
                done = true;
            }
        } else {
            done = true;
        }
    }
    return result;
}
