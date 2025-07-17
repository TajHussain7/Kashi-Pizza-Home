# Kashi Pizza Home - Invoice Management Dashboard

A modern, responsive React-based invoice management system designed specifically for Kashi Pizza Home restaurant operations.

## Overview

The Kashi Pizza Home Dashboard is a professional invoice management application that streamlines order processing, invoice generation, and sales tracking for restaurant operations. Built with modern web technologies and optimized for both desktop and mobile devices.

## Key Features

### Order Management

- **Menu Item Management**: Add, edit, and organize menu items by categories
- **Real-time Order Processing**: Interactive order creation with live calculations
- **Category Organization**: Dynamic category management (Pizzas, Burgers, Wraps, etc.)

### Invoice Generation

- **Professional Invoices**: Clean, print-ready invoice format
- **PDF Generation**: Download invoices as PDF files
- **Invoice History**: Track and manage all generated invoices
- **Print Optimization**: A4-formatted invoices for professional printing

### Data Management

- **Local Storage**: Client-side data persistence
- **Invoice History**: Complete record of all transactions
- **Export Capabilities**: Save invoices as text files

### User Experience

- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modern UI**: Professional interface with Tailwind CSS
- **Fast Performance**: Optimized React application with code splitting

## Technology Stack

- **Frontend**: React 18 with functional components and hooks
- **Build System**: Webpack 5 with optimization
- **Styling**: Tailwind CSS 3.0 for modern, responsive design
- **PDF Generation**: jsPDF, html2canvas, html2pdf.js, pdf-lib
- **Data Storage**: Browser localStorage for client-side persistence
- **Deployment**: Vercel-optimized static build

## Project Structure

```
Fast Food Dashboard/
├── src/
│   ├── components/
│   │   ├── InvoiceGenerator.jsx    # Main order processing component
│   │   ├── InvoicePreview.jsx      # Invoice display and preview
│   │   ├── InvoiceHistory.jsx      # Transaction history management
│   │   ├── ItemManagement.jsx      # Menu item CRUD operations
│   │   ├── PDFManager.jsx          # PDF generation utilities
│   │   └── Footer.jsx              # Application footer
│   ├── styles/
│   │   └── index.css               # Global styles and Tailwind
│   ├── utils/
│   │   ├── pdfUtils.js             # PDF generation functions
│   │   └── localStorageUtils.js    # Data persistence utilities
│   ├── App.jsx                     # Main application component
│   └── index.js                    # Application entry point
├── public/
│   ├── Logo.png                    # Restaurant logo
│   └── index.html                  # HTML template
├── webpack.config.js               # Build configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── package.json                    # Dependencies and scripts
└── vercel.json                     # Deployment configuration
```

## Installation & Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/TajHussain7/Kashi-Pizza-Home.git
   cd "Fast Food Dashboard"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment (optional)**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration if needed
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

The application uses minimal configuration. Copy `.env.example` to `.env` and adjust as needed:

```env
PORT=3000
NODE_ENV=development
DEBUG=true
```

### Security Considerations

- No sensitive data is stored in the repository
- All environment files are excluded from version control
- Client-side storage only - no server-side data exposure
- No external API keys or secrets required for basic functionality

## Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**

   - Link your GitHub repository to Vercel
   - Configure build settings (automatically detected)

2. **Build Configuration**

   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node.js Version: 18.x

3. **Environment Variables**
   - Configure any needed variables in Vercel dashboard
   - No sensitive variables required for basic functionality

### Manual Deployment

```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## Usage

1. **Add Menu Items**: Use the Item Management section to add your menu items
2. **Create Categories**: Organize items into categories (Pizzas, Burgers, etc.)
3. **Process Orders**: Select items and quantities for customer orders
4. **Generate Invoices**: Create professional invoices with customer details
5. **Print/Export**: Print invoices or save as PDF files
6. **Track History**: View and manage all previous invoices

## Performance

- **Bundle Size**: Optimized to ~120KB main bundle
- **Code Splitting**: Vendor libraries separated for efficient caching
- **Responsive**: Fast loading on all device types
- **Browser Support**: Modern browsers (Chrome 80+, Firefox 75+, Safari 13+)

## Security & Privacy

- **Data Storage**: All data stored locally in browser
- **No Server Dependency**: No external data transmission
- **Privacy Compliant**: No user tracking or data collection
- **Secure Build**: No sensitive information in production build

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make your changes with proper commit messages
4. Push to your branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## Support

For technical support or business inquiries:

- **Developer**: Tajamal Hussain
- **Contact**: +92-343-8002540
- **WhatsApp**: [Message on WhatsApp](https://wa.me/+923438002540)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Kashi Pizza Home** - Professional Invoice Management System
