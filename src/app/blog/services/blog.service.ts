import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Blog } from '../models/blog.model';
import { BlogDetailsRead } from '../models/blogDetailsRead.model';
import { HttpParams } from '@angular/common/http';
export interface ToggleLikeResponse { liked: boolean; total: number; }
export interface HasUserLikedResponse { liked: boolean; }
export interface CountLikesResponse { total: number; }
@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:8080/blogs';

  private blogsSubject = new BehaviorSubject<Blog[]>([]);
  blogs$ = this.blogsSubject.asObservable();

  constructor(private http: HttpClient) { }

  getUserBlogs(): Observable<Blog[]> {
    return this.http.get<any[]>(this.apiUrl + '/user').pipe(
      tap((blogs: any[]) => {   
        blogs = Array.isArray(blogs) ? blogs : []; 

        const mappedBlogs: Blog[] = blogs.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          description: blog.description,
          createdAt: blog.created_at, // snake_case → camelCase
          userId: blog.user_id,
          images: blog.images || []
        }));

        this.blogsSubject.next(mappedBlogs);
      })
    );
  }



  createBlog(data: FormData): Observable<Blog>{
    return this.http.post<any>(this.apiUrl + '/create-blog', data).pipe(
      tap((newBlog : any) => {
    
        const blog: Blog = {
          id: newBlog.id,
          title: newBlog.title,
          description: newBlog.description,
          userId: newBlog.user_id,
          createdAt: newBlog.created_at, 
          images: newBlog.images || []
        };

        const currentList = this.blogsSubject.value;
        if (Array.isArray(currentList)) {
          this.blogsSubject.next([blog, ...currentList]);
        } else {
          this.blogsSubject.next([blog]);
        }     
      })
    );
  }

  getBlogWithComments(blogId: string): Observable<BlogDetailsRead> {
    return this.http.get<BlogDetailsRead>(`${this.apiUrl}/${blogId}/details`);
  }

  createComment(blogId: string, content: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token ?? ''}`
    });
    return this.http.post(`${this.apiUrl}/${blogId}/comments`, { content }, { headers });
  }

  updateComment(commentId: string | number, body: { content: string }) {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token ?? ''}`
  });
  return this.http.put<any>(`${this.apiUrl}/comments/${commentId}`, body, { headers });
}

toggleLike(blogId: string, userId?: string): Observable<ToggleLikeResponse> {
    const headers = this.authHeaders();
    const body = userId ? { user_id: userId } : {}; // ako GW ubacuje userId iz JWT-a, može i prazno telo
    return this.http.post<ToggleLikeResponse>(
      `${this.apiUrl}/${blogId}/likes:toggle`,
      body,
      { headers }
    );
  }

  /**
   * Da li je korisnik lajkovao blog. Ako gateway sam čita user_id iz JWT-a,
   * pozovi bez userId; inače prosledi userId (kao query param).
   */
  hasUserLiked(blogId: string, userId?: string): Observable<HasUserLikedResponse> {
    const headers = this.authHeaders();
    let params = new HttpParams();
    if (userId) params = params.set('user_id', userId);
    return this.http.get<HasUserLikedResponse>(
      `${this.apiUrl}/${blogId}/likes/me`,
      { headers, params }
    );
  }

  /** Ukupan broj lajkova za blog. */
  countLikes(blogId: string): Observable<CountLikesResponse> {
    const headers = this.authHeaders();
    return this.http.get<CountLikesResponse>(
      `${this.apiUrl}/${blogId}/likes/count`,
      { headers }
    );
  }

  // ====== Helpers ======
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

}
