export interface Paper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  link: string;
  published: string;
  category: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  userId: string;
  createdAt: number;
}

export interface PaperTag {
  id: string;
  name: string;
  color: string;
  paperId: string;
  createdAt: number;
}
