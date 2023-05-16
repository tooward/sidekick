import { Injectable } from '@angular/core';
import { doc } from '@angular/fire/firestore';
import { LanguageServiceClient } from '@google-cloud/language';

@Injectable({
  providedIn: 'root'
})

export class GoogleService {

  private client: LanguageServiceClient;
  private text: string = 'Hello, world!';

  constructor() {
    this.client = new LanguageServiceClient();
  }

  public async analyzeSentiment(text: string): Promise<any> {
  // : google.cloud.language.v1.IAnalyzeSentimentRequest;
    const document =
    {
      "content" : text,
      "type" : "PLAIN_TEXT",
      "language" : "EN",
    };

    const result = this.client.analyzeSentiment({document: document})
    const sentiment = result[0].documentSentiment;
    
    console.log(`Text: ${text}`);
    console.log(`Sentiment score: ${sentiment.score}`);
    console.log(`Sentiment magnitude: ${sentiment.magnitude}`);

    return sentiment;
  }


  public async analyzeEntities(text: string): Promise<any> {
    const document =
    {
      "content" : text,
      "type" : "PLAIN_TEXT",
      "language" : "EN",
    };

    const entityResults = await this.client.analyzeEntities({ document: entityDocument });
    const entities = entityResults[0].entities;
    console.log(entities.length  + ' entities found');
  
    return entities;
  }
}
