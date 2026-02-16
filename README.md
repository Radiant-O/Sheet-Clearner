# 📊 Sheet Cleaner

> A fast, privacy-first web application for cleaning and extracting data from spreadsheets — entirely in your browser.

![Sheet Cleaner](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8)
![Vite](https://img.shields.io/badge/Vite-7-646cff)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **📁 File Upload** | Drag-and-drop or click-to-browse — supports CSV, XLSX, XLS, and TSV files up to 50MB |
| **📑 Sheet Selection** | Automatically detects multi-sheet Excel files and lets you choose which sheet to process |
| **🔍 Auto-Detection** | Intelligently identifies email, phone, name, and domain columns by analyzing header patterns |
| **🗺️ Column Mapping** | Manually override any auto-detected column mapping via intuitive dropdowns |
| **👀 Data Preview** | View the first 100 rows in a rich, scrollable table with statistics |
| **📤 Extract Mode** | Extract selected columns and download as CSV or TXT |
| **🧹 Clean Mode** | Remove rows with missing email/phone data using configurable rules |
| **💾 Format Preservation** | Download cleaned data in original format (XLSX) or CSV |
| **🔒 Privacy First** | All processing happens client-side — your data never leaves your browser |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sheet-cleaner.git
cd sheet-cleaner

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory as a single HTML file (powered by `vite-plugin-singlefile`).

### Preview Production Build

```bash
npm run preview
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev) | 19 | UI framework |
| [Vite](https://vite.dev) | 7 | Build tool & dev server |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4.1 | Utility-first styling |
| [SheetJS (xlsx)](https://sheetjs.com) | 0.18 | Excel file parsing & generation |
| [PapaParse](https://www.papaparse.com) | 5.5 | CSV parsing & generation |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | — | Conditional class utilities |

---

## 📁 Project Structure

```
sheet-cleaner/
├── public/                      # Static assets
├── src/
│   ├── components/              # React UI components
│   │   ├── CleanPanel.tsx       #   Clean mode interface
│   │   ├── ColumnMapper.tsx     #   Column mapping controls
│   │   ├── DataPreview.tsx      #   Data table + statistics
│   │   ├── ExtractPanel.tsx     #   Extract mode interface
│   │   ├── FileDropzone.tsx     #   Drag-and-drop file upload
│   │   ├── FileInfoCard.tsx     #   File metadata display
│   │   ├── SheetSelectorModal.tsx #  Multi-sheet picker modal
│   │   └── ToastContainer.tsx   #   Toast notification system
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useColumnDetector.ts #   Auto-detect column types
│   │   ├── useFileExporter.ts   #   Export & download files
│   │   ├── useFileParser.ts     #   Parse CSV/Excel files
│   │   └── useToast.ts          #   Toast notification state
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   │
│   ├── utils/
│   │   ├── cn.ts                # className merge utility
│   │   ├── constants.ts         # App-wide constants
│   │   └── helpers.ts           # Helper functions
│   │
│   ├── App.tsx                  # Root application component
│   ├── index.css                # Global styles & Tailwind config
│   └── main.tsx                 # Application entry point
│
├── index.html                   # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎯 User Flow

```
┌──────────────────┐
│  Upload File     │  Drag-drop or click to browse
│  (.csv .xlsx     │  Validates type & size (max 50MB)
│   .xls .tsv)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Sheet Selection │  Only for multi-sheet Excel files
│  (if applicable) │  Auto-selects if single sheet
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Auto-Detect     │  Scans headers for email, phone,
│  Column Mapping  │  name, and domain patterns
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Preview Data    │  View first 100 rows + statistics
│  Adjust Mapping  │  Override auto-detected columns
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│EXTRACT │ │ CLEAN  │
│ Mode   │ │ Mode   │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌──────────────────┐
│  Download File   │  CSV, TXT, or original XLSX format
└──────────────────┘
```

---

## 📋 Feature Details

### File Upload

- **Accepted formats**: `.csv`, `.xlsx`, `.xls`, `.tsv`
- **Max file size**: 50MB (52,428,800 bytes)
- **Validation**: File type, size, and empty file checks
- **UX**: Drag-over visual feedback, keyboard accessible

### Column Auto-Detection

The app scans column headers using pattern matching:

| Column Type | Detected Patterns |
|-------------|-------------------|
| **Email** | `email`, `e-mail`, `mail`, `email_address`, `emailaddress`, and partial matches containing "email" |
| **Phone** | `phone`, `telephone`, `mobile`, `cell`, `tel`, `phone_number`, and partial matches containing "phone" or "mobile" |
| **Name** | `name`, `full_name`, `fullname`, `contact_name`, `first_name`, `last_name` (excludes `filename`, `username`) |
| **Domain** | `domain`, `website`, `url`, `web`, `site`, `company_domain`, and partial matches |

- Case-insensitive matching
- Exact matches take priority over partial matches
- Each column can only be mapped to one type

### Extract Mode

Extract specific columns into a new file:

| Format | Behavior |
|--------|----------|
| **CSV** | Standard comma-separated values with headers |
| **TXT** (single column) | One value per line, no header |
| **TXT** (multiple columns) | Tab-separated values with headers |

### Clean Mode

Remove rows based on data completeness rules:

| Rule | Keeps Row If... |
|------|-----------------|
| **Require Email** | Email column has a non-empty value |
| **Require Phone** | Phone column has a non-empty value |
| **Require Both** | Both email AND phone have non-empty values |
| **Require Either** | At least one of email OR phone has a non-empty value |

**Empty value detection** — these are all treated as empty:

- `null`, `undefined`, empty string `""`
- Whitespace-only strings
- Literal strings: `"null"`, `"NULL"`, `"undefined"`, `"N/A"`, `"n/a"`, `"NA"`, `"-"`, `"#N/A"`

### Output Formats

| Input Format | Available Output Formats |
|--------------|-------------------------|
| CSV | CSV (default) |
| XLSX | XLSX (original) or CSV |
| XLS | XLSX (upgraded) or CSV |
| TSV | CSV |

---

## 🔒 Privacy & Security

- **🖥️ 100% Client-Side Processing** — All file parsing, column detection, data cleaning, and export generation happens entirely in your browser using JavaScript
- **🚫 No Server Upload** — Your files are never sent to any server
- **🚫 No Data Storage** — No databases, no logging of file contents, no cookies tracking your data
- **🚫 No External Requests** — The app makes zero network requests during processing
- **♻️ Memory Cleanup** — File data is released from memory when you upload a new file or reset

---

## ⚡ Performance

- **Preview limit**: Only the first 100 rows are rendered in the preview table to keep the UI responsive
- **Efficient parsing**: SheetJS and PapaParse are industry-standard libraries optimized for large files
- **Single-file build**: Production build is bundled as a single HTML file for instant loading
- **Lazy processing**: Statistics and clean previews are computed with `useMemo` to avoid unnecessary recalculations

---

## 🧪 Testing Checklist

### File Upload

- [ ] Valid CSV upload and parse
- [ ] Valid XLSX upload and parse
- [ ] Valid XLS upload and parse
- [ ] Drag-and-drop upload
- [ ] Click-to-browse upload
- [ ] Reject invalid file types (e.g., PDF)
- [ ] Reject oversized files (> 50MB)
- [ ] Reject empty files

### Sheet Selection

- [ ] Single-sheet Excel auto-selects
- [ ] Multi-sheet Excel shows selector modal
- [ ] Selecting a sheet parses correctly
- [ ] Canceling returns to upload

### Column Detection

- [ ] Email column auto-detected
- [ ] Phone column auto-detected
- [ ] Name column auto-detected
- [ ] Domain column auto-detected
- [ ] Manual mapping override works
- [ ] Duplicate column prevention works

### Extract

- [ ] Extract single column as CSV
- [ ] Extract single column as TXT
- [ ] Extract multiple columns as CSV
- [ ] Extract multiple columns as TXT
- [ ] Disabled for unmapped columns
- [ ] Download triggers correctly

### Clean

- [ ] "Require Email" rule works
- [ ] "Require Phone" rule works
- [ ] "Require Both" rule works
- [ ] "Require Either" rule works
- [ ] Row count preview is accurate
- [ ] Download as CSV works
- [ ] Download as original format works

### Edge Cases

- [ ] File with only headers (no data rows)
- [ ] Unicode / international characters
- [ ] Whitespace-only cells treated as empty
- [ ] "N/A" and "null" strings treated as empty
- [ ] Large files (10,000+ rows)
- [ ] Files with 50+ columns

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |

---

## 🏗️ Architecture Decisions

### Why React + Vite (instead of Nuxt 3)?

While the original specification called for Nuxt 3, this implementation uses React + Vite because:

- **Simpler deployment** — Single HTML file output, no server needed
- **Full client-side processing** — No API routes required since all processing is in-browser
- **Faster builds** — Vite's React plugin offers near-instant HMR
- **Broader ecosystem** — Wider availability of React hooks and patterns

### Why Client-Side Only?

- **Privacy** — User data never leaves the browser
- **Performance** — No network latency for processing
- **Simplicity** — No server infrastructure to maintain
- **Cost** — Zero hosting costs for compute

### Why SheetJS + PapaParse?

- **SheetJS** is the industry standard for Excel manipulation in JavaScript
- **PapaParse** is the fastest and most reliable CSV parser available
- Together they cover all spreadsheet formats with edge-case handling

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [SheetJS](https://sheetjs.com) for robust spreadsheet parsing
- [PapaParse](https://www.papaparse.com) for lightning-fast CSV processing
- [Tailwind CSS](https://tailwindcss.com) for the utility-first styling approach
- [Vite](https://vite.dev) for the blazing-fast build tooling

---

<p align="center">
  <strong>Sheet Cleaner v1.0.0</strong><br>
  <em>Your data stays yours. Always.</em>
</p>
