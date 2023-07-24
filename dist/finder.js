"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("node:fs/promises"));
class Finder {
    fileName;
    fileHandle;
    fileStream;
    currentCompareChunk;
    digits;
    found;
    constructor(fileName) {
        this.fileName = fileName;
        this.fileHandle = null;
        this.fileStream = null;
        this.currentCompareChunk = null;
        this.digits = 0;
        this.found = 'not found';
    }
    async findFirstPrimePalindromeOfNDigits(digits) {
        await this.createFileReaders(digits);
        this.defineStreamEvents();
    }
    async createFileReaders(n) {
        this.digits = n;
        // const highWaterMark = n < 65536 ? 65536 : n
        const highWaterMark = 5;
        this.fileHandle = await promises_1.default.open(this.fileName, 'r');
        this.fileStream = this.fileHandle.createReadStream({ highWaterMark });
    }
    defineStreamEvents() {
        if (!this.fileStream)
            return;
        this.fileStream.on('data', (chunk) => {
            if (typeof chunk === 'string')
                chunk = Buffer.from(chunk);
            this.fileStream?.pause();
            if (!this.currentCompareChunk)
                this.currentCompareChunk = Buffer.from(chunk);
            else {
                const size = this.currentCompareChunk.length;
                const buf = this.currentCompareChunk.subarray(size - this.digits);
                this.currentCompareChunk = Buffer.concat([buf, chunk]);
            }
            this.findString(this.currentCompareChunk, '567');
            console.log(this.currentCompareChunk.toString('utf8'));
            this.fileStream?.resume();
        });
        this.fileStream.on('close', () => {
            console.log(this.found);
        });
        this.fileStream.on('end', () => {
            console.log(this.found);
            console.log('Analyzed entire file');
        });
    }
    findString(chunk, str) {
        if (chunk.toString('utf8').indexOf(str) != -1) {
            this.found = 'found string';
            this.fileStream?.close();
        }
    }
}
exports.default = Finder;
//# sourceMappingURL=finder.js.map