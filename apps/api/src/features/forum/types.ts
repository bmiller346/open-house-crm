// Forum feature types
export interface Post {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Reply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
