'use client'

export default function Footer() {
  return (
    <footer className="bg-[#00a6ff] mt-16">
      <div className="max-w-7xl mx-auto px-10 lg:px-4 py-12">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-4 gap-8">
            {/* Logo Column */}
            <div className="col-span-1">
              <img
                src="fun88-white.svg"
                alt="FUN88"
                className="h-8 w-auto mb-6"
              />
              <p className="text-white text-sm leading-relaxed">
                Experience the ultimate gaming platform with FUN88. Play
                responsibly and enjoy premium entertainment.
              </p>
            </div>

            {/* About & Info */}
            <div className="col-span-1">
              <h3 className="text-gray-200 font-semibold text-lg mb-4">
                About
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    About FUN88
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    FUN88 FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    Contact FUN88
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="col-span-1">
              <h3 className="text-gray-200 font-semibold text-lg mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    Responsible Gaming
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    Security & AML Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-span-1">
              <h3 className="text-gray-200 font-semibold text-lg mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    FUN88 Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    FUN88 Affiliate Program
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
              src="fun88-white.svg"
              alt="FUN88"
              className="h-8 w-auto mx-auto mb-4"
            />
            <p className="text-white text-sm px-4">
              Experience the ultimate gaming platform with FUN88.
            </p>
          </div>

          {/* Mobile Links Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-200 font-semibold mb-3">About</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-white hover:text-gray-200 transition-colors text-sm"
                    >
                      About FUN88
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white hover:text-gray-200 transition-colors text-sm"
                    >
                      FUN88 FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white hover:text-gray-200 transition-colors text-sm"
                    >
                      Contact FUN88
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-gray-200 font-semibold mb-3">Support</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-white hover:text-gray-200 transition-colors text-sm"
                    >
                      FUN88 Support
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white hover:text-gray-200 transition-colors text-sm"
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
                <h4 className="text-gray-200 font-semibold mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-white hover:text-gray-200 transition-colors text-sm"
                    >
                      Terms & Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white hover:text-gray-200 transition-colors text-sm"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white hover:text-gray-200 transition-colors text-sm"
                    >
                      Responsible Gaming
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white hover:text-gray-200 transition-colors text-sm"
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
        <div className="border-t border-blue-300 pt-6 mt-8">
          <div className="text-center">
            <p className="text-white text-sm">
              Copyright © 2025 FUN88. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
