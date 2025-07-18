// Forum service (to be implemented)
import { Post, Reply } from './types';

export async function listPosts(): Promise<Post[]> {
  // TODO: fetch posts from database
  return [];
}

export async function listReplies(postId: string): Promise<Reply[]> {
  // TODO: fetch replies for a post
  return [];
}
