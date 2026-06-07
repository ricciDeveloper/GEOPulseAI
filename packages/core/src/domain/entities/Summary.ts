import { randomUUID } from 'crypto';

export interface SummaryProps {
  id?: string;
  articleId: string;
  content: string;
  model: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Summary {
  public readonly id: string;
  public readonly articleId: string;
  public readonly content: string;
  public readonly model: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: SummaryProps) {
    this.id = props.id || randomUUID();
    this.articleId = props.articleId;
    this.content = props.content;
    this.model = props.model;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: SummaryProps): Summary {
    if (!props.articleId || props.articleId.trim() === '') {
      throw new Error('Article ID is required');
    }
    if (!props.content || props.content.trim() === '') {
      throw new Error('Content is required');
    }
    if (!props.model || props.model.trim() === '') {
      throw new Error('Model name is required');
    }
    return new Summary(props);
  }
}
