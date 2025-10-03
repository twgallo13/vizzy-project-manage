# Vizzy - AI-Powered Marketing Planner PRD

## Core Purpose & Success

**Mission Statement**: Vizzy is an AI-powered marketing planning and analytics platform that helps marketing teams optimize campaigns, analyze performance data, and make data-driven decisions through conversational AI assistance.

**Success Indicators**:
- Users can complete campaign planning workflows 50% faster
- Data import and analysis reduces manual work by 75%
- AI chat resolution rate above 85% for common queries
- Mobile engagement matches desktop functionality

**Experience Qualities**: Intelligent, Efficient, Intuitive

## Project Classification & Approach

**Complexity Level**: Complex Application (advanced functionality, user management, AI integration)

**Primary User Activity**: Creating and Interacting (campaign creation, data analysis, AI conversations)

## Core Problem Analysis

Marketing teams struggle with:
- Fragmented data across multiple platforms (GA4, Meta, ESP, Wrike)
- Time-intensive manual campaign planning and reporting
- Lack of predictive insights for campaign optimization
- Complex tools that require extensive training

## Essential Features

### 1. Vizzy Chat Control Panel
- **Functionality**: AI assistant with commands (/explain, /simulate, /set, /whatif, /export, /status)
- **Purpose**: Provide natural language interface for complex marketing operations
- **Success Criteria**: Users can complete 80% of tasks through chat interface

### 2. Mobile-First Weekly Planner
- **Functionality**: Interactive weekly calendar with KPI cards, activity tracking, swipe gestures
- **Purpose**: Enable campaign planning on mobile devices with full desktop functionality
- **Success Criteria**: Works seamlessly on 6" screens with touch interactions

### 3. Data Import & Integration Hub
- **Functionality**: CSV intake center with mapping wizard, API connectors for GA4/Meta/ESP
- **Purpose**: Centralize marketing data from multiple sources
- **Success Criteria**: Import success rate >95%, mapping accuracy >90%

### 4. Wrike Export System
- **Functionality**: XLSX export with optional API integration, duplicate prevention
- **Purpose**: Seamless integration with existing project management workflows
- **Success Criteria**: Zero manual intervention for standard exports

### 5. User & Role Management
- **Functionality**: CRUD operations, MFA support, skill tracking, Wrike name validation
- **Purpose**: Secure multi-user collaboration with appropriate permissions
- **Success Criteria**: Role-based access works without security vulnerabilities

### 6. AI Settings & Model Routing
- **Functionality**: API key management, model selection, cost controls, fallback routing
- **Purpose**: Ensure reliable AI functionality with cost optimization
- **Success Criteria**: 99.9% AI availability with automatic fallbacks

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence with approachable intelligence
- **Design Personality**: Clean, modern, data-driven yet human-friendly
- **Visual Metaphors**: Data visualization, conversation bubbles, workflow connectors
- **Simplicity Spectrum**: Minimal interface with progressive disclosure of advanced features

### Color Strategy
- **Color Scheme Type**: Analogous with complementary accent
- **Primary Color**: Deep blue (oklch(0.45 0.12 250)) - conveys trust and professionalism
- **Secondary Colors**: Light blue-grays for supporting elements
- **Accent Color**: Warm amber (oklch(0.68 0.15 50)) - highlights important actions
- **Color Psychology**: Blue builds trust, amber creates urgency for CTAs
- **Foreground/Background Pairings**: 
  - Primary text on background: oklch(0.25 0.12 250) on oklch(0.98 0.01 250) - 4.8:1 contrast
  - Primary button text: white on blue - 4.5:1 contrast
  - Accent button text: white on amber - 4.5:1 contrast

### Typography System
- **Font Pairing Strategy**: Inter for UI text, JetBrains Mono for code/data
- **Typographic Hierarchy**: Bold headlines (24px), medium subheads (18px), regular body (14px)
- **Font Personality**: Inter conveys modern professionalism, mono font ensures data readability
- **Which fonts**: Inter (400, 500, 600, 700), JetBrains Mono (400, 600)
- **Legibility Check**: Both fonts tested for accessibility compliance

### Visual Hierarchy & Layout
- **Attention Direction**: F-pattern layout guides eye from KPIs to actions to details
- **White Space Philosophy**: Generous spacing (16px/24px/32px grid) creates breathing room
- **Grid System**: 12-column responsive grid with consistent breakpoints
- **Responsive Approach**: Mobile-first design with progressive enhancement
- **Content Density**: Dense data tables on desktop, card-based layouts on mobile

### Animations
- **Purposeful Meaning**: Subtle fade-ins communicate data loading, slide transitions show navigation flow
- **Hierarchy of Movement**: Primary actions get micro-interactions, navigation uses smooth transitions
- **Contextual Appropriateness**: Professional animations that enhance rather than distract

### UI Elements & Component Selection
- **Component Usage**: Shadcn v4 components provide consistent, accessible foundation
- **Component Customization**: Custom KPI cards, chat interface, weekly planner components
- **Component States**: Hover, active, disabled, loading states for all interactive elements
- **Icon Selection**: Phosphor icons for consistent visual language
- **Spacing System**: 4px base unit with 2x multipliers (8px, 16px, 24px, 32px)
- **Mobile Adaptation**: Touch-friendly 44px minimum targets, swipe gestures, drawer navigation

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance minimum (4.5:1 for normal text, 3:1 for large text)
- All interactive elements keyboard accessible
- Screen reader compatible with proper ARIA labels
- Color-blind friendly palette with non-color dependent indicators

## Implementation Considerations

### Technical Architecture
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn components
- **State Management**: Spark KV for persistence, React state for UI
- **AI Integration**: Spark LLM API with OpenAI/Gemini routing
- **Mobile Support**: Progressive Web App capabilities

### Performance Targets
- **Time to Interactive**: < 2.5 seconds
- **Mobile Performance**: 90+ Lighthouse score
- **API Response**: < 500ms for standard queries
- **Data Processing**: < 2s for CSV imports up to 10k rows

### Security & Privacy
- **Authentication**: Firebase Auth with MFA support
- **API Keys**: Secure storage in Firebase Secrets
- **Data Retention**: Configurable (default 180 days)
- **RBAC**: Role-based access control throughout

## Edge Cases & Problem Scenarios

### Data Import Issues
- **Large files**: Progress indicators, chunked processing
- **Malformed data**: Clear error messages with correction guidance
- **API failures**: Automatic retries with exponential backoff

### AI Service Disruptions
- **Primary model down**: Automatic fallback to secondary model
- **All models down**: Graceful degradation with cached responses
- **Rate limiting**: Queue management with user feedback

### Mobile Connectivity
- **Offline support**: Cache critical data locally
- **Slow connections**: Optimistic UI updates
- **Small screens**: Responsive design with drawer navigation

## Reflection

**Unique Approach**: Vizzy combines conversational AI with traditional marketing tools, making complex analytics accessible through natural language while maintaining professional-grade functionality.

**Key Assumptions**:
- Users prefer chat interfaces for complex tasks
- Mobile-first design won't compromise desktop functionality  
- AI can handle 80%+ of routine marketing queries

**Exceptional Factors**:
- Seamless integration between chat AI and traditional UI
- True mobile-first design for enterprise marketing tools
- Predictive insights that proactively surface opportunities