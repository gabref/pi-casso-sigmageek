export default class Finder {
    fileName: string;
    private fileHandle;
    private fileStream;
    private currentCompareChunk;
    private digits;
    private found;
    constructor(fileName: string);
    findFirstPrimePalindromeOfNDigits(digits: number): Promise<void>;
    private createFileReaders;
    private defineStreamEvents;
    private findString;
}
//# sourceMappingURL=finder.d.ts.map