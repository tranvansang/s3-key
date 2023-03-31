export declare const setDisallowAvoidedCharacters: (val: boolean) => void;
export declare const sanitizeS3Key: (key: string, { charLimit, replacementCharacter, }?: {
    charLimit?: number;
    replacementCharacter?: string;
}) => string;
export declare const encodeS3Key: (key: string) => string;
export declare const decodeS3Key: (encodedKey: string) => string;
