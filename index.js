"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeS3Key = exports.encodeS3Key = exports.sanitizeS3Key = exports.setDisallowAvoidedCharacters = void 0;
var rrjx_1 = __importDefault(require("rrjx"));
/**
good name to test
' +-:*@==;!@#$%^&*() 今晩は        ee5fc9fe4cd692e33716 (1)  {}%`'"|><~[]&<>　.png.
 */
/**
aws states that some characters should be avoided. But in fact, they still admit them.
this flag should be disabled when we want a one-to-one relationship between the input key and encodedKey such as in the image handler service.
 */
var disallowAvoidedCharacters = false;
var s3AvoidCharSet = new Set(__spreadArray(__spreadArray([
    '{'
], __read(__spreadArray([], __read((0, rrjx_1.default)(128, 255, 1, true)), false).map(function (i) { return String.fromCharCode(i); })), false), [
    '^',
    '}',
    '%',
    '`',
    ']',
    // '\'', safe
    '"',
    '“',
    '‘',
    '”',
    '’',
    '>',
    '[',
    '~',
    '<',
    '#',
    '|',
], false));
/**
char not encoded by encodeURI
A-Z a-z 0-9 ; , / ? : @ & = + $ - _ . ! ~ * ' ( ) #
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI#description
 */
var makeS3Encodings = function () { return (__assign(__assign({ 
    // A-Z a-z 0-9: safe
    ';': '%3B', ',': '%2C', 
    // /: safe
    '?': '%3F', ':': '%3A', '@': '%40', '&': '%26', '=': '%3D', '+': '%2B', $: '%24' }, !disallowAvoidedCharacters && { '~': '%7E' }), !disallowAvoidedCharacters && { '#': '%23' })); };
var s3Encodings = makeS3Encodings();
var setDisallowAvoidedCharacters = function (val) {
    disallowAvoidedCharacters = val;
    // reset s3Encodings
    s3Encodings = makeS3Encodings();
};
exports.setDisallowAvoidedCharacters = setDisallowAvoidedCharacters;
var sanitizeS3Key = function (key, _a) {
    /**
        some forbidden patterns
        await flipPromise(uploadWithKey('public/*.png'))
        await flipPromise(uploadWithKey('../public/ab.png'))
        await flipPromise(uploadWithKey('\\../public/ab.png'))
        await flipPromise(uploadWithKey('/../public/ab.png'))

        somehow, s3 does not allow * in key name, even though * is a valid char
        https://stackoverflow.com/a/67037092/1398479
        https://stackoverflow.com/questions/63750619/aws-amplify-storage-put-does-not-like-asterisk
     */
    var _b = _a === void 0 ? {} : _a, _c = _b.charLimit, charLimit = _c === void 0 ? 512 : _c, _d = _b.replacementCharacter, replacementCharacter = _d === void 0 ? '+' : _d;
    // aws allows multiple/single spaces even if they lead the filename
    // however, because it confuses our encoder, we convert them to replacementChar beforehand
    key = key.replaceAll(' ', replacementCharacter)
        // previously, this was a bug
        // https://github.com/aws/aws-sdk-js-v3/issues/2596
        // .replaceAll('*', replacementChar)
        .replace(/^\.\.\//, '+../')
        .replace(/^\.\.$/, '+..')
        .replace(/^\\/, '+\\')
        .replace(/^\//, '+/');
    key = disallowAvoidedCharacters
        ? key
            .split('')
            .map(function (c) { return s3AvoidCharSet.has(c) ? replacementCharacter : c; })
            .join('')
        : key;
    return key.slice(0, charLimit);
};
exports.sanitizeS3Key = sanitizeS3Key;
// key must be sanitized with sanitizeS3Key before passing to this function
var encodeS3Key = function (key) { return encodeURI(key)
    .split('')
    .map(function (char) { return s3Encodings[char] || char; })
    .join(''); };
exports.encodeS3Key = encodeS3Key;
var decodeS3Key = function (encodedKey) { return decodeURI(Object
    .entries(s3Encodings)
    .reduce(function (acc, _a) {
    var _b = __read(_a, 2), c = _b[0], cc = _b[1];
    return acc.replaceAll(cc, c);
}, encodedKey)); };
exports.decodeS3Key = decodeS3Key;
//# sourceMappingURL=index.js.map