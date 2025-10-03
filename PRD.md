# Vizzy - AI-Powered Marketing Planner & Analytics Platform

A comprehensive marketing planning and analytics platform that combines AI-powered chat assistance with mobile-first planning tools, data visualization, and seamless Wrike integration.

**Experience Qualities**:
1. **Intuitive** - Natural language chat interface makes complex marketing analytics accessible to all skill levels
2. **Responsive** - Mobile-first design that works flawlessly across all devices with gesture-based interactions
3. **Professional** - Enterprise-grade security, audit trails, and integration capabilities for serious marketing teams

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Multi-role user management with RBAC
- AI model routing and API key management
- Advanced data import/export workflows
- Comprehensive admin controls and audit logging

## Essential Features

### Vizzy Chat Control Panel
- **Functionality**: AI assistant with 5 modes (Explain, Simulate, Set, Undo, Run) and 6 commands (/explain, /simulate, /set, /whatif, /export, /status)
- **Purpose**: Democratizes marketing analytics through natural language interface
- **Trigger**: FAB button on mobile, always-visible chat on desktop
- **Progression**: User types command → Vizzy processes with appropriate AI model → Returns actionable insights → Optional commit/simulate actions
- **Success criteria**: All commands work with proper guardrails, admin actions logged with diffs

### Mobile-First Weekly Planner
- **Functionality**: KPI cards, weekly strip navigation, Day Card drawers with swipe gestures
- **Purpose**: Enable on-the-go marketing planning and quick data access
- **Trigger**: Main app navigation or swipe gestures
- **Progression**: Open weekly view → Swipe between days → Tap for Day Card drawer → Edit activities → Share to Wrike
- **Success criteria**: Works smoothly on 6" screens, all gestures responsive

### AI Model Management & Routing
- **Functionality**: Admin setup for OpenAI/Gemini keys, routing table, fallback handling
- **Purpose**: Ensure reliable AI functionality with cost control
- **Trigger**: Admin setup wizard on first use, ongoing management in settings
- **Progression**: Admin enters keys → Test connections → Configure routing → Set fallbacks → Monitor diagnostics
- **Success criteria**: Keys stored securely, routing works, fallbacks engage properly

### Data Import & Export Hub
- **Functionality**: CSV mapping wizard, canonical schemas, Wrike XLSX export
- **Purpose**: Seamless data flow between external tools and Vizzy
- **Trigger**: Import/export buttons, drag-and-drop CSV files
- **Progression**: Upload CSV → Map headers to schema → Preview data → Import → Export to Wrike format
- **Success criteria**: Mapping wizard handles various CSV formats, XLSX validates in Wrike

### User & Store Management
- **Functionality**: CRUD operations for users/roles, profile management, store data
- **Purpose**: Support team collaboration with proper access controls
- **Trigger**: Admin navigation to user management
- **Progression**: Create user → Assign role → Set permissions → Manage profile → Monitor activity
- **Success criteria**: WrikeName validation works, MFA enforced, RBAC properly implemented

## Edge Case Handling
- **Missing AI Keys**: Blocking modal for admins only, clear setup instructions
- **Offline Mode**: Cached data available, sync when reconnected
- **Import Failures**: Clear error messages with mapping suggestions
- **Export Errors**: Retry mechanisms and alternative format options
- **Chat Retention**: Configurable cleanup with privacy compliance
- **Rate Limiting**: Per-user throttling with clear feedback

## Design Direction
Vizzy should feel professional yet approachable - like a high-end marketing agency's internal tool. The interface balances data density with clarity, using subtle animations and micro-interactions to guide users through complex workflows while maintaining the efficiency marketing professionals demand.

## Color Selection
Complementary (opposite colors) - Using a sophisticated blue-orange palette that conveys both trustworthiness and energy, perfect for a data-driven marketing platform.

- **Primary Color**: Deep Professional Blue (oklch(0.45 0.12 250)) - Communicates trust, reliability, and intelligence
- **Secondary Colors**: Slate Gray (oklch(0.65 0.02 250)) for backgrounds and neutral elements
- **Accent Color**: Vibrant Orange (oklch(0.68 0.15 50)) - Draws attention to key actions and positive outcomes
- **Foreground/Background Pairings**:
  - Background (Light Blue-Gray #F8FAFC): Dark Blue text (oklch(0.25 0.12 250)) - Ratio 8.2:1 ✓
  - Primary (Deep Blue): White text (oklch(1 0 0)) - Ratio 6.1:1 ✓
  - Accent (Vibrant Orange): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓
  - Card (Pure White): Dark Blue text (oklch(0.25 0.12 250)) - Ratio 9.1:1 ✓

## Font Selection
Typography should convey modern professionalism with excellent readability for data-heavy interfaces, using Inter for its superior legibility in analytics dashboards.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body (Data/Content): Inter Regular/16px/relaxed line height
  - Caption (Metadata): Inter Regular/14px/normal spacing
  - Code (API Keys/IDs): JetBrains Mono/14px/normal spacing

## Animations
Animations should feel purposeful and efficient - helping users understand state changes and navigate complex data without unnecessary flourish, matching the expectations of busy marketing professionals.

- **Purposeful Meaning**: Smooth transitions between planning views reinforce the temporal relationship between days/weeks, while loading states for AI responses build anticipation for insights
- **Hierarchy of Movement**: Vizzy chat responses get prominent animations (typing indicators, slide-ins), data visualizations use subtle entrance animations, navigation uses quick spatial transitions

## Component Selection
- **Components**: 
  - Dialog/Sheet for Vizzy chat on different screen sizes
  - Card components for KPI displays and Day Cards
  - Command for chat input with autocomplete
  - Table for user/store management with sorting/filtering
  - Form components for settings and import wizards
  - Tabs for organizing admin panels
  - Progress indicators for import/export operations
- **Customizations**: 
  - Custom weekly calendar component for planner
  - Branded FAB for mobile Vizzy access
  - Custom drag-and-drop zones for CSV import
  - Specialized KPI card layouts
- **States**: Buttons show clear loading states during AI processing, inputs validate in real-time, disabled states for unavailable features
- **Icon Selection**: Phosphor icons for consistent modern feel - Chat for Vizzy, Calendar for planner, Upload/Download for data operations
- **Spacing**: Consistent 4/8/16/24px spacing using Tailwind scale, generous padding in mobile views
- **Mobile**: Drawer-based navigation, swipe gestures for day navigation, FAB for primary actions, collapsible sections for data density