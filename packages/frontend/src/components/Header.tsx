'use client'

import { useAuth } from '@/hooks/use-auth'
import { useAuthModalEvents } from '@/lib/auth-events'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { HiHeart, HiHome, HiShieldCheck, HiClipboardDocumentList, HiBuildingOffice2, HiArrowRightOnRectangle, HiBars3, HiXMark, HiUser } from 'react-icons/hi2'
import AuthModal from './AuthModal'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { user, logout } = useAuth()
  const t = useTranslations('Header')
  const locale = useLocale()

  useEffect(() => {
    setMounted(true)
  }, [])

  useAuthModalEvents((modalType) => {
    setAuthMode(modalType)
    setAuthModalOpen(true)
  })

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    document.body.classList.remove('overflow-hidden')
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
    document.body.classList.toggle('overflow-hidden')
  }

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-[60] mb-2 sm:mb-3 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">

            {/* Left: Brand Logo & Main Nav */}
            <div className="flex items-center gap-8">
              <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl text-blue-600 tracking-tight">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <HiHome className="w-5 h-5" />
                </div>
                <span>Nestora</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                  PGFinder
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
                <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">
                  Find PGs
                </Link>
                {mounted && user?.role === 'STUDENT' && (
                  <>
                    <Link href={`/${locale}/favorite`} className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <HiHeart className="w-4 h-4 text-rose-500" />
                      Saved PGs
                    </Link>
                    <Link href={`/${locale}/student/inquiries`} className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <HiClipboardDocumentList className="w-4 h-4 text-blue-600" />
                      My Inquiries
                    </Link>
                  </>
                )}
                {mounted && user?.role === 'OWNER' && (
                  <Link href={`/${locale}/owner/dashboard`} className="hover:text-blue-600 transition-colors flex items-center gap-1.5 font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    <HiBuildingOffice2 className="w-4 h-4 text-blue-600" />
                    Owner Dashboard
                  </Link>
                )}
                {mounted && user?.role === 'ADMIN' && (
                  <Link href={`/${locale}/admin`} className="hover:text-amber-600 transition-colors flex items-center gap-1.5 font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <HiShieldCheck className="w-4 h-4 text-amber-600" />
                    Admin Panel
                  </Link>
                )}
              </nav>
            </div>

            {/* Right: Language & Auth Controls */}
            <div className="hidden md:flex items-center gap-3" suppressHydrationWarning>
              <LanguageSwitcher />

              {!mounted ? null : !user ? (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all hover:shadow-md"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 transition-all bg-white shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">{user.name}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                      user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : user.role === 'OWNER' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {user.role}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-[9999]">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Role: {user.role}
                        </span>
                      </div>

                      {user.role === 'STUDENT' && (
                        <>
                          <Link
                            href={`/${locale}/favorite`}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <HiHeart className="mr-2 h-4 w-4 text-rose-500" />
                            Saved PGs
                          </Link>
                          <Link
                            href={`/${locale}/student/inquiries`}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <HiClipboardDocumentList className="mr-2 h-4 w-4 text-blue-600" />
                            My Inquiries
                          </Link>
                        </>
                      )}

                      {user.role === 'OWNER' && (
                        <Link
                          href={`/${locale}/owner/dashboard`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <HiBuildingOffice2 className="mr-2 h-4 w-4 text-blue-600" />
                          Owner Dashboard
                        </Link>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          href={`/${locale}/admin`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-50 font-medium"
                        >
                          <HiShieldCheck className="mr-2 h-4 w-4 text-amber-600" />
                          Admin Overview
                        </Link>
                      )}

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                      >
                        <HiArrowRightOnRectangle className="mr-2 h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="flex items-center md:hidden gap-2">
              <LanguageSwitcher />
              <button
                onClick={toggleDrawer}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                aria-label="Toggle Menu"
              >
                <HiBars3 className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={closeDrawer}></div>
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <Link href="/" onClick={closeDrawer} className="font-bold text-lg text-blue-600 flex items-center gap-2">
                <HiHome className="w-5 h-5" /> Nestora PGFinder
              </Link>
              <button onClick={closeDrawer} className="p-1 rounded-md text-slate-500 hover:bg-slate-100">
                <HiXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <Link href={`/${locale}`} onClick={closeDrawer} className="block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-slate-100">
                Find PGs
              </Link>

              {mounted && user?.role === 'STUDENT' && (
                <>
                  <Link href={`/${locale}/favorite`} onClick={closeDrawer} className="block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-slate-100">
                    Saved PGs
                  </Link>
                  <Link href={`/${locale}/student/inquiries`} onClick={closeDrawer} className="block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-slate-100">
                    My Inquiries
                  </Link>
                </>
              )}

              {mounted && user?.role === 'OWNER' && (
                <Link href={`/${locale}/owner/dashboard`} onClick={closeDrawer} className="block px-3 py-2 rounded-lg font-semibold text-blue-700 bg-blue-50 border border-blue-200">
                  Owner Dashboard
                </Link>
              )}

              {mounted && user?.role === 'ADMIN' && (
                <Link href={`/${locale}/admin`} onClick={closeDrawer} className="block px-3 py-2 rounded-lg font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                  Admin Panel
                </Link>
              )}

              <div className="border-t border-slate-200 my-2"></div>

              {!mounted ? null : !user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => { openAuthModal('login'); closeDrawer(); }}
                    className="w-full py-2.5 text-center font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { openAuthModal('signup'); closeDrawer(); }}
                    className="w-full py-2.5 text-center font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => { handleLogout(); closeDrawer(); }}
                    className="w-full py-2.5 text-center font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  )
}
