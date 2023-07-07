import { LoadingService } from './loading.service';
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { Course, sortCoursesBySeqNo } from "../model/course";
import { CoursesService } from "./courses.service";
import { catchError, map, shareReplay, tap } from "rxjs/operators";
import { MessagesService } from "./messages-service";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class CoursesStore {
  
  
  private subject = new BehaviorSubject<Course[]>([]);
  courses$: Observable<Course[]> = this.subject.asObservable();

  constructor(
    private messages: MessagesService,
    private loading: LoadingService,
    private http: HttpClient
  ) {
    this.loadAllCourses();
  }

  private loadAllCourses() {
    const loadCourses$ = this.http.get<Course[]>('/api/courses').pipe(
      map(res => res['payload']),
      catchError(err => {
        const message = "Could not load courses";
        this.messages.showErrors(message);
        console.log(message, err);
        return throwError(err);
      }),
      tap(courses => this.subject.next(courses))
    );
    this.loading.showLoaderUntilCompleted(loadCourses$).subscribe();    
  }

  saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {
    const courses = this.subject.getValue();
    const index = courses.findIndex(course => course.id == courseId);
    const newCourse = {
      ...courses[index],
      ...changes
    }
    const newCourses: Course[] = courses.slice(0);
    newCourses[index] = newCourse;
    this.subject.next(newCourses);
    return this.http.put(`/api/courses/${courseId}`, changes).pipe(
      catchError(err => {
        const message = "Could not save course";
        this.messages.showErrors(message);
        console.log(message, err);
        return throwError(err);
      }),
      shareReplay()
    )
  }

  filterByCategory(category: string): Observable<Course[]> {
    return this.courses$.pipe(
      map(courses => 
        courses.filter(course => course.category == category)
          .sort(sortCoursesBySeqNo)
      )
    )
  }

}