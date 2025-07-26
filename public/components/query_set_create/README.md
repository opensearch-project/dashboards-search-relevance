# Query Set Create - Refactored Structure

This directory contains the refactored Query Set Create component with separated concerns for better maintainability and testability.

## Structure

```
query_set_create/
├── components/           # UI Components
│   ├── query_set_form.tsx    # Form component for query set fields
│   └── query_preview.tsx     # Preview component for parsed queries
├── hooks/               # Custom React Hooks
│   └── use_query_set_form.ts # Form state management hook
├── services/            # API Service Layer
│   └── query_set_service.ts  # Query set API operations
├── utils/               # Business Logic Utilities
│   ├── validation.ts         # Form validation logic
│   └── file_processor.ts     # File processing utilities
├── __tests__/           # Unit Tests
│   ├── validation.test.ts
│   ├── file_processor.test.ts
│   ├── query_set_service.test.ts
│   ├── query_set_create.test.tsx
│   ├── query_preview.test.tsx
│   ├── query_set_form.test.tsx
│   └── use_query_set_form.test.ts
├── query_set_create.tsx # Main component (refactored)
├── index.ts
└── README.md
```

## Key Improvements

### 1. Separation of Concerns
- **UI Components**: Pure presentation components focused on rendering
- **Business Logic**: Extracted to utility functions and custom hooks
- **API Calls**: Centralized in service classes
- **State Management**: Handled by custom hooks

### 2. Custom Hook (`useQuerySetForm`)
- Manages all form state and validation
- Handles file processing logic
- Provides clean interface for components

### 3. Service Layer (`QuerySetService`)
- Encapsulates API communication
- Handles request/response transformation
- Easy to mock for testing

### 4. Utility Functions
- **Validation**: Pure functions for form validation
- **File Processing**: Handles query file parsing logic

### 5. Comprehensive Testing
- Unit tests for all utility functions
- Service layer tests with mocked HTTP calls
- Component tests with mocked dependencies
- High test coverage for business logic

## Usage

```tsx
import { QuerySetCreateWithRouter } from './query_set_create';

// The component now uses the refactored structure internally
<QuerySetCreateWithRouter 
  http={http} 
  notifications={notifications} 
/>
```

## Benefits

1. **Maintainability**: Clear separation makes code easier to understand and modify
2. **Testability**: Each piece can be tested in isolation
3. **Reusability**: Components and utilities can be reused elsewhere
4. **Type Safety**: Strong TypeScript interfaces throughout
5. **Performance**: Optimized with proper memoization and callbacks