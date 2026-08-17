'use client';

import { LOCALE } from '@qrent/shared/enum';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { HiGlobeAlt } from 'react-icons/hi';

export default function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLanguage = (newLocale: LOCALE) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getLocaleLabel = (l: string) => {
    switch (l) {
      case LOCALE.HI:
        return t('hindi');
      case LOCALE.TE:
        return t('telugu');
      case LOCALE.KN:
        return t('kannada');
      case LOCALE.EN:
      default:
        return t('english');
    }
  };

  const languages = [
    { code: LOCALE.EN, label: t('english') },
    { code: LOCALE.HI, label: t('hindi') },
    { code: LOCALE.TE, label: t('telugu') },
    { code: LOCALE.KN, label: t('kannada') },
  ];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
        aria-label="Switch language"
        suppressHydrationWarning
      >
        <HiGlobeAlt className="h-4 w-4" />
        <span className="hidden sm:inline" suppressHydrationWarning>
          {mounted ? getLocaleLabel(locale) : 'English'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-[9999]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                locale === lang.code ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
