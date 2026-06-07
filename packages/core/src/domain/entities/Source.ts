import { z } from 'zod';
import { randomUUID } from 'crypto';

export interface SourceProps {
  id?: string;
  name: string;
  url: string;
  rssUrl?: string | null;
  isActive?: boolean;
  trustScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

const urlSchema = z.string().url('Invalid URL');

export class Source {
  public readonly id: string;
  public readonly name: string;
  public readonly url: string;
  public readonly rssUrl: string | null;
  public readonly isActive: boolean;
  public readonly trustScore: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  private constructor(props: SourceProps) {
    this.id = props.id || randomUUID();
    this.name = props.name;
    this.url = props.url;
    this.rssUrl = props.rssUrl || null;
    this.isActive = props.isActive !== undefined ? props.isActive : true;
    this.trustScore = props.trustScore !== undefined ? props.trustScore : 0.0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.deletedAt = props.deletedAt || null;
  }

  public static create(props: SourceProps): Source {
    urlSchema.parse(props.url);
    if (props.rssUrl) {
      urlSchema.parse(props.rssUrl);
    }
    if (!props.name || props.name.trim() === '') {
      throw new Error('Name is required');
    }
    return new Source(props);
  }
}
