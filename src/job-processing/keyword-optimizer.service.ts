import { Injectable } from '@nestjs/common';
import * as natural from 'natural';
import * as tf from '@tensorflow/tfjs-node';

@Injectable()
export class KeywordOptimizerService {
  private tokenizer: natural.WordTokenizer;
  private tfidf: natural.TfIdf;
  private model: tf.LayersModel;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.createModel();
  }

  private createModel() {
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [300] }));
    this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    this.model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });
  }

  async optimizeKeywords(text: string): Promise<string> {
    const tokens = this.tokenizer.tokenize(text);
    this.tfidf.addDocument(tokens);

    const optimizedTokens = await Promise.all(
      tokens.map(async (token) => {
        const embedding = await this.getWordEmbedding(token);
        const prediction = this.model.predict(embedding) as tf.Tensor;
        const score = prediction.dataSync()[0];
        return score > 0.5 ? token.toUpperCase() : token;
      })
    );

    return optimizedTokens.join(' ');
  }

  private async getWordEmbedding(word: string): Promise<tf.Tensor> {
    // This is a placeholder. In a real implementation, you would use a pre-trained word embedding model.
    // For demonstration purposes, we're using a random vector.
    return tf.randomNormal([1, 300]);
  }
}
