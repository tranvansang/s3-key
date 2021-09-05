# S3-key

An AWS S3 utility library.

# Usage

## Install
- `yarn add s3-key`

## Exported functions

- Sanitize an arbitrary string to a valid s3 key (such as converting space to plus).
```typescript
export declare const sanitizeS3Key: (key: string, { charLimit = 512, replacementCharacter = '+', }?: {}) => string;
```

- Extended version of `encodeURI` which encodes s3 key to URL string.
```typescript
export declare const encodeS3Key: (key: string) => string;
```

- Extended version of `decodeURI` which decode the value encoded by `encodeS3Key`.
```typescript
export declare const decodeS3Key: (encodedKey: string) => string;
```

- Extract and decode s3 key from a valid URL. Note: the input URL should be a valid s3 URL (`isS3Url(url, config)` should be `true`).
```typescript
export declare const urlToS3Key: (url: string, config: {
	bucketName: string;
	region: string;
}) => string;
```

- Test whether `url` has a format of an s3 object's URL.
```typescript
export declare const isS3Url: (url: string, config: {
	bucketName: string;
	region: string;
}) => boolean;
```

- Generate s3 url from a s3 key. Style option:
  - When `pathStyle` is truthy (will be deprecated): `https://s3.Region.amazonaws.com/bucket-name/key-name`. Otherwise,
  - When `dashStyle` is truthy (old regions): `https://bucket-name.s3-Region.amazonaws.com/key-name`. Otherwise,
  - (default option): `https://bucket-name.s3.Region.amazonaws.com/key-name`.
```typescript
export declare const s3KeyToUrl: (key: string, config: {
	bucketName: string;
	region: string;
}, styleConfig?: {
	dashStyle?: boolean;
	pathStyle?: boolean;
}) => string;
```

## Advanced functions

- AWS states that some characters should be avoided. But in fact, they still admit them.
`disallowAvoidedCharacters` is an internal flag controlled by `setDisallowAvoidedCharacters`, is `false` by default.
This flag should be disabled when we want a (better) one-to-one relationship between the input key and `encodedKey` such as in the image handler service.
```typescript
export declare const setDisallowAvoidedCharacters: (val: boolean) => void;
```

## QA
- Does this library support utilities with arbitrary bucket name, or arbitrary region? No
