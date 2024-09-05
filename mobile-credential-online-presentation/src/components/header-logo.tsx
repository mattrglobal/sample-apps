"use client";
import Link from "next/link";

export function MATTRLogo() {
  return (
    <div className={"flex items-center justify-center"}>
      <Link href="https://learn.mattr.global" target="_blank" aria-label={"MATTR"} className={"rounded-none"}>
        <div className="w-24 text-[#333132]">
          <svg viewBox="0 0 516 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>MATTR Logo</title>
            <path
              d="M46.18 45.99L0 0V99.95V100H18.92V45.55L46.18 72.7L73.43 45.55V100H92.35V99.95V0L46.18 45.99Z"
              fill="url(#paint0_radial)"
            />
            <path
              d="M144.34 100L170.51 44.89L195.58 100H216.36L170.87 0L123.41 100H144.34Z"
              fill="url(#paint1_radial)"
            />
            <path
              d="M261.47 100H280.38V18.91H306.2V0H235.65V18.91H261.47V100Z"
              fill="url(#paint2_radial)"
            />
            <path
              d="M341.3 0H411.86V18.91H386.04V100H367.13V18.91H341.3V0Z"
              fill="url(#paint3_radial)"
            />
            <path
              d="M515.48 100L492 59.41C495.721 56.3227 498.723 52.4598 500.796 48.0916C502.868 43.7233 503.962 38.9549 504 34.12C504 15.31 487.8 0 467.89 0H451.33V18.91H467.86C468.45 18.91 469.04 18.91 469.62 18.99C478.28 19.77 485.06 26.26 485.06 34.12C485.06 41.98 478.28 48.47 469.62 49.25C469.035 49.3068 468.448 49.3335 467.86 49.33H461.58V68.24H467.86C470.209 68.2373 472.552 68.0164 474.86 67.58L493.62 100H515.48Z"
              fill="url(#paint4_radial)"
            />
            <defs>
              <radialGradient
                id="paint0_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(95.7432 100.979) scale(136.277)"
              >
                <stop stopColor="currentColor" stopOpacity="0" />
                <stop offset="0.6" stopColor="currentColor" />
              </radialGradient>
              <radialGradient
                id="paint1_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(163.214 55.0703) scale(91.2847)"
              >
                <stop offset="0.4" stopColor="currentColor" />
                <stop offset="0.8" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>
              <radialGradient
                id="paint2_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(248.024 54.6301) scale(106.571)"
              >
                <stop offset="0.3" stopColor="currentColor" />
                <stop offset="0.7" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>
              <radialGradient
                id="paint3_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(408.228 -10.4201) scale(168.98)"
              >
                <stop offset="0.4" stopColor="currentColor" />
                <stop offset="0.9" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>
              <radialGradient
                id="paint4_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(445.035 -0.181905) scale(121.211)"
              >
                <stop offset="0.1" stopColor="currentColor" stopOpacity="0" />
                <stop offset="0.7" stopColor="currentColor" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </Link>
    </div>
  );
}

export function GitHubLogo() {
  return (
      <Link href="https://github.com/mattrglobal/sample-apps" target="_blank" aria-label={"MATTR"} className={"rounded-none"}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <title>som</title>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
    </Link>
  );
}
