import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-yellow-800 to-red-800 text-white text-center p-4 mt-8">
      <p>© 2025 Kashi Pizza Home. All rights reserved.</p>
      <p>
        Developed by{" "}
        <a
          href="https://wa.me/+923438002540"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-200 hover:text-yellow-100 underline transition-colors"
        >
          Tajamal Hussain
        </a>
      </p>
    </footer>
  );
}
