import { z } from 'zod';
import { randomUUID } from 'crypto';

export interface ArticleProps {
  id?: string;
  sourceId: string;
  title: string;
  url: string;
  content: string;
  rawHtml?: string | null;
  publishedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

const urlSchema = z.string().url('Invalid URL');

export class Article {
  public readonly id: string;
  public readonly sourceId: string;
  public readonly title: string;
  public readonly url: string;
  public readonly content: string;
  public readonly rawHtml: string | null;
  public readonly publishedAt: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  private constructor(props: ArticleProps) {
    this.id = props.id || randomUUID();
    this.sourceId = props.sourceId;
    this.title = props.title;
    this.url = props.url;
    this.content = props.content;
    this.rawHtml = props.rawHtml || null;
    this.publishedAt = props.publishedAt;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.deletedAt = props.deletedAt || null;
  }

  public static create(props: ArticleProps): Article {
    urlSchema.parse(props.url);
    if (!props.sourceId || props.sourceId.trim() === '') {
      throw new Error('Source ID is required');
    }
    if (!props.title || props.title.trim() === '') {
      throw new Error('Title is required');
    }
    if (!props.content || props.content.trim() === '') {
      throw new Error('Content is required');
    }
    return new Article(props);
  }
}
