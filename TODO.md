# Auth Guard Update TODO

- [x] Update `app.routes.ts` to add `canActivate: [AuthGuard]` and `data: { requiresAuth: false }` to the auth routes parent.
- [x] Update `app.routes.ts` to add `data: { requiresAuth: true }` to the protected routes parent.
- [x] Update `auth.guard.ts` to implement logic checking `requiresAuth` data and redirect accordingly.
- [x] Test navigation scenarios to ensure correct redirects.
