import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Blog } from '../models/blog.model';
import { BlogDetailsRead } from '../models/blogDetailsRead.model';
@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:8082/blogs';

  private blogsSubject = new BehaviorSubject<Blog[]>([]);
  blogs$ = this.blogsSubject.asObservable();

  constructor(private http: HttpClient) { }

  getUserBlogs(): Observable<Blog[]>{
    return this.http.get<Blog[]>(this.apiUrl + '/user').pipe(
      tap(blogs => this.blogsSubject.next(blogs))
    );
  }

  createBlog(data: FormData): Observable<Blog>{
    return this.http.post<Blog>(this.apiUrl + '/create-blog', data).pipe(
      tap(newBlog => {
        const currentList = this.blogsSubject.value || [];
        this.blogsSubject.next([newBlog, ...currentList]); //dodaje na pocetak liste
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
}
