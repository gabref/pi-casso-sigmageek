export default class Finder {
    fileName: string;
    private fileHandle;
    private fileStream;
    private currentCompareChunk;
    private digits;
    private found;
    private fileSize;
    private bytesRead;
    private nChunks;
    private kMillerRabin;
    private numbersChecked;
    constructor(fileName: string);
    findFirstPrimePalindromeOfNDigits(digits: number): Promise<void>;
    test(): void;
    private goneWrong;
    private createFileReaders;
    private defineStreamEvents;
    private findString;
    private traverseChunk;
    private isEven;
    private isPalindrome;
    /**
     * Returns false if n is composite and returns true if n is probably
     * prime. k is an input parameter that determines accuracy level.
     */
    private isPrimeMillerRabin;
    private printPercentage;
}
//# sourceMappingURL=finder.d.ts.map