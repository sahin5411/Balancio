# Profile Management

<cite>
**Referenced Files in This Document**   
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts)
- [profile-edit.component.ts](file://src/app/profile/profile-edit/profile-edit.component.ts)
- [user.service.ts](file://src/app/shared/services/user.service.ts)
- [user.model.ts](file://src/app/shared/models/user.model.ts)
- [auth.service.ts](file://src/app/auth/auth.service.ts)
- [api.service.ts](file://src/app/shared/services/api.service.ts)
- [constants.ts](file://src/app/shared/utils/constants.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [ProfileViewComponent](#profileviewcomponent)
3. [ProfileEditComponent](#profileeditcomponent)
4. [UserService Methods](#userservice-methods)
5. [Form Validation and Security Features](#form-validation-and-security-features)
6. [Authentication State Integration](#authentication-state-integration)
7. [Profile Picture Handling](#profile-picture-handling)
8. [Security Considerations](#security-considerations)
9. [Feedback Mechanisms](#feedback-mechanisms)
10. [Responsive Design and Data Persistence](#responsive-design-and-data-persistence)

## Introduction
The profile management system provides users with comprehensive control over their personal information, security settings, and application preferences. This document details the implementation of profile components, user data management services, and associated security features within the Angular application. The system enables users to view and edit personal details, manage security configurations including password changes and two-factor authentication, and configure notification preferences.

## ProfileViewComponent

The ProfileViewComponent serves as the primary interface for users to view their profile information and manage account settings. It displays user details, security configurations, notification preferences, and account actions in a structured layout.

```mermaid
flowchart TD
A[ProfileViewComponent] --> B[Load User Profile]
A --> C[Load Budget Data]
A --> D[Load Transactions]
A --> E[Load Categories]
B --> F[Initialize User Profile]
F --> G[Set Full Name, Email, Initials]
F --> H[Calculate Member Since, Days Active]
F --> I[Load Settings from User Data]
G --> J[Display in Template]
H --> J
I --> K[Initialize Notification Settings]
K --> L[Display in Template]
M[Edit Personal Info] --> N[Open Edit Form]
N --> O[Update User via UserService]
P[Change Password] --> Q[Validate Password Requirements]
Q --> R[Call Change Password API]
R --> S[Force Logout on Success]
T[Toggle 2FA] --> U[Update User Settings]
U --> V[Update Two-Factor Status]
```

**Diagram sources**
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)

**Section sources**
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)

## ProfileEditComponent

The ProfileEditComponent focuses on budget management functionality, allowing users to set, update, and clear their monthly budgets with configurable alert thresholds. The component provides a form-based interface for budget configuration with real-time validation.

```mermaid
classDiagram
class ProfileEditComponent {
+budgetForm : FormGroup
+currentBudget : MonthlyBudget | null
+budgetOverview : BudgetOverview | null
+transactions : Transaction[]
+isLoading : boolean
+thresholdError : string
+showClearBudgetModal : boolean
+createForm() : FormGroup
+setupFormValidation() : void
+loadBudgetData() : void
+loadTransactions() : void
+updateBudgetWithTransactionData() : void
+onSubmit() : void
+clearBudget() : void
+confirmClearBudget() : void
+cancelClearBudget() : void
+formatCurrency(amount : number) : string
+getStatusColorClass() : string
+getProgressBarColorClass() : string
+getStatusMessage() : string
+getStatusMessageClass() : string
}
class BudgetService {
+getBudget() : Observable~MonthlyBudget~
+getBudgetOverview() : Observable~BudgetOverview~
+updateBudget(budgetData : any) : Observable~MonthlyBudget~
+formatCurrency(amount : number, currency : string) : string
+getBudgetStatusColor(percentage : number, thresholds : any) : string
+getBudgetProgressColor(percentage : number, thresholds : any) : string
+getBudgetStatusMessage(overview : BudgetOverview) : string
}
class TransactionService {
+getTransactions() : Observable~Transaction[]~
}
class NotificationService {
+addNotification(notification : any) : void
}
ProfileEditComponent --> BudgetService : "uses"
ProfileEditComponent --> TransactionService : "uses"
ProfileEditComponent --> NotificationService : "uses"
ProfileEditComponent --> ConfirmationModalComponent : "includes"
```

**Diagram sources**
- [profile-edit.component.ts](file://src/app/profile/profile-edit/profile-edit.component.ts#L1-L513)

**Section sources**
- [profile-edit.component.ts](file://src/app/profile/profile-edit/profile-edit.component.ts#L1-L513)

## UserService Methods

The UserService provides essential methods for retrieving and updating user data through API calls. It acts as an intermediary between the application components and the backend API, handling data transformation and authentication.

```mermaid
sequenceDiagram
participant ProfileView as ProfileViewComponent
participant UserService as UserService
participant ApiService as ApiService
participant Backend as Backend API
ProfileView->>UserService : getCurrentUser()
UserService->>ApiService : getWithAuth('users/profile')
ApiService->>Backend : GET /api/users/profile (with Bearer token)
Backend-->>ApiService : User data
ApiService-->>UserService : Response
UserService-->>ProfileView : Mapped User object
ProfileView->>UserService : updateUser(updateData)
UserService->>ApiService : putWithAuth('users/profile', payload)
ApiService->>Backend : PUT /api/users/profile (with Bearer token)
Backend-->>ApiService : Updated user data
ApiService-->>UserService : Response
UserService-->>ProfileView : Mapped updated User object
```

**Diagram sources**
- [user.service.ts](file://src/app/shared/services/user.service.ts#L1-L64)
- [api.service.ts](file://src/app/shared/services/api.service.ts#L1-L93)

**Section sources**
- [user.service.ts](file://src/app/shared/services/user.service.ts#L1-L64)

## Form Validation and Security Features

The profile management system implements comprehensive form validation and security features to ensure data integrity and protect user accounts. These include client-side validation, password strength requirements, and secure API communication.

```mermaid
flowchart TD
A[Form Validation] --> B[Personal Information Form]
B --> C[Full Name Required]
B --> D[Email Format Validation]
B --> E[Non-empty Fields]
A --> F[Password Change Form]
F --> G[New Passwords Match]
F --> H[Minimum 8 Characters]
F --> I[Current Password Required]
A --> J[Budget Form]
J --> K[Amount > 0]
J --> L[Warning Threshold < Critical Threshold]
J --> M[Thresholds Between 0-100]
N[Security Features] --> O[HTTPS Communication]
O --> P[Bearer Token Authentication]
P --> Q[API Service Headers]
N --> R[Password Change]
R --> S[Current Password Verification]
S --> T[Force Logout After Change]
N --> U[Two-Factor Authentication]
U --> V[Settings Persistence]
V --> W[Immediate Effect]
```

**Diagram sources**
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)
- [user.service.ts](file://src/app/shared/services/user.service.ts#L1-L64)
- [api.service.ts](file://src/app/shared/services/api.service.ts#L1-L93)

**Section sources**
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)

## Authentication State Integration

The profile components integrate with the authentication state to ensure that user data is properly loaded and protected. The system maintains user session information and responds appropriately to authentication changes.

```mermaid
classDiagram
class AuthService {
-currentUser : User | null
+login(email, password) : Observable~{ success : boolean; user? : User; message? : string }~
+signup(userData) : Observable~{ success : boolean; user? : User; message? : string }~
+logout() : void
+isAuthenticated() : boolean
+getCurrentUser() : User | null
+getToken() : string | null
+loginWithGoogle() : Observable~{ success : boolean; user? : User; message? : string }~
+loginWithGitHub() : Observable~{ success : boolean; user? : User; message? : string }~
}
class ProfileViewComponent {
-authService : AuthService
-userService : UserService
-router : Router
+ngOnInit() : void
+signOut() : void
+confirmLogout() : void
}
class ApiService {
-baseUrl : string
+getHeaders() : HttpHeaders
+getAuthHeaders() : HttpHeaders
+getWithAuth<T>(endpoint : string) : Observable<T>
+putWithAuth<T>(endpoint : string) : Observable<T>
}
ProfileViewComponent --> AuthService : "depends on"
ProfileViewComponent --> ApiService : "uses for authenticated calls"
ApiService --> AuthService : "retrieves token"
AuthService --> localStorage : "stores token and user"
```

**Diagram sources**
- [auth.service.ts](file://src/app/auth/auth.service.ts#L1-L120)
- [api.service.ts](file://src/app/shared/services/api.service.ts#L1-L93)
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)

**Section sources**
- [auth.service.ts](file://src/app/auth/auth.service.ts#L1-L120)

## Profile Picture Handling

The profile management system handles user profile pictures through the User model and UserService. While the current implementation uses placeholder images, the architecture supports custom avatars.

```mermaid
erDiagram
USER {
string id PK
string email UK
string firstName
string lastName
string avatar
object settings
datetime createdAt
datetime updatedAt
}
USER ||--o{ SETTINGS : contains
SETTINGS {
boolean emailNotifications
boolean budgetAlerts
boolean monthlyReports
string reportFormat
boolean twoFactorEnabled
}
note right of USER: Avatar field supports custom image URLs<br/>Defaults to placeholder if not provided
```

**Diagram sources**
- [user.model.ts](file://src/app/shared/models/user.model.ts#L1-L15)
- [user.service.ts](file://src/app/shared/services/user.service.ts#L1-L64)

**Section sources**
- [user.model.ts](file://src/app/shared/models/user.model.ts#L1-L15)

## Security Considerations

The profile management system implements multiple security measures to protect sensitive user operations, including password changes, account deletion, and personal information updates.

```mermaid
flowchart TD
A[Security Considerations] --> B[Authentication]
B --> C[Bearer Token in Headers]
C --> D[LocalStorage Token Storage]
D --> E[Token Validation on Requests]
A --> F[Password Management]
F --> G[Current Password Verification]
G --> H[Minimum 8 Character Requirement]
H --> I[Password Match Validation]
I --> J[Immediate Logout After Change]
A --> K[Data Protection]
K --> L[HTTPS for All API Calls]
L --> M[Input Sanitization]
M --> N[Error Handling Without Leaks]
A --> O[Session Management]
O --> P[Clear Storage on Logout]
P --> Q[Force Page Reload]
Q --> R[Prevent Cached Data Access]
A --> R[Two-Factor Authentication]
R --> S[Settings Stored in User Profile]
S --> T[Immediate State Update]
T --> U[No Additional Verification Required]
```

**Diagram sources**
- [auth.service.ts](file://src/app/auth/auth.service.ts#L1-L120)
- [api.service.ts](file://src/app/shared/services/api.service.ts#L1-L93)
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)

**Section sources**
- [auth.service.ts](file://src/app/auth/auth.service.ts#L1-L120)

## Feedback Mechanisms

The system provides comprehensive feedback mechanisms to inform users of operation success or failure, ensuring a clear user experience for all profile management actions.

```mermaid
sequenceDiagram
participant User as User
participant Component as Profile Component
participant Service as Notification Service
participant Browser as Browser
User->>Component : Initiate action (e.g., update profile)
Component->>UserService : Call update method
UserService->>ApiService : Make API request
ApiService->>Backend : Send request
Backend-->>ApiService : Response
ApiService-->>UserService : Process response
UserService-->>Component : Return result
alt Success
Component->>Service : Add success notification
Service->>Browser : Display toast message
Browser-->>User : Show success feedback
else Error
Component->>Browser : Show alert dialog
Browser-->>User : Display error message
Component->>Component : Revert changes if needed
end
User->>Component : Close modal/dialog
Component->>Component : Reset form state
```

**Diagram sources**
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)
- [profile-edit.component.ts](file://src/app/profile/profile-edit/profile-edit.component.ts#L1-L513)
- [notification.service.ts](file://src/app/shared/services/notification.service.ts)

**Section sources**
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)

## Responsive Design and Data Persistence

The profile management components are designed with responsive layouts and implement proper data persistence patterns to ensure a consistent user experience across devices and sessions.

```mermaid
flowchart TD
A[Responsive Design] --> B[Tailwind CSS]
B --> C[Mobile-First Approach]
C --> D[Flexible Grid Layouts]
D --> E[Adaptive Component Sizing]
A --> F[Form Layouts]
F --> G[Stacked on Mobile]
G --> H[Side-by-Side on Desktop]
H --> I[Appropriate Input Sizing]
J[Data Persistence] --> K[Client-Side Storage]
K --> L[localStorage for Token]
L --> M[localStorage for User Data]
M --> N[sessionStorage for Temporary Data]
J --> O[Server-Side Persistence]
O --> P[API Calls for User Updates]
P --> Q[Real-time Synchronization]
Q --> R[Immediate UI Updates]
S[State Management] --> T[Component State]
T --> U[Reactive Forms]
U --> V[Form Validation State]
V --> W[Loading States]
W --> X[Modal Visibility]
```

**Diagram sources**
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)
- [profile-edit.component.ts](file://src/app/profile/profile-edit/profile-edit.component.ts#L1-L513)
- [auth.service.ts](file://src/app/auth/auth.service.ts#L1-L120)

**Section sources**
- [profile-view.component.ts](file://src/app/profile/profile-view/profile-view.component.ts#L1-L662)
- [profile-edit.component.ts](file://src/app/profile/profile-edit/profile-edit.component.ts#L1-L513)