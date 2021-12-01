# S3-key

An AWS S3 utility library.

# Usage

## Install
- `yarn add s3-key`

## Polyfill
- The project requires `String.replaceAll`. You need to polyfill it if your JavaScript engine doesn't support it.

```javascript
import 'core-js/features/string/replace-all'
```

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

## Advanced functions

- AWS states that some characters should be avoided. But in fact, they still admit them.
`disallowAvoidedCharacters` is an internal flag controlled by `setDisallowAvoidedCharacters`, is `false` by default.
This flag should be disabled when we want a (better) one-to-one relationship between the input key and `encodedKey` such as in the image handler service.
```typescript
export declare const setDisallowAvoidedCharacters: (val: boolean) => void;
```
