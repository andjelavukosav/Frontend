import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateBlogDialogComponent } from '../create-blog-dialog/create-blog-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
  selector: 'app-user-blogs',
  templateUrl: './user-blogs.component.html',
  styleUrls: ['./user-blogs.component.css']
})
export class UserBlogsComponent implements OnInit, OnDestroy {

  blogs: (Blog & { sanitizedDescription?: SafeHtml})[] = [];
  userRole: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private blogService: BlogService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {this.userRole = user.role;});

    this.blogService.blogs$
    .pipe(takeUntil(this.destroy$))
    .subscribe(blogs => {
      if (!blogs || blogs.length === 0) {
        this.blogs = [];
        return;
      }
      
      this.blogs = blogs.map(blog => ({
        ...blog,
        sanitizedDescription: this.sanitizer.bypassSecurityTrustHtml(marked.parse(blog.description)),
        images: blog.images || []
      }));
    });

    //inicijalno ucitavanje
    this.blogService.getUserBlogs().subscribe();
  }

  openCreateBlogDialog(event: Event){

    (event.target as HTMLButtonElement).blur();

    const dialogRef = this.dialog.open(CreateBlogDialogComponent, {
      width: '500px',
      disableClose: true  // korisnik ne može zatvoriti klikom van dijaloga
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result === 'created') {
          this.snackBar.open('Blog successfully created!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['custom-snack-bar']
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
