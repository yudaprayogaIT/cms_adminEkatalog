'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import {
  AccountBalanceWallet,
  Apartment,
  AutoAwesomeMosaicRounded,
  CardGiftcard,
  ChatOutlined,
  Favorite,
  Group,
  Groups,
  HomeWork,
  InventoryOutlined,
  ListAltOutlined,
  Paid,
  Person,
  ShoppingBagOutlined,
} from '@mui/icons-material';

type MenuItem = { label: string; href: string; icon: React.ReactNode | string };

const MAIN_MENU: MenuItem[] = [
  { label: 'Dashboard', href: '/', icon: <HomeIcon /> },
  { label: 'Favorites', href: '/favorites', icon: <Favorite /> },
  { label: 'Inbox', href: '/inbox', icon: <ChatOutlined /> },
  { label: 'Order Lists', href: '/orders', icon: <ListAltOutlined /> },
  { label: 'Product Stock', href: '/stock', icon: <InventoryOutlined /> },
];

const SECONDARY_MENU: MenuItem[] = [
  { label: 'Users', href: '/users', icon: <Person /> },
  { label: 'Branches', href: '/branches', icon: <Apartment /> },
  { label: 'To-Do', href: '/todo', icon: <ListAltOutlined /> },
];

const CATALOG_SUBMENU: MenuItem[] = [
  { label: 'Items', href: '/items', icon: <ShoppingBagOutlined /> },
  { label: 'Products', href: '/products', icon: <ShoppingBagOutlined /> },
  { label: 'Categories', href: '/categories', icon: <AutoAwesomeMosaicRounded /> },
];

const CUSTOMER_SUBMENU: MenuItem[] = [
  { label: 'Member', href: '/members', icon: <AccountBalanceWallet /> },
  { label: 'Group', href: '/customerGroups', icon: <HomeWork /> },
  // { label: 'Company', href: '/companies', icon: <AutoAwesomeMosaicRounded /> },
];

export default function Sidebar() {
  const pathname = usePathname() || '/';
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [catalogOpen, setCatalogOpen] = useState<boolean>(false);
  const [customerOpen, setCustomerOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const collapsedWidth = 80;
  const expandedWidth = 180;

  // read persisted collapse preference once on mount (desktop preference)
  useEffect(() => {
    try {
      const v = localStorage.getItem('sidebar-collapsed');
      setCollapsed(v === '1');
    } catch {
      // ignore
    }
  }, []);

  // persist collapse preference (only meaningful for desktop)
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  // detect mobile breakpoints
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // auto-open catalog if current route is inside products/categories
  useEffect(() => {
    if (pathname.startsWith('/products') || pathname.startsWith('/categories') || pathname.startsWith('/items')) {
      setCatalogOpen(true);
    }
  }, [pathname]);

  const isMenuActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Behavior notes:
  // - On desktop (isMobile === false): sidebar is part of layout and width is collapsedWidth or expandedWidth.
  // - On mobile (isMobile === true):
  //    - collapsed === true  => sidebar hidden (off-canvas)
  //    - collapsed === false => sidebar visible as fixed overlay (width = expandedWidth)
  //
  // Provide a floating open button for mobile when sidebar is hidden.

  return (
    <>
      {/* Floating open button for mobile when sidebar is hidden */}
      {isMobile && collapsed && (
        <button
          aria-label="Open sidebar"
          onClick={() => setCollapsed(false)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md border border-gray-200"
          title="Open sidebar"
        >
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B11F23"
            strokeWidth="1.6"
            initial={false}
            animate={{ rotate: 0 }}
          >
            <path d="M8 6l8 6-8 6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
      )}

      {/* Backdrop for mobile when open */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setCollapsed(true)}
          aria-hidden
        />
      )}

      <motion.aside
        aria-label="Sidebar"
        initial={false}
        animate={{
          x: isMobile ? (collapsed ? '-100%' : 0) : 0,
          width: isMobile ? expandedWidth : collapsed ? collapsedWidth : expandedWidth,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        style={{
          minWidth: isMobile ? expandedWidth : collapsed ? collapsedWidth : expandedWidth,
          maxWidth: expandedWidth,
        }}
        className={`h-screen bg-white border-r border-gray-200 flex flex-col ${
          isMobile ? 'fixed top-0 left-0 z-50 shadow-2xl' : ''
        }`}
      >
        {/* top: logo + toggle */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {collapsed && !isMobile ? (
              <div className="w-8 h-8 flex-shrink-0">
                <Image src="/images/logo_etm.png" alt="logo" width={32} height={32} className="object-contain" />
              </div>
            ) : (
              <span className="text-base md:text-lg font-semibold text-gray-800">E-Katalog</span>
            )}
          </div>

          <button
            aria-label={isMobile ? (collapsed ? 'Open sidebar' : 'Close sidebar') : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => {
              // On mobile: toggle between hidden (collapsed=true) and open (collapsed=false)
              // On desktop: same toggle behavior (narrow vs expanded)
              setCollapsed((s) => !s);
            }}
            className="p-1 rounded hover:bg-gray-100"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B11F23"
              strokeWidth="1.6"
              initial={false}
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              {collapsed ? (
                <path d="M8 6l8 6-8 6" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M16 6l-8 6 8 6" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </motion.svg>
          </button>
        </div>

        {/* nav groups */}
        <nav className="flex-1 overflow-y-auto mt-3">
          <ul className="space-y-1 px-2">
            {/* Main menu items */}
            {MAIN_MENU.map((m) => {
              const active = isMenuActive(m.href);
              return (
                <li key={m.href} className="relative">
                  <Link href={m.href} className="no-underline">
                    <div className={`relative`}>
                      <motion.div
                        layout
                        transition={{ duration: 0.18 }}
                        style={{ backgroundColor: active ? '#B11F23' : 'transparent' }}
                        className={`absolute inset-0 rounded-md pointer-events-none`}
                      />
                      <div className={`flex items-center gap-3 rounded-md px-3 py-2 relative z-10 ${collapsed ? 'justify-center' : ''}`}>
                        <div className={`w-5 h-5 2xl:w-6 2xl:h-6 flex items-center justify-center ${active ? 'text-white' : 'text-gray-600'}`}>
                          {typeof m.icon === 'string' ? (
                            <Image src={m.icon} alt={m.label} width={20} height={20} />
                          ) : (
                            m.icon
                          )}
                        </div>
                        {!collapsed && <span className={`truncate text-sm 2xl:text-base ${active ? 'text-white' : 'text-gray-700'}`}>{m.label}</span>}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}

            {/* separator */}
            <div className="border-t border-gray-200 my-3" />

            {/* Catalog parent (dropdown) */}
            <li className="relative">
              {(() => {
                const parentActive = CATALOG_SUBMENU.some((c) => isMenuActive(c.href));
                return (
                  <div className="relative">
                    <button
                      className={`w-full text-left relative`}
                      onClick={() => setCatalogOpen((s) => !s)}
                      aria-expanded={catalogOpen}
                    >
                      <motion.div
                        layout
                        transition={{ duration: 0.18 }}
                        style={{ backgroundColor: parentActive ? '#B11F23' : 'transparent' }}
                        className={`absolute inset-0 rounded-md pointer-events-none`}
                      />
                      <div className={`flex items-center gap-3 rounded-md px-3 py-2 relative z-10 ${collapsed ? 'justify-center' : ''}`}>
                        <div className={`w-5 h-5 2xl:w-6 2xl:h-6 flex items-center justify-center ${parentActive ? 'text-white' : 'text-gray-600'}`}>
                          <CardGiftcard />
                        </div>
                        {!collapsed && <span className={`truncate text-sm 2xl:text-base ${parentActive ? 'text-white' : 'text-gray-700'}`}>Catalog</span>}

                        {/* chevron */}
                        {!collapsed && (
                          <div className="ml-auto">
                            <motion.svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              initial={false}
                              animate={{ rotate: catalogOpen ? 90 : 0 }}
                              transition={{ duration: 0.18 }}
                              className={`${parentActive ? 'text-white' : 'text-gray-400'}`}
                            >
                              <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })()}
              <AnimatePresence initial={false}>
                {catalogOpen && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="pl-2 pr-1 mt-2 overflow-hidden"
                  >
                    {CATALOG_SUBMENU.map((c) => {
                      const active = isMenuActive(c.href);
                      return (
                        <li key={c.href} className="relative">
                          <Link href={c.href} className="no-underline">
                            <div className="relative">
                              <motion.div
                                layout
                                transition={{ duration: 0.18 }}
                                style={{ backgroundColor: active ? '#B11F23' : 'transparent' }}
                                className={`absolute inset-0 rounded-md pointer-events-none`}
                              />
                              <div className={`flex items-center gap-3 rounded-md px-3 py-2 relative z-10 ml-3 ${collapsed ? 'justify-center' : ''}`}>
                                <div className={`w-5 h-5 flex items-center justify-center ${active ? 'text-white' : 'text-gray-600'}`}>
                                  {typeof c.icon === 'string' ? (
                                    <Image src={c.icon} alt={c.label} width={18} height={18} />
                                  ) : (
                                    c.icon
                                  )}
                                </div>
                                {!collapsed && <span className={`truncate text-sm 2xl:text-base ${active ? 'text-white' : 'text-gray-700'}`}>{c.label}</span>}
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>

            {/* separator */}
            <div className="border-t border-gray-200 my-3" />

            {/* Customer parent (dropdown) */}
            <li className="relative">
              {(() => {
                const parentActive = CUSTOMER_SUBMENU.some((c) => isMenuActive(c.href));
                return (
                  <div className="relative">
                    <button
                      className={`w-full text-left relative`}
                      onClick={() => setCustomerOpen((s) => !s)}
                      aria-expanded={customerOpen}
                    >
                      <motion.div
                        layout
                        transition={{ duration: 0.18 }}
                        style={{ backgroundColor: parentActive ? '#B11F23' : 'transparent' }}
                        className={`absolute inset-0 rounded-md pointer-events-none`}
                      />
                      <div className={`flex items-center gap-3 rounded-md px-3 py-2 relative z-10 ${collapsed ? 'justify-center' : ''}`}>
                        <div className={`w-5 h-5 2xl:w-6 2xl:h-6 flex items-center justify-center ${parentActive ? 'text-white' : 'text-gray-600'}`}>
                          <Groups />
                        </div>
                        {!collapsed && <span className={`truncate text-sm 2xl:text-base ${parentActive ? 'text-white' : 'text-gray-700'}`}>Customer</span>}

                        {/* chevron */}
                        {!collapsed && (
                          <div className="ml-auto">
                            <motion.svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              initial={false}
                              animate={{ rotate: catalogOpen ? 90 : 0 }}
                              transition={{ duration: 0.18 }}
                              className={`${parentActive ? 'text-white' : 'text-gray-400'}`}
                            >
                              <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })()}
              <AnimatePresence initial={false}>
                {customerOpen && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="pl-2 pr-1 mt-2 overflow-hidden"
                  >
                    {CUSTOMER_SUBMENU.map((c) => {
                      const active = isMenuActive(c.href);
                      return (
                        <li key={c.href} className="relative">
                          <Link href={c.href} className="no-underline">
                            <div className="relative">
                              <motion.div
                                layout
                                transition={{ duration: 0.18 }}
                                style={{ backgroundColor: active ? '#B11F23' : 'transparent' }}
                                className={`absolute inset-0 rounded-md pointer-events-none`}
                              />
                              <div className={`flex items-center gap-3 rounded-md px-3 py-2 relative z-10 ml-3 ${collapsed ? 'justify-center' : ''}`}>
                                <div className={`w-5 h-5 flex items-center justify-center ${active ? 'text-white' : 'text-gray-600'}`}>
                                  {typeof c.icon === 'string' ? (
                                    <Image src={c.icon} alt={c.label} width={18} height={18} />
                                  ) : (
                                    c.icon
                                  )}
                                </div>
                                {!collapsed && <span className={`truncate text-sm 2xl:text-base ${active ? 'text-white' : 'text-gray-700'}`}>{c.label}</span>}
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>

            {/* separator */}
            <div className="border-t border-gray-200 my-3" />

            {/* Secondary menu */}
            {SECONDARY_MENU.map((m) => {
              const active = isMenuActive(m.href);
              return (
                <li key={m.href} className="relative">
                  <Link href={m.href} className="no-underline">
                    <div className={`relative`}>
                      <motion.div
                        layout
                        transition={{ duration: 0.18 }}
                        style={{ backgroundColor: active ? '#B11F23' : 'transparent' }}
                        className={`absolute inset-0 rounded-md pointer-events-none`}
                      />
                      <div className={`flex items-center gap-3 rounded-md px-3 py-2 relative z-10 ${collapsed ? 'justify-center' : ''}`}>
                        <div className={`w-5 h-5 2xl:w-6 2xl:h-6 flex items-center justify-center ${active ? 'text-white' : 'text-gray-600'}`}>
                          {typeof m.icon === 'string' ? (
                            <Image src={m.icon} alt={m.label} width={20} height={20} />
                          ) : (
                            m.icon
                          )}
                        </div>
                        {!collapsed && <span className={`truncate text-sm 2xl:text-base ${active ? 'text-white' : 'text-gray-700'}`}>{m.label}</span>}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* footer */}
        <div className="px-3 py-3 border-t border-gray-200 text-xs text-gray-500">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div>v1.0</div>
              <div className="text-right">Admin</div>
            </div>
          ) : (
            <div className="text-center">v1.0</div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
