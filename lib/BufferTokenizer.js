import { EndOfStreamError } from 'peek-readable';
export class BufferTokenizer {
    /**
     * Construct BufferTokenizer
     * @param buffer - Buffer to tokenize
     * @param fileInfo - Pass additional file information to the tokenizer
     */
    constructor(buffer, fileInfo) {
        this.buffer = buffer;
        this.position = 0;
        this.fileInfo = fileInfo ? fileInfo : {};
        this.fileInfo.size = this.fileInfo.size ? this.fileInfo.size : buffer.length;
    }
    /**
     * Read buffer from tokenizer
     * @param buffer
     * @param offset is the offset in the buffer to start writing at; if not provided, start at 0
     * @param length is an integer specifying the number of bytes to read
     * @param position is an integer specifying where to begin reading from in the file. If position is null, data will be read from the current file position.
     * @returns {Promise<TResult|number>}
     */
    async readBuffer(buffer, offset, length, position) {
        this.position = position || this.position;
        return this.peekBuffer(buffer, offset, length, this.position).then(bytesRead => {
            this.position += bytesRead;
            return bytesRead;
        });
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer
     * @param offset is the offset in the buffer to start writing at; if not provided, start at 0
     * @param length is an integer specifying the number of bytes to read
     * @param position is an integer specifying where to begin reading from in the file. If position is null, data will be read from the current file position.
     * @param maybeLess If true, will return the bytes available if available bytes is less then length.
     * @returns {Promise<TResult|number>}
     */
    async peekBuffer(buffer, offset, length, position, maybeLess = false) {
        position = position || this.position;
        if (!length) {
            length = buffer.length;
        }
        const bytes2read = Math.min(this.buffer.length - position, length);
        if (!maybeLess && bytes2read < length) {
            throw new EndOfStreamError();
        }
        else {
            this.buffer.copy(buffer, offset, position, position + bytes2read);
            return bytes2read;
        }
    }
    async readToken(token, position) {
        this.position = position || this.position;
        try {
            const tv = this.peekToken(token, this.position);
            this.position += token.len;
            return tv;
        }
        catch (err) {
            this.position += this.buffer.length - position;
            throw err;
        }
    }
    async peekToken(token, position = this.position) {
        if (this.buffer.length - position < token.len) {
            throw new EndOfStreamError();
        }
        return token.get(this.buffer, position);
    }
    async readNumber(token) {
        return this.readToken(token);
    }
    async peekNumber(token) {
        return this.peekToken(token);
    }
    /**
     * @return actual number of bytes ignored
     */
    async ignore(length) {
        const bytesIgnored = Math.min(this.buffer.length - this.position, length);
        this.position += bytesIgnored;
        return bytesIgnored;
    }
    async close() {
        // empty
    }
}
//# sourceMappingURL=BufferTokenizer.js.map