import { ReadStream } from 'node:fs';
import fs from 'node:fs/promises';

export default class Finder {
    public fileName: string;
    private fileHandle: fs.FileHandle | null;
    private fileStream: ReadStream | null;
    private currentCompareChunk: Buffer | null;
    private digits: number;
    private found: string;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.fileHandle = null;
        this.fileStream = null;
        this.currentCompareChunk = null;
        this.digits = 0;
        this.found = 'not found';
    }

    async findFirstPrimePalindromeOfNDigits(digits: number) {
        await this.createFileReaders(digits)
        this.defineStreamEvents()
    }

    private async createFileReaders(n: number) {
        this.digits = n;
        // const highWaterMark = n < 65536 ? 65536 : n
        const highWaterMark = 5;
        this.fileHandle = await fs.open(this.fileName, 'r');
        this.fileStream = this.fileHandle.createReadStream({ highWaterMark });
    }

    private defineStreamEvents() {
        if (!this.fileStream) return;

        this.fileStream.on('data', (chunk) => {
            if (typeof chunk === 'string') chunk = Buffer.from(chunk)

            this.fileStream?.pause()

            if (!this.currentCompareChunk)
                this.currentCompareChunk = Buffer.from(chunk);
            else {
                const size = this.currentCompareChunk.length;
                const buf = this.currentCompareChunk.subarray(size - this.digits)
                this.currentCompareChunk = Buffer.concat([buf, chunk])
            }

            this.findString(this.currentCompareChunk, '567')
            console.log(this.currentCompareChunk.toString('utf8'));

            this.fileStream?.resume()
        })

        this.fileStream.on('close', () => {
            console.log(this.found)
        })

        this.fileStream.on('end', () => {
            console.log(this.found)
            console.log('Analyzed entire file')
        })
    }

    private findString(chunk: Buffer, str: string) {
        if (chunk.toString('utf8').indexOf(str) != -1) {
            this.found = 'found string'
            this.fileStream?.close()
        }
    }

}
