import crypto from 'crypto';

export default function getHashString(inputString: string) {
    return crypto.createHash('md5').update(inputString).digest('hex');
}