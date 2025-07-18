// Forum controller (to be implemented)
import { Request, Response } from 'express';
import { listPosts, listReplies } from './service';

export async function getPostsHandler(req: Request, res: Response) {
  const posts = await listPosts();
  res.json(posts);
}

export async function getRepliesHandler(req: Request, res: Response) {
  const { postId } = req.params;
  const replies = await listReplies(postId);
  res.json(replies);
}
