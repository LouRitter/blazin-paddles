import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6 py-8 text-center text-gray-400">
        <p>&copy; 2025 Blazing Paddles. All Rights Reserved.</p>
        <div className="mt-4 flex justify-center space-x-4">
          <Link href="/privacy" className="hover:text-lime-400 transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link href="/terms" className="hover:text-lime-400 transition-colors">
            Terms of Service
          </Link>
          <span>&bull;</span>
          <Link href="/contact" className="hover:text-lime-400 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
