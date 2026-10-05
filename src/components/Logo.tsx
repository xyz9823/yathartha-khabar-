import React, { useState, useEffect } from 'react';

interface LogoProps {
  variant?: 'sm' | 'md' | 'lg' | 'footer';
  className?: string;
  customLogoUrl?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'md',
  className = '',
  customLogoUrl,
  onClick
}) => {
  // Check for uploaded logo image file
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // 1. Check custom uploaded URL (e.g. from Admin settings / localStorage)
    if (customLogoUrl) {
      setLogoSrc(customLogoUrl);
      setImgError(false);
      return;
    }

    const savedLogo = localStorage.getItem('yathartha_khabar_logo');
    if (savedLogo) {
      setLogoSrc(savedLogo);
      setImgError(false);
      return;
    }

    // Default to standard uploaded filename if placed in public folder
    setLogoSrc('/logo.png');
  }, [customLogoUrl]);

  // Size constraints for keeping original proportions intact without distortion
  const sizeClasses = {
    sm: 'h-8 max-w-[180px]',
    md: 'h-11 max-w-[240px]',
    lg: 'h-16 max-w-[340px]',
    footer: 'h-12 max-w-[260px]'
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl tracking-tight',
    footer: 'text-2xl'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {logoSrc && !imgError ? (
        <img
          src={logoSrc}
          alt="Yathartha Khabar Logo"
          onError={() => setImgError(true)}
          className={`${sizeClasses[variant]} w-auto object-contain transition-transform duration-200 hover:scale-[1.01]`}
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        /* Fallback authentic typographic masthead until user uploads their logo */
        <div className="flex flex-col items-start leading-none group">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" title="Live Newsroom" />
            <h1 className={`font-serif font-black tracking-tight text-slate-900 ${textClasses[variant]}`}>
              Yathartha Khabar
            </h1>
          </div>
          <span className="text-[10px] font-nepali tracking-widest text-slate-500 font-semibold uppercase mt-0.5 pl-4">
            यथार्थ खबर · निष्पक्ष र द्रुत डिजिटल समाचार
          </span>
        </div>
      )}
    </div>
  );
};
