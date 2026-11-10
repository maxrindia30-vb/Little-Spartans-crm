# Little Spartans Sports Academy CRM

> **Modern, Multi-Portal Children's Sports Academy CRM Frontend inspired by SpynPRO & Little Spartans Academy.**  
> Website: [https://www.littlespartans.co.in/](https://www.littlespartans.co.in/) • Reference: [https://pro.spyn.co/](https://pro.spyn.co/)

---

## 🎨 Official Brand Colour System (Strictly Enforced)

The entire frontend interface uses exclusively the four official brand colours:

| Colour Name | Hex Code | System Usage |
| :--- | :--- | :--- |
| **Warm Cream** | `#FFF4E8` | Top navigation bar background, main application canvas background, subtle cards, and status containers |
| **Spartan Orange** | `#F4510B` | Active sidebar navigation states, primary action CTA buttons (`#FFFFFF` text), KPI highlights, badges & attendance rings |
| **Navy Blue** | `#172B50` | Primary page headers, typography, module labels, secondary badges, and comparative chart series |
| **Pure White** | `#FFFFFF` | Sidebar containers, dashboard cards, modal dialogs, dropdown menus, and data tables |

---

## 🏛️ Four Integrated CRM Portals

### 1. 🛡️ Admin Portal (`Commander Vikramaditya` • Academy Director)
* **Executive Dashboard**: Real-time KPI cards (*Total Students, Active Parents, Certified Coaches, Active Enquiries, Monthly Revenue, Pending Fees, Attendance Rate*), SVG **Revenue & Growth velocity chart**, interactive **Attendance Donut Ring**, and **Program Capacity distribution**.
* **Enquiry Management**: Visual pipeline tracking prospective child leads across stages (*New*, *Contacted*, *Trial Scheduled*, *Trial Completed*, *Enrolled*) with 1-click conversion into student records.
* **Student Management**: Roster with athlete photos, Spartan ranks (*Junior Warrior*, *Fleet Striker*, *Cubs*), medical alerts, attendance %, fee status, detail modal with badges, and delete actions.
* **Parent Management**: Directory of guardians, linked children, lifetime tuition, pending dues, and 1-click SMS payment reminders.
* **Coach Management**: Faculty credentials (*FIG Certified*, *AFC 'B' License*, *World Athletics*), student counts, star ratings (4.8–5.0), and new coach onboarding.
* **Programs & Classes**: Sports disciplines (*Gymnastics*, *Junior Football*, *Athletics*, *Basketball*, *Martial Arts*, *Little Cubs*) and batch scheduling with court allocations and capacity meters.
* **Payments & Billing**: Invoice ledger, status filters (*Paid*, *Pending*), tuition collection modal, and **Official Printable Tax PDF Receipt** generator.
* **Attendance Management**: Batch & date selector with real-time counters and 1-click **Present / Absent / Late** buttons, plus **Mark All Present**.
* **Competitions & Tournaments**: Event cards (*Agility Cup 2026*, *Football Derby*, *Karate Championship*) with participant quotas and athlete registration.
* **Leave Management**: Application queue for athletes and staff with instant **Approve / Reject** actions.
* **Feedback & Reviews**: Parent testimonials, star ratings, and coaching quality scores.
* **Certificates & Honors**: Milestone credential issuing and printable **Certificate of Spartan Achievement** viewer.
* **Reports & Analytics**: Cohort retention (94.2%), trial conversion velocity (76.8%), coach-to-student ratio (1:8.5), and acquisition channel breakdown.
* **Academy Settings**: Facility profile, center locations, academic calendar, and brand palette validation.

---

### 2. 👨‍👩‍👧 Parent Portal (`Dr. Rohan Sharma` • Verified Guardian)
* **Parent Dashboard**: Overview of enrolled children (*Aarav Sharma* & *Sanya Kapoor*), next training session alerts, fee dues, and recent coach feedback.
* **My Children**: Athlete profiles with Spartan rank, badges won, and medical notes.
* **Classes & Schedules**: Timetable with court numbers and coach names.
* **Attendance Record**: Monthly attendance rate tracking and punctuality scores.
* **Payments & Dues**: Online tuition payment simulation and instant PDF receipt downloads.
* **Competitions & Cups**: Browse upcoming tournaments and register children in one click.
* **Leave Requests**: Submit planned leave applications for unit tests or family travel.
* **Certificates & Badges**: Spartan honor cards and milestone medal downloads.
* **Communication & Announcements**: Academy circulars and nutrition advisories.
* **Feedback**: Review coach session quality and submit ratings.
* **Profile**: Contact records and emergency hotlines.

---

### 3. 🏃 Coach Portal (`Coach Vikram Singh` • FIG Level 2 Faculty)
* **Coach Dashboard**: Today’s training sessions, total assigned athletes (38), punctuality score (99.2%), and faculty rating (4.9/5.0).
* **My Batches & Drills**: Batch schedules, court assignments, and syllabus links.
* **My Student Roster**: Athletes under supervision, medical flags, and contact details.
* **Mark Attendance**: Interactive session register with Present, Absent, and Late toggles.
* **Skill Evaluations**: Spartan agility rubrics (*Motor Agility*, *Reaction Time*, *Balance Beam*, *Discipline*, *Spartan Spirit* scored 1–10).
* **Competitions**: Tournament squad nominations.
* **Coach Leave**: Apply leave with substitute coach designation.
* **Spartan Drills Guide**: 4-phase coaching curriculum (Warm-up, Obstacle Circuit, Pediatric Safety, Warrior Oath).
* **Profile & Faculty Bio**: Certifications, specialization, and experience details.

---

### 4. 🎧 Customer Support Portal (`Priya Menon` • Lead Relations Officer)
* **Support Dashboard**: Open ticket queues, active leads, first-response time (< 12 mins), and resolution rate (97.4%).
* **Enquiries & Pipeline**: Prospective customer leads with pipeline stage status management.
* **Customer Directory**: Unified search across parents and students with one-click contact details.
* **Support Tickets**: Threaded conversation tickets (*Batch Reschedule*, *Kit Delivery*, *Tax Invoices*) with priority tags and direct reply messaging.
* **Communication Log**: SMS, Email, and WhatsApp dispatch audit trails.
* **Follow-ups & Calls**: Scheduled parent callback list with **Call Done** logging.
* **Parent Grievances**: Inbound feedback and escalation tracker.
* **SLA Reports**: Support desk resolution metrics and trial turnout statistics.

---

### 5. 🔐 Multi-Role Authentication Screens
* Dedicated **Full Login Screen** displaying role-specific credentials and 1-click demo access for **Admin**, **Parent**, **Coach**, and **Customer Support**.
* Accessible via **Sign Out** in the user profile menu, or through the **Role Login Screens** dialog.

---

## 💻 Tech Stack & Architecture

- **React 18** + **Vite 6**
- **Tailwind CSS 3** (configured with Spartan custom color tokens & subtle SaaS elevation shadows)
- **Lucide React** (high-precision iconography)
- **localStorage** Reactive Persistence: All additions (students, payments, enquiries, tickets, attendance marks, leaves) persist in your browser and can be reset at any time with the **Reset Demo** button.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```
Generates production assets in `dist/`.
