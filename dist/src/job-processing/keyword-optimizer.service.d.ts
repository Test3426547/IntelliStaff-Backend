export declare class KeywordOptimizerService {
    private tokenizer;
    private tfidf;
    private model;
    constructor();
    private createModel;
    optimizeKeywords(text: string): Promise<string>;
    private getWordEmbedding;
}
