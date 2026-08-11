# Angular Advanced Odontogram

Angular port of [react-advanced-odontogram](https://github.com/ZoliQua/React-Odontogram-Modul) — feature parity with v2.4.0 (payload version 2.20). JSON and FHIR exports round-trip compatible.

## Installation

```bash
npm install angular-advanced-odontogram
```

## Usage

### Step 1: Import the component

Import `OdontogramShellComponent` in your Angular component:

```typescript
import { OdontogramShellComponent } from 'angular-advanced-odontogram';

@Component({
  selector: 'app-root',
  imports: [OdontogramShellComponent],
  template: `<aao-odontogram-shell [enableNotes]="true" />`,
})
export class AppComponent {}
```

### Step 2: Add styles

Include the Tailwind-compiled styles in your global styles or component:

```css
@import 'angular-advanced-odontogram/styles.css';
```

## Documentation

For comprehensive documentation, examples, and API reference, visit the [GitHub repository](https://github.com/ZoliQua/Angular-Advanced-Odontogram).
