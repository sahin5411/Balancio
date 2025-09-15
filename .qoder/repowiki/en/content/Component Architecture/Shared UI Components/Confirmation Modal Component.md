# Confirmation Modal Component

<cite>
**Referenced Files in This Document**   
- [confirmation-modal.component.ts](file://src/app/shared/components/confirmation-modal/confirmation-modal.component.ts)
- [category-list.component.html](file://src/app/categories/category-list/category-list.component.html)
- [category-list.component.ts](file://src/app/categories/category-list/category-list.component.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Component Overview](#component-overview)
3. [@Input Properties](#input-properties)
4. [@Output Events](#output-events)
5. [Usage Example in CategoryList](#usage-example-in-categorylist)
6. [Accessibility and User Interaction](#accessibility-and-user-interaction)
7. [Styling and Responsive Design](#styling-and-responsive-design)
8. [Common Issues and Solutions](#common-issues-and-solutions)
9. [Best Practices for Reuse](#best-practices-for-reuse)

## Introduction
The `ConfirmationModalComponent` is a reusable Angular component designed to prompt users for confirmation before executing critical operations such as deleting a transaction or category. It ensures user intent is explicitly confirmed, preventing accidental data loss. The modal supports customization through input properties and communicates results via output events, making it flexible for integration across various features.

## Component Overview
The `ConfirmationModalComponent` is implemented as a standalone Angular component using Tailwind CSS for styling and animations. It displays a centered dialog with a title, message, icon, and two action buttons (confirm and cancel). The visibility of the modal is controlled via the `isVisible` input, and it emits events when the user confirms or cancels the action.

The component uses dynamic class binding to style the icon and confirm button based on the `type` input (e.g., danger, warning), allowing visual cues that match the severity of the action.

**Section sources**
- [confirmation-modal.component.ts](file://src/app/shared/components/confirmation-modal/confirmation-modal.component.ts#L1-L130)

## @Input Properties
The component accepts several input properties to customize its appearance and behavior:

- `isVisible`: Controls the visibility of the modal.
- `title`: The title displayed at the top of the modal.
- `message`: The descriptive message shown below the title.
- `confirmText`: Text for the confirm button.
- `cancelText`: Text for the cancel button.
- `type`: Determines the visual style (danger, warning, info, success).
- `icon`: Material icon name to display in the modal header.

These inputs allow parent components to fully customize the modal’s content and appearance without modifying the component itself.

**Section sources**
- [confirmation-modal.component.ts](file://src/app/shared/components/confirmation-modal/confirmation-modal.component.ts#L25-L35)

## @Output Events
The component emits two events to communicate user decisions back to the parent:

- `confirmed`: Emitted when the user clicks the confirm button.
- `cancelled`: Emitted when the user clicks the cancel button.

These events enable parent components to react appropriately to user input, such as proceeding with a deletion or dismissing the operation.

**Section sources**
- [confirmation-modal.component.ts](file://src/app/shared/components/confirmation-modal/confirmation-modal.component.ts#L37-L39)

## Usage Example in CategoryList
In the `CategoryListComponent`, the confirmation modal is used to confirm category deletion. A boolean flag `showDeleteModal` controls modal visibility, bound to the `isVisible` input. When a user selects "Delete" from a category's action menu, `deleteCategory()` sets `categoryToDelete` and shows the modal.

```html
<app-confirmation-modal
  [isVisible]="showDeleteModal"
  title="Delete Category"
  [message]="getDeleteMessage()"
  confirmText="Delete Category"
  cancelText="Cancel"
  type="danger"
  icon="delete"
  (confirmed)="confirmDeleteCategory()"
  (cancelled)="cancelDeleteCategory()">
</app-confirmation-modal>
```

The `confirmed` event triggers `confirmDeleteCategory()`, which calls the `CategoryService` to delete the category and refresh the list. The `cancelled` event resets the state.

**Section sources**
- [category-list.component.html](file://src/app/categories/category-list/category-list.component.html#L186-L196)
- [category-list.component.ts](file://src/app/categories/category-list/category-list.component.ts#L170-L190)

## Accessibility and User Interaction
The modal supports accessibility features and intuitive user interactions:

- **ARIA Attributes**: While not explicitly defined in the template, the structure implies a dialog role. Best practice recommends adding `role="dialog"` and `aria-labelledby` to the modal container for screen readers.
- **Keyboard Support**: The current implementation does not include keyboard event handling. To support Escape (cancel) and Enter (confirm), the component should listen for `@HostListener('document:keydown')` and route key presses accordingly.
- **Backdrop Click Dismissal**: The modal does not currently support closing via backdrop click. This can be added by binding a click handler to the overlay div that emits the `cancelled` event.

Enhancing these interactions would improve usability and accessibility compliance.

**Section sources**
- [confirmation-modal.component.ts](file://src/app/shared/components/confirmation-modal/confirmation-modal.component.ts#L10-L15)

## Styling and Responsive Design
The modal uses Tailwind CSS utility classes for responsive layout and visual styling. It is centered using Flexbox (`flex items-center justify-center`) and scales responsively with `max-w-md w-full mx-4`. The modal includes subtle entrance animations (fade-in and slide-in) defined in the component's `styles` array using CSS keyframes.

The icon and button colors are dynamically assigned using helper methods like `getConfirmButtonClass()` and `getIconColorClass()`, which return Tailwind classes based on the `type` input. This ensures consistent theming across different use cases.

**Section sources**
- [confirmation-modal.component.ts](file://src/app/shared/components/confirmation-modal/confirmation-modal.component.ts#L15-L25)

## Common Issues and Solutions
A potential issue when using this modal is the "ExpressionChangedAfterItHasBeenCheckedError" that may occur when `isVisible` is set to `false` after confirmation or cancellation. This happens because Angular's change detection detects a state change after the view has been checked.

**Solution**: Inject `ChangeDetectorRef` and call `detectChanges()` after updating visibility:

```ts
constructor(private cdr: ChangeDetectorRef) {}

onConfirm(): void {
  this.confirmed.emit();
  this.isVisible = false;
  this.cdr.detectChanges();
}
```

Alternatively, defer the visibility update using `setTimeout()` or `Promise.resolve()` to schedule it in the next digest cycle.

**Section sources**
- [confirmation-modal.component.ts](file://src/app/shared/components/confirmation-modal/confirmation-modal.component.ts#L41-L47)

## Best Practices for Reuse
To maximize reusability:
- Always bind `isVisible` via a boolean in the parent component.
- Use meaningful `title`, `message`, and `confirmText` values specific to the context.
- Leverage the `type` input to visually indicate action severity.
- Handle both `confirmed` and `cancelled` events to manage component state cleanly.
- Consider extending the component with additional inputs (e.g., `disableClose`, `showIcon`) for greater flexibility.

This modal can be reused across features like transaction deletion, budget reset, or profile deactivation with minimal configuration.

**Section sources**
- [confirmation-modal.component.ts](file://src/app/shared/components/confirmation-modal/confirmation-modal.component.ts#L1-L130)
- [category-list.component.ts](file://src/app/categories/category-list/category-list.component.ts#L170-L190)