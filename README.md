# RAMEDA — IT Asset Central & Barcode Portal

Enterprise-grade IT Asset Management system engineered specifically for **RAMEDA Pharmaceuticals IT Department**. The platform handles full-lifecycle hardware tracking, regional scientific office inventory control, maintenance ticketing, and standard RMD barcode label generation.

---

## Core System Specifications

### 1. Standardized Locations List
The system strictly operates across HQ and regional scientific offices:
- **HQ (Headquarters)**
- **Alexandria Scientific Office (ALX-SO)**
- **Mansoura Scientific Office (MNS-SO)**
- **Tanta Scientific Office (TNT-SO)**
- **Zagazig Scientific Office (ZGZ-SO)**
- **Assiut Scientific Office (AST-SO)**
- **Sohag Scientific Office (SHG-SO)**
- **Aswan Scientific Office (ASW-SO)**
- **Luxor Scientific Office (LXR-SO)**
- **Port Said Scientific Office (PSD-SO)**
- **Suez Scientific Office (SUZ-SO)**
- **Ismailia Scientific Office (ISM-SO)**
- **Cairo & Giza Scientific Office (CGO-SO)**

### 2. Dynamic Hardware Specifications Form
Dynamic conditional fields mapped directly to device category:
- **Laptop / Desktop**: Processor, RAM, Hard Disk Type, Storage Capacity.
- **Tablet**: IMEI, Screen Size, RAM, Storage.
- **Printer**: Printer Type (Laser / Inkjet / Thermal / Multifunction), Print Output (Color / Monochrome), IP Address.
- **Scanner**: Scan Resolution, Connection Type (USB / Network).
- **Network Device**: Network Category (Switch / Router / Access Point / Firewall), Port Count, IP / MAC Address.
- **Server**: Processor / Cores, RAM, RAID Configuration, Form Factor (Rackmount / Tower), Operating System.
- **Other**: Dedicated Description & Notes field for IT accessories (Mice, Keyboards, Docks, Adapters).

### 3. Smart Warranty Monitoring
- Real-time dynamic computation based on Delivery / Manufacturing Date + Warranty Period.
- Dynamic health badges:
  - `Active · X days / months remaining` (Emerald indicator)
  - `Expired · X days ago` (Muted red indicator)

### 4. Enterprise Reporting & Exports
- Dedicated Status filtering (`All Statuses`, `Active`, `Stock`, `Under Maintenance`, `Scrapped`).
- Clean tabular export to **PDF** and **Excel** formats strictly adhering to corporate IT audit standards.

---

## Tech Stack
- **Framework**: React 19 + TanStack Router (Start)
- **Styling**: Tailwind CSS v4 + Radix UI + Sonner
- **State & Data**: TanStack Query + Context API
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites
- Node.js (v20 or newer recommended)
- npm

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build