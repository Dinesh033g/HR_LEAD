# Implementation Plan - HR Lead Management Web Application

Build a complete end-to-end full-stack MERN HR Lead Management Web Application with omnichannel lead ingestion (WhatsApp webhook, PDF, Excel, OCR for images/handwritten notes, manual entry), intelligent multi-level language-based round-robin assignment (Admin -> TL -> HR), role-based permissions (Admin, TL, HR), and interactive lead status tracking via Kanban board.

## User Review Required

> [!NOTE]
> - **Local Database**: MongoDB will connect to `mongodb://127.0.0.1:27017/hr_lead_management`.
> - **OCR & Document Extraction**: PDF (`pdf-parse`), Excel (`xlsx`), and Images (`tesseract.js`) will extract text locally on the server.
> - **State & Styling**: Frontend will be built using Vite + React + Tailwind CSS + Lucide Icons for responsive dashboards.

## Proposed Components & Architecture

### Backend (`/backend`)
1. **Database & Models (`/backend/models/`)**
   - `User.js`: Schema containing `name`, `email`, `password`, `role` (Admin, TL, HR), `languagesSpoken` (Array), `tl_id` (ref to User for HRs).
   - `Lead.js`: Schema containing `name`, `phone`, `language`, `source` (WhatsApp, Manual, PDF, Image, Excel), `status` (`New`, `Contacted`, `Call Accepted`, `Call Rejected`, `Interview Scheduled`, `Selected`, `Rejected`), `assigned_tl` (ref), `assigned_hr` (ref), `history` array.
2. **Middleware (`/backend/middleware/auth.js`)**
   - JWT validation & RBAC permission checking (`verifyToken`, `authorizeRoles('Admin', 'TL', 'HR')`).
3. **Services (`/backend/services/`)**
   - `parsingService.js`: Parses text from PDF buffers, Excel files, and Images via Tesseract OCR, using regex to extract name, phone number, and preferred language.
   - `assignmentService.js`: Core algorithm for routing leads.
     - Evenly divides incoming leads among active TLs using round-robin.
     - For each TL, filters downstream HRs matching the lead's preferred language and round-robins assignment.
     - Leaves unmatched or extra leads in `assigned_tl` pool with `assigned_hr: null` for TL "Self-Assignment".
4. **Controllers & Routes (`/backend/controllers/` & `/backend/routes/`)**
   - `authController.js` & `authRoutes.js`: Login, register user (with role & TL mapping).
   - `userController.js` & `userRoutes.js`: Admin user management (promote, demote, fire, list TLs/HRs).
   - `leadController.js` & `leadRoutes.js`: Lead CRUD, file upload ingestion, self-assignment, status updates.
   - `webhookController.js` & `webhookRoutes.js`: WhatsApp webhook endpoint listening for incoming messages and auto-creating leads.

### Frontend (`/frontend`)
1. **Setup**: Vite + React + Tailwind CSS.
2. **Authentication State**: Auth Context with token persistence & user role scoping.
3. **Dashboards**:
   - **Admin Dashboard**: Pipeline metrics, system-wide lead view, employee management modal (add, promote HR to TL, demote TL to HR, remove employee), manual lead entry & upload.
   - **Team Lead Dashboard**: Team leads overview, downstream HR leads, unassigned TL pool leads with "Self-Assign" button.
   - **HR Dashboard**: Interactive Kanban board (`New` -> `Contacted` -> `Call Accepted / Rejected` -> `Interview Scheduled` -> `Selected / Rejected`) to seamlessly update status.
   - **Omnichannel Upload Component**: Drag-and-drop file upload supporting PDF, XLSX, images with instant parsing preview.

## Verification Plan

### Automated Verification
- Server health check & MongoDB connection verification.
- Backend API testing (Auth login/register, lead ingestion, intelligent routing logic test script, user management).

### Manual Verification
- Testing user login for Admin, TL, and HR roles.
- Ingesting sample PDF/Excel/Image files and testing lead auto-assignment across TLs and language-matched HRs.
- Dragging/moving leads through the Kanban pipeline on HR dashboard.
