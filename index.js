"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeS3Key = exports.encodeS3Key = exports.sanitizeS3Key = exports.setDisallowAvoidedCharacters = void 0;
const rrjx_1 = __importDefault(require("rrjx"));
/**
good name to test
' +-:*@==;!@#$%^&*() 今晩は        ee5fc9fe4cd692e33716 (1)  {}%`'"|><~[]&<>　.png.
 */
/**
aws states that some characters should be avoided. But in fact, they still admit them.
this flag should be disabled when we want a one-to-one relationship between the input key and encodedKey such as in the image handler service.
 */
let disallowAvoidedCharacters = false;
const s3AvoidCharSet = new Set([
    '{',
    ...[...(0, rrjx_1.default)(128, 255, 1, true)].map(i => String.fromCharCode(i)),
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
]);
/**
char not encoded by encodeURI
A-Z a-z 0-9 ; , / ? : @ & = + $ - _ . ! ~ * ' ( ) #
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI#description
 */
const makeS3Encodings = () => ({
    // A-Z a-z 0-9: safe
    ';': '%3B',
    ',': '%2C',
    // /: safe
    '?': '%3F',
    ':': '%3A',
    '@': '%40',
    '&': '%26',
    '=': '%3D',
    '+': '%2B',
    $: '%24',
    // -: safe
    // _: safe
    // .: safe
    // '!': '%21', safe
    ...!disallowAvoidedCharacters && { '~': '%7E' },
    // '*': '%2A', safe
    // ': safe
    // '(': '%28', safe
    // ')': '%29', safe
    ...!disallowAvoidedCharacters && { '#': '%23' }, // avoid
    // https://cryptii.com/pipes/text-octal
    /**
        requirements:
        before encode:
        - consecutive spaces are combined to one (optional)
        - spaces are converted to +
        - avoid chars are converted to +
        after encode:
        - all AWS-safe characters must not be HEX-encoded. Fortunately, encodeURI satisfies this.
        - all AWS-unsafe characters must be HEX-encoded: some are not encoded with encodeURI, and we define them in s3Encodings.
     */
    /**
     https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
     * from aws: safe characters
    0-9 a-z A-Z / ! - _ . * ' ( )

from aws: Characters that might require special handling
    & $
    ASCII character ranges 00–1F hex (0–31 decimal) and 7F (127 decimal)
    @ = ; : + (space) , ?
    NOTE (by me): S3 converts space to +

Characters to avoid
    \ {
    Non-printable ASCII characters (128–255 decimal characters)
    ^ } % ` ]
    Quotation marks
    > [ ~ < # |

XML related object key constraints
     ' as &apos;
    ” as &quot;
    & as &amp;
    < as &lt;
    > as &gt;
    \r as &#13; or &#x0D;
    \n as &#10; or &#x0A;
     */
});
let s3Encodings = makeS3Encodings();
const setDisallowAvoidedCharacters = (val) => {
    disallowAvoidedCharacters = val;
    // reset s3Encodings
    s3Encodings = makeS3Encodings();
};
exports.setDisallowAvoidedCharacters = setDisallowAvoidedCharacters;
const sanitizeS3Key = (key, { charLimit = 512, replacementCharacter = '+', } = {}) => {
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
            .map(c => s3AvoidCharSet.has(c) ? replacementCharacter : c)
            .join('')
        : key;
    return key.slice(0, charLimit);
};
exports.sanitizeS3Key = sanitizeS3Key;
// key must be sanitized with sanitizeS3Key before passing to this function
const encodeS3Key = (key) => encodeURI(key)
    .split('')
    .map(char => s3Encodings[char] || char)
    .join('');
exports.encodeS3Key = encodeS3Key;
const decodeS3Key = (encodedKey) => decodeURI(Object
    .entries(s3Encodings)
    .reduce((acc, [c, cc]) => acc.replaceAll(cc, c), encodedKey));
exports.decodeS3Key = decodeS3Key;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxnREFBd0I7QUFFeEI7OztHQUdHO0FBRUg7OztHQUdHO0FBQ0gsSUFBSSx5QkFBeUIsR0FBRyxLQUFLLENBQUE7QUFFckMsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDOUIsR0FBRztJQUNILEdBQUcsQ0FBQyxHQUFHLElBQUEsY0FBSyxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRSxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILGFBQWE7SUFDYixHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztDQUNILENBQUMsQ0FBQTtBQUVGOzs7O0dBSUc7QUFDSCxNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzlCLG9CQUFvQjtJQUNwQixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxLQUFLO0lBQ1YsVUFBVTtJQUNWLEdBQUcsRUFBRSxLQUFLO0lBQ1YsR0FBRyxFQUFFLEtBQUs7SUFDVixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxLQUFLO0lBQ1YsR0FBRyxFQUFFLEtBQUs7SUFDVixHQUFHLEVBQUUsS0FBSztJQUNWLENBQUMsRUFBRSxLQUFLO0lBQ1IsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsbUJBQW1CO0lBQ25CLEdBQUcsQ0FBQyx5QkFBeUIsSUFBSSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVB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