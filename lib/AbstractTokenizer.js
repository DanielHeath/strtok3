import { EndOfStreamError } from 'peek-readable';
/**
 * Core tokenizer
 */
export class AbstractTokenizer {
    constructor(fileInfo) {
        /**
         * Tokenizer-stream position
         */
        this.position = 0;
        this.numBuffer = Buffer.alloc(10);
        this.fileInfo = fileInfo ? fileInfo : {};
    }
    /**
     * Read a token from the tokenizer-stream
     * @param token - The token to read
     * @param position - If provided, the desired position in the tokenizer-stream
     * @param maybeless - If set, will not throw an EOF error if not all of the requested data could be read
     * @returns Promise with token data
     */
    async readToken(token, position = null, maybeless) {
        const buffer = Buffer.alloc(token.len);
        const len = await this.readBuffer(buffer, 0, token.len, position);
        if (!maybeless && len < token.len)
            throw new EndOfStreamError();
        return token.get(buffer, 0);
    }
    /**
     * Peek a token from the tokenizer-stream.
     * @param token - Token to peek from the tokenizer-stream.
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @param maybeless - If set, will not throw an EOF error if the less then the requested length could be read.
     * @returns Promise with token data
     */
    async peekToken(token, position = this.position, maybeless) {
        const buffer = Buffer.alloc(token.len);
        const len = await this.peekBuffer(buffer, 0, token.len, position);
        if (!maybeless && len < token.len)
            throw new EndOfStreamError();
        return token.get(buffer, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async readNumber(token) {
        const len = await this.readBuffer(this.numBuffer, 0, token.len, null);
        if (len < token.len)
            throw new EndOfStreamError();
        return token.get(this.numBuffer, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async peekNumber(token) {
        const len = await this.peekBuffer(this.numBuffer, 0, token.len);
        if (len < token.len)
            throw new EndOfStreamError();
        return token.get(this.numBuffer, 0);
    }
    async close() {
        // empty
    }
}
//# sourceMappingURL=AbstractTokenizer.js.map