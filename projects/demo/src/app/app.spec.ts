import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    // jsdom (unlike a real browser) does not implement window.matchMedia;
    // the shell's real engine boot (isTouchDevice(), odontogram.ts:1059)
    // calls it unconditionally while building the tooth grid. Stub it so
    // mounting the real, unmocked shell here doesn't throw.
    if (typeof window.matchMedia !== 'function') {
      window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;
    }

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the odontogram shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('aao-odontogram-shell')).not.toBeNull();
    expect(compiled.querySelector('#toothGrid')).not.toBeNull();
  });
});
