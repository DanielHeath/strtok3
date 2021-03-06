import { AbstractTokenizer } from './AbstractTokenizer';
import { EndOfStreamError } from 'peek-readable';
import * as fs from './FsPromise';
export class FileTokenizer extends AbstractTokenizer {
    constructor(fd, fileInfo) {
        super(fileInfo);
        this.fd = fd;
    }
    /**
     * Read buffer from file
     * @param buffer
     * @param offset is the offset in the buffer to start writing at; if not provided, start at 0
     * @param length is an integer specifying the number of bytes to read, of not provided the buffer length will be used
     * @param position is an integer specifying where to begin reading from in the file. If position is null, data will be read from the current file position.
     * @returns Promise number of bytes read
     */
    async readBuffer(buffer, offset = 0, length = buffer.length, position) {
        if (position) {
            this.position = position;
        }
        if (length === 0) {
            return Promise.resolve(0);
        }
        if (!length) {
            length = buffer.length;
        }
        const res = await fs.read(this.fd, buffer, offset, length, this.position);
        if (res.bytesRead < length)
            throw new EndOfStreamError();
        this.position += res.bytesRead;
        if (res.bytesRead < length) {
            throw new EndOfStreamError();
        }
        return res.bytesRead;
    }
    /**
     * Peek buffer from file
     * @param buffer
     * @param offset is the offset in the buffer to start writing at; if not provided, start at 0
     * @param length is an integer specifying the number of bytes to read, of not provided the buffer length will be used
     * @param position is an integer specifying where to begin reading from in the file. If position is null, data will be read from the current file position.
     * @param maybeless If set, will not throw an EOF error if the less then the requested length could be read
     * @returns Promise number of bytes read
     */
    async peekBuffer(buffer, offset = 0, length = buffer.length, position = this.position, maybeless = false) {
        const res = await fs.read(this.fd, buffer, offset, length, position);
        if (!maybeless && res.bytesRead < length) {
            throw new EndOfStreamError();
        }
        return res.bytesRead;
    }
    /**
     * @param length - Number of bytes to ignore
     * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
     */
    async ignore(length) {
        const bytesLeft = this.fileInfo.size - this.position;
        if (length <= bytesLeft) {
            this.position += length;
            return length;
        }
        else {
            this.position += bytesLeft;
            return bytesLeft;
        }
    }
    async close() {
        return fs.close(this.fd);
    }
}
export async function fromFile(sourceFilePath) {
    const stat = await fs.stat(sourceFilePath);
    if (!stat.isFile) {
        throw new Error(`File not a file: ${sourceFilePath}`);
    }
    const fd = await fs.open(sourceFilePath, 'r');
    return new FileTokenizer(fd, { path: sourceFilePath, size: stat.size });
}
//# sourceMappingURL=FileTokenizer.js.map