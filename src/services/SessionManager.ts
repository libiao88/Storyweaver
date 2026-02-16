// services/SessionManager.ts
import { generateUUID } from '@/types/storyweaver';

export class SessionManager {
  private static SESSION_KEY = 'sw_session_id';
  private static VIEWING_SESSION_KEY = 'sw_viewing_session';
  private static SHARED_SESSION_KEY = 'sw_shared_session';
  
  private sessionId: string | null = null;
  
  constructor() {
    this.initSession();
  }
  
  private initSession(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedSession = urlParams.get('session');
    
    if (sharedSession) {
      this.sessionId = sharedSession;
      sessionStorage.setItem(SessionManager.SHARED_SESSION_KEY, sharedSession);
      return;
    }
    
    this.sessionId = sessionStorage.getItem(SessionManager.SESSION_KEY);
    if (this.sessionId) return;
    
    this.sessionId = localStorage.getItem(SessionManager.SESSION_KEY);
    if (this.sessionId) {
      sessionStorage.setItem(SessionManager.SESSION_KEY, this.sessionId);
      return;
    }
    
    this.sessionId = this.generateSessionId();
    this.saveSession(this.sessionId);
  }
  
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `sess_${timestamp}_${random}`;
  }
  
  private saveSession(sessionId: string): void {
    localStorage.setItem(SessionManager.SESSION_KEY, sessionId);
    sessionStorage.setItem(SessionManager.SESSION_KEY, sessionId);
  }
  
  getSessionId(): string {
    return this.sessionId!;
  }
  
  getEffectiveSessionId(): string {
    const viewingSession = sessionStorage.getItem(SessionManager.VIEWING_SESSION_KEY);
    if (viewingSession) return viewingSession;
    return this.getSessionId();
  }
  
  getShareUrl(): string {
    return `${window.location.origin}?session=${this.getSessionId()}`;
  }
  
  switchSession(sessionId: string): void {
    sessionStorage.setItem(SessionManager.VIEWING_SESSION_KEY, sessionId);
    window.location.reload();
  }
  
  restoreOriginalSession(): void {
    sessionStorage.removeItem(SessionManager.VIEWING_SESSION_KEY);
    window.location.reload();
  }
  
  clearSession(): void {
    localStorage.removeItem(SessionManager.SESSION_KEY);
    sessionStorage.removeItem(SessionManager.SESSION_KEY);
    this.sessionId = this.generateSessionId();
    this.saveSession(this.sessionId);
  }
  
  isViewingMode(): boolean {
    return !!sessionStorage.getItem(SessionManager.VIEWING_SESSION_KEY);
  }
}

export const sessionManager = new SessionManager();
