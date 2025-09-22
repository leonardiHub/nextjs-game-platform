'use client'

export default function Footer() {
  return (
    <footer className="bg-[#212121] border-t border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-10 lg:px-4 py-12">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-4 gap-8">
            {/* Logo Column */}
            <div className="col-span-1">
              <img
                src="pg-slot-logo.webp"
                alt="PG Slot"
                className="h-16 w-auto mb-6"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                Experience the ultimate gaming platform with PG Slot. Play
                responsibly and enjoy premium entertainment.
              </p>
            </div>

            {/* About & Info */}
            <div className="col-span-1">
              <h3 className="text-[#C29331] font-semibold text-lg mb-4">
                About
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                  >
                    About PG Slot
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                  >
                    PG Slot FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                  >
                    Contact PG Slot
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="col-span-1">
              <h3 className="text-[#C29331] font-semibold text-lg mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                  >
                    Responsible Gaming
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                  >
                    Security & AML Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-span-1">
              <h3 className="text-[#C29331] font-semibold text-lg mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                  >
                    PG Slot Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                  >
                    PG Slot Affiliate Program
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="pg-slot-logo.webp"
              alt="PG Slot"
              className="h-12 w-auto mx-auto mb-4"
            />
            <p className="text-gray-400 text-sm px-4">
              Experience the ultimate gaming platform with PG Slot.
            </p>
          </div>

          {/* Mobile Links Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[#C29331] font-semibold mb-3">About</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                    >
                      About PG Slot
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                    >
                      PG Slot FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                    >
                      Contact PG Slot
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[#C29331] font-semibold mb-3">Support</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                    >
                      PG Slot Support
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                    >
                      Affiliate Program
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[#C29331] font-semibold mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                    >
                      Terms & Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                    >
                      Responsible Gaming
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#C29331] transition-colors text-sm"
                    >
                      Security & AML Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-700 pt-6 mt-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Copyright © 2025 PG Slot. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

