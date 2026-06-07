import { randomUUID } from 'crypto';

export interface ScoreProps {
  id?: string;
  articleId: string;
  geoScore: number;
  aeoScore: number;
  aiVisibility: number;
  createdAt?: Date;
}

export class Score {
  public readonly id: string;
  public readonly articleId: string;
  public readonly geoScore: number;
  public readonly aeoScore: number;
  public readonly aiVisibility: number;
  public readonly createdAt: Date;

  private constructor(props: ScoreProps) {
    this.id = props.id || randomUUID();
    this.articleId = props.articleId;
    this.geoScore = props.geoScore;
    this.aeoScore = props.aeoScore;
    this.aiVisibility = props.aiVisibility;
    this.createdAt = props.createdAt || new Date();
  }

  public static create(props: ScoreProps): Score {
    if (!props.articleId || props.articleId.trim() === '') {
      throw new Error('Article ID is required');
    }
    if (props.geoScore < 0 || props.geoScore > 100) {
      throw new Error('GEO Score must be between 0 and 100');
    }
    if (props.aeoScore < 0 || props.aeoScore > 100) {
      throw new Error('AEO Score must be between 0 and 100');
    }
    if (props.aiVisibility < 0 || props.aiVisibility > 100) {
      throw new Error('AI Visibility Score must be between 0 and 100');
    }
    return new Score(props);
  }
}
