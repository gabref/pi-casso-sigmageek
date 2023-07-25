import { ReadStream } from 'node:fs';
import fs from 'node:fs/promises';

export default class Finder {
    public fileName: string;
    private fileHandle: fs.FileHandle | null;
    private fileStream: ReadStream | null;
    private currentCompareChunk: Buffer | null;
    private digits: number;
    private found: string;
    private fileSize: number;
    private bytesRead: number;
    private nChunks: number;
    private kMillerRabin: number;
    private numbersChecked: number;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.fileHandle = null;
        this.fileStream = null;
        this.currentCompareChunk = null;
        this.digits = 0;
        this.found = 'not found';
        this.fileSize = 0;
        this.bytesRead = 0;
        this.nChunks = 0;
        this.kMillerRabin = 20;
        this.numbersChecked = 0;

        this.test();
    }

    async findFirstPrimePalindromeOfNDigits(digits: number) {
        console.time('Find First Prime Palindrome of ' + digits + ' digits');
        console.log();

        await this.createFileReaders(digits);
        this.defineStreamEvents();
    }

    test() {
        const n9 = '318272813';
        const n21 = '151978145606541879151';
        const pal9 = this.isPalindrome(n9);
        const pal21 = this.isPalindrome(n21);
        const prime9 = this.isPrimeMillerRabin(BigInt(n9), this.kMillerRabin);
        const prime21 = this.isPrimeMillerRabin(BigInt(n21), this.kMillerRabin);

        if (!pal9)
            this.goneWrong('pal 9')
        if (!pal21)
            this.goneWrong('pal 21')
        if (!prime9)
            this.goneWrong('prime 9')
        if (!prime21)
            this.goneWrong('prime 21')
    }

    private goneWrong(data: string) {
        console.log('test gone wrong: ' + data);
        process.exit(1);
    }

    private async createFileReaders(n: number) {
        this.digits = n;
        const highWaterMark = n < 65536 ? 65536 : n
        this.fileHandle = await fs.open(this.fileName, 'r');
        this.fileStream = this.fileHandle.createReadStream({ highWaterMark });
        this.fileSize = (await this.fileHandle.stat()).size
    }

    private defineStreamEvents() {
        if (!this.fileStream) return;

        this.fileStream.on('data', (chunk) => {
            this.bytesRead += chunk.length;
            this.nChunks++;

            if (typeof chunk === 'string') chunk = Buffer.from(chunk)

            this.fileStream?.pause()

            if (!this.currentCompareChunk)
                this.currentCompareChunk = Buffer.from(chunk);
            else {
                const size = this.currentCompareChunk.length;
                const buf = this.currentCompareChunk.subarray(size - this.digits)
                this.currentCompareChunk = Buffer.concat([buf, chunk])
            }

            this.traverseChunk(this.currentCompareChunk);

            this.printPercentage();

            this.fileStream?.resume()
        })

        this.fileStream.on('close', () => {
            if (this.fileStream?.readableEnded) return;
            console.log();
            console.log('closing');
            console.log();
            console.log(this.found)
            console.log('Analyzed ' + this.nChunks + ' chunks.')
            console.timeEnd('Find First Prime Palindrome of ' + this.digits + ' digits');
        })

        this.fileStream.on('end', () => {
            console.log();
            console.log('ending');
            console.log();
            console.log(this.found)
            console.log('Analyzed entire file: ' + this.nChunks + ' chunks.')
            console.timeEnd('Find First Prime Palindrome of ' + this.digits + ' digits');
        })
    }

    private findString(chunk: Buffer, str: string) {
        const idx = chunk.toString('utf8').indexOf(str);
        if (idx != -1) {
            this.found = 'found string at ' + idx;
            this.fileStream?.close()
        }
    }

    private traverseChunk(chunk: Buffer) {
        for (let i = 0; i <= chunk.length - this.digits; ++i) {
            const littleChunk = chunk.subarray(i, i + this.digits);

            // number starts with 0
            if (littleChunk[0] === 0x30) continue;

            const nStr = littleChunk.toString('utf8')

            if (nStr.indexOf('.') != -1) continue;

            const n = BigInt(nStr);

            this.numbersChecked++;

            if (this.isEven(n)) continue;

            if (!this.isPalindrome(nStr)) continue;

            console.log(nStr);
            if (nStr.includes('318272813')) 
                console.log('found the smallest')

            if (nStr === '151978145606541879151')
                console.log('found the bigger')

            if (!this.isPrimeMillerRabin(n, this.kMillerRabin)) continue;

            this.found = n.toString();
            this.fileStream?.close();
        }
    }

    private isEven(n: bigint): boolean {
        return (n & 1n) != 1n;
    }

    private isPalindrome(strNum: string): boolean {
        let left = 0;
        let right = strNum.length - 1;

        while (left < right) {
            if (strNum[left] !== strNum[right])
                return false;
            left++;
            right--;
        }
        return true;
    }

    /**
     * Returns false if n is composite and returns true if n is probably
     * prime. k is an input parameter that determines accuracy level.
     */
    private isPrimeMillerRabin(n: bigint, k: number): boolean {
        // corner cases
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2n === 0n || n % 3n === 0n) return false;

        // do modular exponentiation. retuns (x^y) % p
        const power = (x: bigint, y: bigint, p: bigint): bigint => {
            let res = 1n;
            x = x % p;
            while (y > 0) {
                // if y is odd, multiply x with result
                if (y & 1n)
                    res = (res * x) % p;

                // y must be even now
                y = y >> 1n;
                x = (x * x) % p;
            }
            return res;
        }

        // returns false if n is composite and return true if n 
        // is probably prime
        // d is an odd number such that d*2<sup>r</sup> = n - 1 for some r >= 1
        const witnessTest = (d: bigint, n: bigint): boolean => {

            // pick a random number in [2..n-2]
            // corner cases make sure that n > 4
            // const a = Math.floor(Math.random() * (n - 3)) + 2;
            const a = 2n + BigInt(Math.floor(Math.random() * Number(n - 2n)) % Number(n - 4n)); 

            // compute a^d % n
            let x = power(a, d, n);
                
            if (x == 1n || x == n - 1n)
                return true;

            // keep squaring x while one of the following doesn't happen
            // (i) d does not reach n - 1
            // (ii) (x^2) % n is not 1
            // (iii) (x^2) % n is not n - 1
            while (d != n - 1n) {
                x = (x * x) % n;
                d *= 2n;

                if (x == 1n)
                    return false;
                if (x == n - 1n)
                    return false;
            }
            // return composite
            return false;
        }

        // find r such that n = 2^d * r + 1 for some r >= 1
        let d = n - 1n;
        while (d % 2n === 0n)
            d /= 2n;

        // iterate given number of 'k' times
        for (let i = 0; i < k; i++) {
            if (!witnessTest(d, n)) {
                return false;
            }
        }

        return true;
    }

    private printPercentage() {
        const percentage = Math.floor((this.bytesRead / this.fileSize) * 100);
        const ron = percentage === 100 ? '\n, ' : '\r';
        process.stdout.write(`Reading File: ${percentage} % - numbers checked: ${this.numbersChecked}${ron}`);
    }
}
