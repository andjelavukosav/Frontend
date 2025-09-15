import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogDetailsRead } from '../../models/blogDetailsRead.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { marked } from 'marked';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.css']
})
export class BlogDetailsComponent implements OnInit{
  data?: BlogDetailsRead;
  isLoading = true;
  error?: string;
  safeDescription?: SafeHtml;
  newComment: string = '';
  maxCommentLen = 500;
  isSubmitting = false;
  blogId: string = '';


  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.blogId = this.route.snapshot.paramMap.get('id')!;
    this.blogService.getBlogWithComments(this.blogId).subscribe({
      next: (res) => {
        this.data = res;

        const html = marked.parse(res.blog.description);
        this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(html);

        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blog details.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  submitComment() {
  if (!this.newComment.trim()) return;

  this.isSubmitting = true;
  this.blogService.createComment(this.blogId, this.newComment.trim()).subscribe({
    next: (created: any) => {
      const mappedComment: Comment = {
        id: created.id,
        blogId: created.blog_id,
        userId: created.user_id,
        content: created.content,
        createdAt: created.created_at,
        updatedAt: created.updated_at
      };
      if(this.data){
        this.data = {
          ...this.data,
          comments: [mappedComment, ...(this.data?.comments ?? [])]
        };
      }

      this.newComment = '';
      this.isSubmitting = false;
    },
    error: (err) => {
      // prikaži poruku greške po želji
      this.isSubmitting = false;
    }
  });
}
}
