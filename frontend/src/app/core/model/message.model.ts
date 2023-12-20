export class Message {
  constructor(public status: 'info' | 'success' | 'error', public message: string) {}
}
