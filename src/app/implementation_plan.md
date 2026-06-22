# Mobile Responsiveness Implementation Plan

This plan details the changes required to make the entire TrustVault application fully mobile-responsive following a mobile-first approach while preserving the existing design language.

## User Review Required

> [!IMPORTANT]
> The `DashboardLayout` will be converted into a Client Component (`"use client"`) to manage the state of the mobile sidebar drawer. This is a common pattern in Next.js and will not negatively impact performance, as the `children` (page content) will still be rendered on the server where applicable.

## Proposed Changes

### Global Layout & Components

#### [MODIFY] `src/app/dashboard/layout.jsx`
- Add `"use client"` directive.
- Introduce `isSidebarOpen` state.
- Pass state and toggle handlers to `Sidebar` and `Topbar`.

#### [MODIFY] `src/components/Sidebar.jsx`
- **Mobile:** Convert to a fixed, slide-in drawer using `-translate-x-full` and `translate-x-0` classes based on `isSidebarOpen`.
- **Desktop:** Keep the current static sidebar behavior using `md:relative md:translate-x-0`.
- Add an overlay div that appears on mobile when the sidebar is open. Clicking it will close the drawer.

#### [MODIFY] `src/components/Topbar.jsx`
- Add a hamburger menu button visible only on mobile (`md:hidden`).
- Ensure action buttons (New Vault, Profile, Notifications) fit properly or stack/shrink on small screens using flexbox wrap and gap adjustments.

### Dashboard & Vault Pages

#### [MODIFY] `src/app/dashboard/page.jsx`
- Update the grid layout for Dashboard Cards:
  - `grid-cols-1` (Mobile)
  - `sm:grid-cols-2` (Tablet)
  - `lg:grid-cols-3` or `lg:grid-cols-4` (Desktop)

#### [MODIFY] `src/app/dashboard/vaults/page.jsx`
- Update the vault grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.

#### [MODIFY] `src/components/VaultCard.jsx`
- Ensure 100% width on mobile.

#### [MODIFY] `src/app/dashboard/vaults/[vaultsId]/page.jsx`
- Resize the main Balance Card to wrap text nicely.
- Stack action buttons (Deposit, Withdraw, Copy Invite Code) vertically on mobile (`flex-col md:flex-row`).
- Ensure the Withdrawal form inputs take 100% width on mobile.

#### [MODIFY] `src/app/dashboard/activity/page.jsx`
- Convert the Activity table to be responsive.
- Wrap the table in a container with `overflow-x-auto` to prevent horizontal scrolling on the page body.
- Prevent text cutoff.

#### [MODIFY] `src/app/dashboard/settings/page.jsx`
- Make form inputs `w-full`.
- Ensure proper spacing and padding on small screens (`p-4 md:p-6`).
- Make the Action buttons (Update Password, Cancel) full width on mobile (`flex-col sm:flex-row`).

### Admin Page

#### [MODIFY] `src/app/admin/page.jsx`
- **Header:** Stack the title and action buttons on mobile (`flex-col md:flex-row`).
- **Stats Cards:** Update grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-6`.
- **Tabs:** Allow horizontal scrolling for the tab buttons if they overflow (`overflow-x-auto whitespace-nowrap`).
- **Tables (Accounts, Vaults, Deposits, Withdrawals, Activity):** Wrap all tables in an `overflow-x-auto` div to ensure they scroll horizontally inside their container rather than breaking the page layout.

### Authentication & Public Pages

#### [MODIFY] `src/app/auth/login/page.jsx` & `src/app/auth/signup/page.jsx`
- Ensure the login/signup card takes up full width minus some padding on mobile (`w-full max-w-md mx-4 md:mx-0`).

#### [MODIFY] `src/app/vault/page.jsx`, `src/app/vault/create/page.jsx`, `src/app/vault/join/page.jsx`
- Update container max-widths and paddings (`px-4 md:px-8`).
- Ensure forms are 100% width and action buttons stack if necessary.

## Verification Plan

### Manual Verification
- Resize the browser window to test Mobile (320px), Tablet (768px), and Desktop (1024px+) sizes.
- Verify the Sidebar Drawer opens smoothly and closes when clicking outside.
- Ensure no horizontal scrolling on the `body` across all pages.
- Confirm forms and buttons take full width on mobile.
- Verify that large tables scroll nicely within their containers without breaking the layout.
