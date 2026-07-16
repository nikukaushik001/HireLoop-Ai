const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 
  'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 
  'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 
  'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 
  'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 
  'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 
  'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 
  'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 
  'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 
  'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 
  'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 
  'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
]);

export interface BM25Document {
  id: string;
  text: string;
}

export class BM25 {
  private k1: number;
  private b: number;
  private N: number = 0;
  private avgdl: number = 0;
  private docLengths: Record<string, number> = {};
  private docTermFreqs: Record<string, Record<string, number>> = {};
  private docFreqs: Record<string, number> = {};

  constructor(k1 = 1.2, b = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  /**
   * Tokenizes and cleans a text string.
   */
  private tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove punctuation
      .split(/[\s_]+/) // split by space or underscore
      .filter(token => token.length > 1 && !STOP_WORDS.has(token));
  }

  /**
   * Trains/indexes a collection of documents.
   */
  fit(documents: BM25Document[]) {
    this.N = documents.length;
    this.docLengths = {};
    this.docTermFreqs = {};
    this.docFreqs = {};

    let totalLength = 0;

    for (const doc of documents) {
      const tokens = this.tokenize(doc.text);
      const length = tokens.length;
      this.docLengths[doc.id] = length;
      totalLength += length;

      const termFreqs: Record<string, number> = {};
      const uniqueTerms = new Set<string>();

      for (const token of tokens) {
        termFreqs[token] = (termFreqs[token] || 0) + 1;
        uniqueTerms.add(token);
      }

      this.docTermFreqs[doc.id] = termFreqs;

      for (const term of uniqueTerms) {
        this.docFreqs[term] = (this.docFreqs[term] || 0) + 1;
      }
    }

    this.avgdl = this.N > 0 ? totalLength / this.N : 0;
  }

  /**
   * Calculates the BM25 scores for a search query.
   * Returns a map of document ID to normalized score (0-100).
   */
  search(query: string): Record<string, number> {
    const queryTerms = this.tokenize(query);
    const scores: Record<string, number> = {};

    if (this.N === 0 || queryTerms.length === 0) {
      return scores;
    }

    let maxRawScore = 0;
    const rawScores: Record<string, number> = {};

    for (const docId of Object.keys(this.docLengths)) {
      let docScore = 0;
      const dl = this.docLengths[docId];
      const termFreqs = this.docTermFreqs[docId] || {};

      for (const term of queryTerms) {
        const df = this.docFreqs[term] || 0;
        if (df === 0) continue;

        // Calculate standard IDF
        // We use Math.max(0.0001, ...) to avoid negative IDF for very common terms
        const idf = Math.max(0.0001, Math.log(1 + (this.N - df + 0.5) / (df + 0.5)));

        const tf = termFreqs[term] || 0;
        if (tf === 0) continue;

        // BM25 tf score term
        const numerator = tf * (this.k1 + 1);
        const denominator = tf + this.k1 * (1 - this.b + (this.b * dl) / (this.avgdl || 1));
        
        docScore += idf * (numerator / denominator);
      }

      rawScores[docId] = docScore;
      if (docScore > maxRawScore) {
        maxRawScore = docScore;
      }
    }

    // Normalize scores to 0-100 range
    for (const docId of Object.keys(this.docLengths)) {
      const rawScore = rawScores[docId] || 0;
      scores[docId] = maxRawScore > 0 ? Math.round((rawScore / maxRawScore) * 100) : 0;
    }

    return scores;
  }
}
