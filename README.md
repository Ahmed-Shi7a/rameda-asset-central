# Asset Central

Please implement the following updates across the entire application (Add Asset Modal, Asset Details Modal, Location Filters, and Reports Export):

1. Standardize and Update Locations List:

- Update the Location dropdown list (used across the "Add Asset" modal, filter bars, and tables) to only include HQ and the regional Scientific Offices (with their standard abbreviations):

  * "HQ (Headquarters)"

  * "Alexandria Scientific Office (ALX-SO)"

  * "Mansoura Scientific Office (MNS-SO)"

  * "Tanta Scientific Office (TNT-SO)"

  * "Zagazig Scientific Office (ZGZ-SO)"

  * "Assiut Scientific Office (AST-SO)"

  * "Sohag Scientific Office (SHG-SO)"

  * "Aswan Scientific Office (ASW-SO)"

  * "Luxor Scientific Office (LXR-SO)"

  * "Port Said Scientific Office (PSD-SO)"

  * "Suez Scientific Office (SUZ-SO)"

  * "Ismailia Scientific Office (ISM-SO)"

  * "Cairo & Giza Scientific Office (CGO-SO)"

- Update existing mock data and chart distributions to match these new location names.

2. Dynamic "Device Type" Fields in "Add Asset" Modal:

- Remove "Mobile" completely from the Device Type dropdown.

- Add an "Other" option (for peripherals like mouse, keyboard, dock, adapters).

- Conditional rendering for hardware specs:

  * "Laptop" / "Desktop": Show PC specs (Processor, RAM, Hard Disk Type, Storage Capacity).

  * "Tablet": Show "IMEI", "Screen Size", "RAM", and "Storage".

  * "Printer": Show "Printer Type" (Laser / Inkjet / Thermal / Multifunction), "Print Output" (Color / Monochrome), and "IP Address".

  * "Scanner": Show "Scan Resolution" and "Interface / Connection Type" (USB / Network).

  * "Network Device": Show "Network Category" (Switch / Router / Access Point / Firewall), "Port Count" (e.g., 24-Port, 48-Port), and "IP / MAC Address".

  * "Server": Show "Processor / Cores", "RAM", "RAID Configuration", "Form Factor" (Rackmount / Tower), and "Operating System".

  * "Other": Hide all technical hardware specs and show a dedicated "Description / Notes" multiline text area.

- Universal fields: Asset Name, Brand, Serial Number, Status, Location, Assigned Employee, Supplier, Delivery Date, Manufacturing Date, Warranty Period.

3. Dynamic Warranty Calculation in "Asset Details" Modal:

- In the "Asset View / Details" modal, enhance the "Warranty" section:

  * Compute the warranty expiry date based on Delivery/Manufacturing Date + Warranty Period.

  * Show a dynamic status badge:

    - Active: (e.g., "Active · 142 days remaining" or "Active · 5 months left") in a green badge.

    - Expired: (e.g., "Expired · 45 days ago") in a red/muted badge.

4. Status Filter Dropdown in Reports Export (PDF / Excel):

- On `/reports`, add a Status Filter dropdown directly beside the "Export PDF" and "Export Excel" buttons with the following options:

  * "All Statuses"

  * "Active"

  * "Stock"

  * "Under Maintenance"

  * "Scrapped"

- When exporting to PDF or Excel, filter the exported dataset according to the selected status.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://equip-finder-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0d578971-f068-49bd-b5fc-df84aa85784e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
