import { Directive, HostListener } from "@angular/core"

@Directive({
  selector: "input[appNoPaste]"
})
export class NoPaste {
  @HostListener("paste", ["$event"])
  onPasteHandler(event: ClipboardEvent) {
    event.preventDefault()
  }
}
