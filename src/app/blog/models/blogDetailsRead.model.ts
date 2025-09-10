import { Blog } from "./blog.model";
import { Comment } from "./comment.model";

export interface BlogDetailsRead{
    blog: Blog,
    comments: Comment[]
}