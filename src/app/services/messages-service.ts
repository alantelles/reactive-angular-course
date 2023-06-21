import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable()
export class MessagesService {

  showMessages = false;

  private subject = new BehaviorSubject<string[]>([]);
  errors$: Observable<string[]> = this.subject.asObservable().pipe(
    filter(msgs => msgs && msgs.length > 0)
  );

	showErrors(...errors: string[]) {
    this.subject.next(errors)
  }

}