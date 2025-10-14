'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import { Apartment, AutoAwesomeMosaicRounded, CardGiftcard, ChatOutlined, Favorite, InventoryOutlined, ListAltOutlined, Person, ShoppingBagOutlined } from '@mui/icons-material';

type MenuItem = { label: string; href: string; icon: React.ReactNode | string };

const MAIN_MENU: MenuItem[] = [
  { label: 'Dashboard', href: '/', icon: <HomeIcon /> },
  // Products dipindahkan ke dalam Catalog submenu
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

// Catalog submenu (parent)
const CATALOG_SUBMENU: MenuItem[] = [
  { label: 'items', href: '/items', icon: <ShoppingBagOutlined /> },
  { label: 'products', href: '/products', icon: <ShoppingBagOutlined /> },
  { label: 'Categories', href: '/categories', icon: <AutoAwesomeMosaicRounded /> },
];

export default function Sidebar() {
  const pathname = usePathname() || '/';
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [catalogOpen, setCatalogOpen] = useState<boolean>(false);

  // read persisted collapse preference once on mount
  useEffect(() => {
    try {
      const v = localStorage.getItem('sidebar-collapsed');
      setCollapsed(v === '1');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  // auto-open catalog if current route is inside products/categories
  useEffect(() => {
    if (pathname.startsWith('/products') || pathname.startsWith('/categories')) {
      setCatalogOpen(true);
    }
  }, [pathname]);

  const isMenuActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const collapsedWidth = 100;
  const expandedWidth = 200;

  return (
    <motion.aside
      aria-label="Sidebar"
      initial={false}
      animate={{ width: collapsed ? collapsedWidth : expandedWidth }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      style={{ minWidth: collapsed ? collapsedWidth : expandedWidth, maxWidth: expandedWidth }}
      className="h-screen bg-white border-r border-gray-200 flex flex-col"
    >
      {/* top: logo + toggle */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {collapsed ? (
            <div className="w-8 h-8 flex-shrink-0">
              <Image src="/images/logo_etm.png" alt="logo" width={32} height={32} className="object-contain" />
            </div>
          ) : (
            <span className="text-lg font-semibold text-gray-800">E-Katalog</span>
          )}
        </div>

        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((s) => !s)}
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
      <nav className="flex-1 overflow-y-auto mt-3 ">
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
                      <div className={`w-6 h-6 flex items-center justify-center ${active ? 'text-white' : 'text-gray-600'}`}>
                        {typeof m.icon === 'string' ? (
                          <Image src={m.icon} alt={m.label} width={20} height={20} />
                        ) : (
                          m.icon
                        )}
                      </div>
                      {!collapsed && <span className={`truncate ${active ? 'text-white' : 'text-gray-700'}`}>{m.label}</span>}
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
            {/* Parent button */}
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
                      <div className={`w-6 h-6 flex items-center justify-center ${parentActive ? 'text-white' : 'text-gray-600'}`}>
                        {/* <Image src="/icons/menu/catalog.svg" alt="Catalog" width={20} height={20} /> */}
                        <CardGiftcard />
                      </div>
                      {!collapsed && <span className={`truncate ${parentActive ? 'text-white' : 'text-gray-700'}`}>Catalog</span>}

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
            {/* Submenu with animation */}
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
                              {!collapsed && <span className={`truncate ${active ? 'text-white' : 'text-gray-700'}`}>{c.label}</span>}
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
                      <div className={`w-6 h-6 flex items-center justify-center ${active ? 'text-white' : 'text-gray-600'}`}>
                        {typeof m.icon === 'string' ? (
                          <Image src={m.icon} alt={m.label} width={20} height={20} />
                        ) : (
                          m.icon
                        )}
                      </div>
                      {!collapsed && <span className={`truncate ${active ? 'text-white' : 'text-gray-700'}`}>{m.label}</span>}
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
  );
}
