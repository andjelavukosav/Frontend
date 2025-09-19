import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogDetailsRead } from '../../models/blogDetailsRead.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { marked } from 'marked';
import { Comment } from '../../models/comment.model';
import { forkJoin } from 'rxjs';
import type { ToggleLikeResponse } from '../../services/blog.service';

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

  editingId: string | number | null = null;
  editModel = '';
  savingEdit: Record<string | number, boolean> = {};
  editError: string | null = null;

  // 👤 trenutni korisnik
  currentUserId?: string;

  // ❤️ like state
  liked = false;
  likeCount = 0;
  likeLoading = false;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.blogId = this.route.snapshot.paramMap.get('id')!;
    this.currentUserId = this.getUserIdFromToken(); // ili iz tvog AuthService-a

    this.blogService.getBlogWithComments(this.blogId).subscribe({
      next: (res) => {
        this.data = res;

        const html = marked.parse(res.blog.description);
        this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(html);

        // ⬅ posle što smo postavili data, učitaj i stanje lajkova
        this.loadLikeState();

        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blog details.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  /** Učitaj da li je korisnik lajkovao i ukupan broj lajkova. */
  private loadLikeState(): void {
    if (!this.data?.blog?.id) return;

    this.likeLoading = true;
    const blogId = this.data.blog.id;

    // Ako gateway već čita user_id iz JWT-a, možeš pozvati bez this.currentUserId
    forkJoin([
      this.blogService.hasUserLiked(blogId, this.currentUserId),
      this.blogService.countLikes(blogId),
    ]).subscribe({
      next: ([likedResp, countResp]) => {
        this.liked = !!likedResp.liked;
        this.likeCount = countResp.total ?? 0;
        this.likeLoading = false;
      },
      error: () => {
        // nemoj rušiti UI ako ovde padne — samo skloni loader
        this.likeLoading = false;
      }
    });
  }

  /** Klik na srce (toggle) sa optimističkim update-om i rollback-om na grešku. */
  onToggleLike(): void {
    if (!this.data?.blog?.id || this.likeLoading) return;

    const blogId = this.data.blog.id;
    const prevLiked = this.liked;
    const prevCount = this.likeCount;

    // Optimistički update
    this.likeLoading = true;
    this.liked = !prevLiked;
    this.likeCount = prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1;

    // Ako gateway ne zahteva userId u body-ju (čita iz JWT-a), pozovi bez drugog argumenta
    this.blogService.toggleLike(blogId, this.currentUserId).subscribe({
      next: (res: ToggleLikeResponse) => {
        // uskladi sa stanjem sa servera (source of truth)
        this.liked = !!res.liked;
        this.likeCount = res.total ?? this.likeCount;
        this.likeLoading = false;
      },
      error: () => {
        // rollback
        this.liked = prevLiked;
        this.likeCount = prevCount;
        this.likeLoading = false;
      }
    });
  }

  // ========== postojeće stvari ==========
  // Za grid slika
  trackByIndex(index: number): number {
    return index;
  }

  // Za komentare (ako koristiš trackBy u listi komentara)
  trackByComment(index: number, c: Comment): string | number {
    return c?.id ?? index;
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
        if (this.data) {
          this.data = {
            ...this.data,
            comments: [mappedComment, ...(this.data?.comments ?? [])]
          };
        }

        this.newComment = '';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
      }
    });
  }

  onEditComment(c: any) {
    this.editingId = c.id;
    this.editModel = c.content; // init textarea
    this.editError = null;
  }

  cancelEdit() {
    this.editingId = null;
    this.editModel = '';
    this.editError = null;
  }

  async saveEdit(c: any) {
    if (!this.editModel?.trim() || this.editModel === c.content) return;

    this.editError = null;
    this.savingEdit[c.id] = true;

    try {
      const updated = await this.blogService
        .updateComment(c.id, { content: this.editModel })
        .toPromise();

      // Ažuriraj lokalno
      c.content = (updated as any)?.content ?? this.editModel;
      c.updatedAt = (updated as any)?.updatedAt ?? new Date().toISOString();

      this.cancelEdit();
    } catch (err: any) {
      console.error(err);
      this.editError = err?.error?.message || 'Updating the comment failed. Please try again.';
    } finally {
      this.savingEdit[c.id] = false;
    }
  }

  // ===== helpers =====
  private getUserIdFromToken(): string | undefined {
    try {
      const token = localStorage.getItem('token');
      if (!token) return undefined;
      const [, payloadBase64] = token.split('.');
      const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(json);
      // prilagodi ključ onome što tvoj JWT sadrži (npr. 'sub' ili 'user_id')
      return payload.user_id || payload.sub || undefined;
    } catch {
      return undefined;
    }
  }
}
