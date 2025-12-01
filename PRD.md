# K8s Security Gate - Kubernetes Manifest Security Scanner

An interactive security scanner for Kubernetes YAML manifests that visualizes vulnerabilities and provides automated fixes in a professional DevOps environment.

**Experience Qualities**:
1. **Professional** - Enterprise-grade interface that instills confidence in security tooling with precise, technical presentation
2. **Immediate** - Real-time feedback and instant visual indicators of security issues without delay or confusion
3. **Empowering** - Clear actionable insights that transform complex security findings into understandable, fixable problems

**Complexity Level**: Light Application (multiple features with basic state)
The application handles YAML input, simulates async scanning workflows, manages scan history, and presents complex security data in an accessible format. It maintains state across sessions but doesn't require user accounts or complex backend orchestration.

## Essential Features

### YAML Editor with Monaco
- **Functionality**: Full-featured code editor with syntax highlighting, line numbers, and VS Code-like experience for editing Kubernetes manifests
- **Purpose**: Provides familiar, professional environment for DevOps engineers to work with YAML configurations
- **Trigger**: Page load displays empty editor; user can paste or type YAML content
- **Progression**: User lands on page → sees Monaco editor → pastes YAML → editor syntax highlights → ready to scan
- **Success Criteria**: Editor renders with YAML syntax highlighting, accepts multi-line input, displays line numbers, supports common keyboard shortcuts

### Security Scanning Workflow
- **Functionality**: Analyzes YAML manifests for security vulnerabilities using simulated Checkov-style security checks
- **Purpose**: Identifies misconfigurations and security risks in Kubernetes deployments before they reach production
- **Trigger**: User clicks "Scan Manifest" button with YAML content in editor
- **Progression**: Click scan → job saves to KV with PENDING status → loader shows "Analyzing resources..." → simulated 2s delay → findings populate → status updates to COMPLETED → decorations appear in editor → sidebar shows results
- **Success Criteria**: Scan completes, findings appear within 3 seconds, security score calculates correctly, editor highlights problematic lines

### Finding Visualization & Annotations
- **Functionality**: Displays security vulnerabilities as inline decorations in the editor and detailed cards in sidebar
- **Purpose**: Makes security issues immediately visible in context of the actual code that needs fixing
- **Trigger**: Scan completes successfully with findings in reportJson
- **Progression**: Scan completes → lines with issues get red/yellow decorations → sidebar populates with finding cards → user clicks finding → editor scrolls to relevant line → user reviews issue
- **Success Criteria**: Each finding appears both as decoration and sidebar card, line numbers match exactly, severity colors are distinct, clicking navigates correctly

### Security Score Dashboard
- **Functionality**: Calculates and displays 0-100 security score based on severity and count of findings
- **Purpose**: Provides at-a-glance assessment of manifest security posture for quick decision-making
- **Trigger**: Scan completion with findings data
- **Progression**: Findings processed → score calculated (100 - weighted penalty) → badge displays in header → color reflects score range (red <50, yellow 50-79, green 80+)
- **Success Criteria**: Score accurately reflects finding severity, updates on new scans, color coding is intuitive, persists across page refreshes

### Scan History Management
- **Functionality**: Stores and retrieves previous scan jobs with metadata, allowing users to review past analyses
- **Purpose**: Enables tracking security improvements over time and comparison of different manifest versions
- **Trigger**: User clicks "History" button or page loads with existing scans
- **Progression**: View history → list shows recent scans with timestamps → click scan → loads YAML and findings into editor → can re-scan or modify
- **Success Criteria**: Scans persist across sessions, list shows most recent first, can load any previous scan, metadata displays correctly

## Edge Case Handling

- **Empty YAML Submission** - Prevent scanning empty editor, show toast notification requesting content
- **Invalid YAML Syntax** - Detect parse errors, highlight syntax issues, suggest corrections before scanning
- **No Findings Result** - Display success state with 100 score and "No vulnerabilities detected" message
- **Large YAML Files** - Monaco handles large files gracefully, maintain performance with pagination if needed
- **Rapid Re-scanning** - Debounce scan button to prevent multiple simultaneous scans
- **Missing reportJson** - Handle failed scans gracefully with error state and retry option

## Design Direction

The interface should evoke the precision and confidence of professional DevOps tooling - think terminal emulators, code editors, and monitoring dashboards used by platform engineers. A dark cyberpunk aesthetic with neon accent colors creates visual energy while maintaining readability for extended use. The design should feel cutting-edge and technical without sacrificing usability, balancing futuristic styling with functional clarity that respects the serious nature of security work.

## Color Selection

**Custom palette** - Drawing from cyberpunk/terminal aesthetics with high-contrast neon accents on dark backgrounds to create depth and focus attention on critical security information.

- **Primary Color**: Electric Cyan `oklch(0.75 0.15 195)` - Represents active scanning, actions, and primary CTAs; evokes digital interfaces and security monitoring
- **Secondary Colors**: 
  - Deep Charcoal `oklch(0.15 0.01 240)` for backgrounds - provides eye-friendly darkness
  - Slate Gray `oklch(0.25 0.02 240)` for cards/elevated surfaces - creates subtle depth
- **Accent Color**: Neon Purple `oklch(0.65 0.25 300)` - Highlights completed states, success indicators, and interactive elements with vibrant energy
- **Severity Colors**:
  - Critical/High: Neon Red `oklch(0.60 0.25 25)` - Immediate danger, requires attention
  - Medium: Amber Yellow `oklch(0.75 0.15 85)` - Warning, should address soon
  - Low: Soft Blue `oklch(0.70 0.10 220)` - Informational, minor concerns

**Foreground/Background Pairings**:
- Background (Deep Charcoal #1a1a2e): White text `oklch(0.95 0 0)` - Ratio 12.8:1 ✓
- Card (Slate Gray #25254a): White text `oklch(0.95 0 0)` - Ratio 10.2:1 ✓
- Primary (Electric Cyan): Dark text `oklch(0.15 0.01 240)` - Ratio 7.5:1 ✓
- Accent (Neon Purple): White text `oklch(0.95 0 0)` - Ratio 5.2:1 ✓
- Destructive (Neon Red): White text `oklch(0.95 0 0)` - Ratio 4.9:1 ✓
- Muted (Medium Gray): Cyan accent `oklch(0.75 0.15 195)` - Ratio 5.1:1 ✓

## Font Selection

Typography should feel technical and monospaced where appropriate - evoking terminal output and code while maintaining excellent readability for extended security analysis sessions. **JetBrains Mono** for code and technical content provides exceptional clarity with coding ligatures; **Inter** for UI text delivers clean, modern professionalism.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/32px/tight letter-spacing/-0.02em
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing
  - H3 (Card Titles): Inter SemiBold/18px/normal spacing
  - Body (UI Text): Inter Regular/14px/line-height 1.5
  - Code (Editor/Findings): JetBrains Mono Regular/13px/line-height 1.6
  - Small (Metadata): Inter Regular/12px/muted color

## Animations

Animations should feel responsive and purposeful - quick state transitions that communicate system status without impeding workflow, with occasional moments of polish when scans complete successfully to create satisfaction.

- **Purposeful Meaning**: Scanning loader pulses with cyber glow effect to indicate active processing; findings fade in sequentially to draw attention; decorations appear with subtle highlight flash
- **Hierarchy of Movement**: 
  1. Critical: Scan status changes (immediate feedback, 150ms)
  2. Important: Finding appearance (staggered 50ms delay, 200ms fade)
  3. Polish: Score badge count-up animation (300ms)
  4. Subtle: Hover states on findings (100ms)

## Component Selection

- **Components**: 
  - Monaco Editor (external) for YAML editing with full VS Code experience
  - Button (shadcn) - Primary for "Scan Manifest" with cyan styling, Secondary for history/actions
  - Card (shadcn) - Finding cards with severity-based border colors, custom padding
  - Badge (shadcn) - Security score indicator, severity labels with custom colors
  - ScrollArea (shadcn) - Findings sidebar with custom dark scrollbar
  - Separator (shadcn) - Dividing sections with subtle cyan glow
  - Skeleton (shadcn) - Loading states for scan history
  - Dialog (shadcn) - Fix suggestions and detailed finding views
  - Tabs (shadcn) - Switch between Editor, History, Settings views

- **Customizations**: 
  - Custom terminal-style loader component with animated dots and scan progress messages
  - Monaco decorations API integration for inline issue highlighting
  - Custom finding card with expandable fix suggestions
  - Animated security score badge with gradient based on score range
  
- **States**: 
  - Buttons: Glow effect on hover, pressed state darkens, disabled shows muted with reduced opacity
  - Editor decorations: Red underline for critical, yellow for medium, blue for low severity
  - Finding cards: Hover elevates with shadow, selected state shows cyan left border
  - Scan status: Distinct visual states for PENDING (pulsing), PROCESSING (animated), COMPLETED (static), FAILED (red)

- **Icon Selection**: 
  - Shield (security/protection) for main branding
  - AlertTriangle (warnings) for findings
  - CheckCircle (success) for clean scans
  - Code (manifest content)
  - Play (scan action)
  - Clock (history)
  - Zap (quick fixes)

- **Spacing**: 
  - Container padding: `p-6` (24px)
  - Card internal: `p-4` (16px)
  - Section gaps: `gap-4` (16px) for related, `gap-6` (24px) for distinct sections
  - Findings list: `gap-3` (12px) between cards
  - Editor margins: `m-0` (Monaco fills container)

- **Mobile**: 
  - Stack editor and sidebar vertically on <768px
  - Collapsible findings sidebar with floating button toggle
  - Reduced padding to `p-4` on mobile
  - Touch-friendly 44px minimum tap targets for all interactive elements
  - Monaco editor responsive with adjusted font size (11px on mobile)
