import range from 'rrjx'

/**
good name to test
' +-:*@==;!@#$%^&*() 今晩は        ee5fc9fe4cd692e33716 (1)  {}%`'"|><~[]&<>　.png.
 */

/**
aws states that some characters should be avoided. But in fact, they still admit them.
this flag should be disabled when we want a one-to-one relationship between the input key and encodedKey such as in the image handler service.
 */
let disallowAvoidedCharacters = false

const s3AvoidCharSet = new Set([
	'{',
	...[...range(128, 255, 1, true)].map(i => String.fromCharCode(i)),
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
])

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
	...!disallowAvoidedCharacters && {'~': '%7E'}, // avoid
	// '*': '%2A', safe
	// ': safe
	// '(': '%28', safe
	// ')': '%29', safe
	...!disallowAvoidedCharacters && {'#': '%23'}, // avoid
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
})
let s3Encodings = makeS3Encodings()

export const setDisallowAvoidedCharacters = (val: boolean) => {
	disallowAvoidedCharacters = val
	// reset s3Encodings
	s3Encodings = makeS3Encodings()
}

export const sanitizeS3Key = (
	key: string,
	{
		charLimit = 512,
		replacementCharacter = '+',
	} = {}
) => {
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
		.replace(/^\//, '+/')
	key = disallowAvoidedCharacters
		? key
			.split('')
			.map(c => s3AvoidCharSet.has(c) ? replacementCharacter : c)
			.join('')
		: key
	return key.slice(0, charLimit)
}

// key must be sanitized with sanitizeS3Key before passing to this function
export const encodeS3Key = (key: string) => encodeURI(key)
	.split('')
	.map(char => s3Encodings[char as keyof typeof s3Encodings] || char)
	.join('')

export const decodeS3Key = (encodedKey: string) => decodeURI(Object
	.entries(s3Encodings)
	.reduce((acc, [c, cc]) => acc.replaceAll(cc, c), encodedKey))
