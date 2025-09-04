import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CreateBlogDTO } from '../../models/create-blog.dto';
import { MatDialogRef } from '@angular/material/dialog';
import { BlogService } from '../../services/blog.service';
import * as SimpleMDE from 'simplemde';
import { marked } from 'marked'; 
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-create-blog-dialog',
  templateUrl: './create-blog-dialog.component.html',
  styleUrls: ['./create-blog-dialog.component.css']
})
export class CreateBlogDialogComponent implements OnInit, AfterViewInit {

  newBlog: CreateBlogDTO = {
    title: '',
    description: ''
  };

  sanitizedDescription!: SafeHtml;

  selectedFiles: File[] = [];

  @ViewChild('descriptionEditor') descriptionEditor!: ElementRef;
  simplemde!: SimpleMDE;

  constructor(
    private dialogRef: MatDialogRef<CreateBlogDialogComponent>,
    private blogService: BlogService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    
  }
  ngAfterViewInit() {
    this.simplemde = new SimpleMDE({
      element: this.descriptionEditor.nativeElement,
      spellChecker: false,
      placeholder: "Write your blog description in Markdown...",
      autoDownloadFontAwesome: true,  // omogućava toolbar ikone
      status: false,
      toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen"],
      previewRender: (plainText: string) => {
        return marked.parse(plainText); 
    }
    });

    // svaki put kada se sadržaj menja, ažuriramo newBlog.description
    this.simplemde.codemirror.on('change', () => {
      this.newBlog.description = this.simplemde.value();
      this.sanitizedDescription = this.sanitizer.bypassSecurityTrustHtml(
        marked.parse(this.newBlog.description)
      );
    });
  }

  onSubmit() {
    if (!this.newBlog.title || !this.newBlog.description) return;

    const formData = new FormData();
    formData.append('title', this.newBlog.title);
    formData.append('description', this.newBlog.description);

    this.selectedFiles.forEach(file => formData.append('images', file));

    this.blogService.createBlog(formData).subscribe({
      next: () => this.dialogRef.close('created'),
      error: (err) => console.error('Failed to create blog:', err)
    });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if(input.files && input.files.length > 0){
      this.selectedFiles.push(...Array.from(input.files)); 
     }
  }

  onCancel() {
    this.dialogRef.close();
  }

}
