# Data Dictionary

---

## Report

Primary report entity. One row per submitted report.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Integer | auto | Pk |
| `tracking_code` | CharField(12) | auto | Auto-generated UUID hex on save, never changes |
| `location` | CharField(255) | yes | Human-readable name |
| `location_link` | URLField | no | Google Maps or any map URL |
| `latitude` / `longitude` | Decimal(18,15) | no | GPS |
| `incident_date` | DateField | yes | Date of incident — not submission date |
| `report_details` | TextField | yes | Sanitized with bleach before saving |
| `contact_info` | CharField(255) | no | reporter's choice |
| `report_type` | CharField | yes | `اعتداء` · `ابتزاز` · `تحرش` · `سرقة` · `مشادة`|
| `status` | CharField | auto | Default: تم استلام البلاغ |
| `severity` | CharField | no | `حرج` · `عالية` · `متوسطة` · `منخفضة` — Assigned by the local AI classifier or manually by staff. |
| `is_fake` | Boolean | auto | Default false — staff flag for suspicious reports |
| `created_at` | DateTimeField | auto | Submission timestamp |

**Notes:**
Lifecycle: `تم استلام البلاغ` → `قيد المراجعة` → `قيد المعالجة` → `تم الحل` / `تم الإغلاق`

Closed reports (`تم الحل`, `تم الإغلاق`) are excluded from active listings and only appear in the archive endpoint.

---

## CriminalInfo

Suspect details linked to a report. One report can have zero or more.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Integer | auto | Pk |
| `report` | FK → Report | yes | Cascade delete |
| `name` | CharField(255) | yes | Suspect name |
| `description` | TextField | no | physical description, identifying details |
| `other_info` | TextField | no | Any additional information |

---

## Attachment

Files uploaded with a report. A report can have multiple attachments. 

Classified by extension at upload time — audio goes to `media/attachments/audio/`, everything else to `media/attachments/files/`.

Audio extensions: `.mp3 .wav .webm .ogg`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Integer | auto | Pk |
| `report` | FK → Report | yes | Cascade delete |
| `audio_recording` | FileField | no | Populated for audio |
| `file` | FileField | no | Populated for everything else |

**Note:** Each row has one field populated, never both.

---

## CustomUser

Staff accounts only. Reporters are fully anonymous and have no user record.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Integer | auto | Pk |
| `email` | EmailField | yes | Unique — used as login username |
| `full_name` | CharField(255) | no | Display name |
| `role` | CharField | yes | `Admin` · `Employee` · `Viewer` (default: Viewer) |
| `status` | CharField | yes | `Active` · `Inactive` (default: active) |
| `date_joined` | DateTimeField | auto | Account creation timestamp |
| `is_staff` | Boolean | auto | Django admin access |
| `is_active` | Boolean | auto | Django built-in, separate from `status` |
| `password` | CharField | yes | Hashed — set via welcome email on first login |

`status` and `is_active` serve different purposes. `is_active=False` blocks at the Django auth layer. `status='inactive'` is the application-level check enforced in every view — the clean way to revoke access without deleting the account.

**Roles:**
- `Admin` — full access including user management
- `Employee` — can view, update, and delete reports. Cannot manage users.
- `Viewer` — read-only, sees limited report fields (tracking_code, status, type, date only)

---

## Relationships

```
CustomUser ──(manages)──> Report
Report ──1:N──> CriminalInfo
Report ──1:N──> Attachment
```