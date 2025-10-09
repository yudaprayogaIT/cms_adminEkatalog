// // src/components/layout/Sidebar.tsx
// 'use client';

// import React, { useEffect, useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { usePathname } from 'next/navigation';
// import { motion } from 'framer-motion';

// type MenuItem = { label: string; href: string; icon: string };
// type MenuGroup = { id: string; items: MenuItem[] };

// // ----- MENU DATA -----
// const MAIN_MENU: MenuItem[] = [
//   { label: 'Dashboard', href: '/', icon: '/icons/dashboard.svg' },
//   { label: 'Products', href: '/products', icon: '/icons/products.svg' },
//   { label: 'Favorites', href: '/favorites', icon: '/icons/favorites.svg' },
//   { label: 'Inbox', href: '/inbox', icon: '/icons/inbox.svg' },
//   { label: 'Order Lists', href: '/orders', icon: '/icons/orders.svg' },
//   { label: 'Product Stock', href: '/stock', icon: '/icons/stock.svg' },
// ];

// const SECONDARY_MENU: MenuItem[] = [
//   { label: 'Users', href: '/users', icon: '/icons/user.svg' },
//   { label: 'Branches', href: '/branches', icon: '/icons/branches.svg' },
//   { label: 'To-Do', href: '/todo', icon: '/icons/todo.svg' },
// ];

// const groups: MenuGroup[] = [
//   { id: 'main', items: MAIN_MENU },
//   { id: 'secondary', items: SECONDARY_MENU },
// ];

// // // ----- SidebarItem: only background color animated. Tooltip on hover when collapsed ----- //
// function SidebarItem({
//   label,
//   href,
//   icon,
//   collapsed,
//   isActive,
// }: {
//   label: string;
//   href: string;
//   icon: React.ReactNode;
//   collapsed: boolean;
//   isActive: boolean;
// }) {
//   // tooltip visibility state
//   const [hovered, setHovered] = useState(false);

//   // active color animation: only background (using framer motion style)
//   const activeBg = isActive ? '#B11F23' : 'transparent'; // red-600 or transparent
//   const textColor = isActive ? '#fff' : '#374151'; // white or gray-700

//   return (
//     <li className="relative">
//       <motion.a
//         href={href}
//         // since we are in Next.js Link environment, we keep Link wrapper at parent. Use <Link> in parent.
//         // but here we use <a> to animate backgroundColor. We'll render Link outside when using this component.
//         // For simplicity, assume parent uses Link and passes className; but to keep this component self-contained,
//         // we will return a Link below in parent. (See usage in main Sidebar component)
//         // We'll instead return a non-Link element and parent wraps it. To avoid complexity, we'll render Link here:
//         // However Next.js Link doesn't accept motion.a directly well; so we use Link with <a> as child.
//         // We'll use 'as any' casting to satisfy typing.
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         className="block"
//         role="link"
//       >
//         {/* placeholder - real Link rendered in parent */}
//       </motion.a>

//       {/* But to avoid the above TS/Link complexity, the actual clickable element is rendered in the parent (see below). */}
//       <div
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//         className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${collapsed ? 'justify-center' : 'justify-start'}`}
//       >
//         {/* background animated box behind item */}
//         <motion.div
//           layout
//           style={{ backgroundColor: activeBg }}
//           transition={{ duration: 0.18 }}
//           className={`absolute inset-0 rounded-md pointer-events-none`}
//         />

//         <div className={`relative z-10 w-6 h-6 flex items-center justify-center ${isActive ? 'text-white' : 'text-gray-600'}`}>
//           {icon}
//         </div>

//         {/* label: NOT animated on active changes (static text) */}
//         {!collapsed && (
//           <span className="relative z-10 truncate" style={{ color: isActive ? textColor : undefined }}>
//             {label}
//           </span>
//         )}

//         {/* Tooltip when collapsed + hovered */}
//         {collapsed && hovered && (
//           <motion.div
//             initial={{ opacity: 0, x: -6 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -6 }}
//             transition={{ duration: 0.12 }}
//             className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20"
//           >
//             <div className="bg-gray-800 text-white text-xs rounded-md px-2 py-1 shadow">
//               {label}
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </li>
//   );
// }

// // ----- Main Sidebar component ----- //
// export default function Sidebar() {
//   const pathname = usePathname() || '/';
//   const [collapsed, setCollapsed] = useState<boolean>(false);

//   // read persisted preference once (no dependency on pathname) -> prevents toggling on navigation
//   useEffect(() => {
//     try {
//       const v = localStorage.getItem('sidebar-collapsed');
//       setCollapsed(v === '1');
//     } catch {
//       // ignore
//     }
//     // only run once on mount
//   }, []);

//   useEffect(() => {
//     try {
//       localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
//     } catch {}
//   }, [collapsed]);

//   const isMenuActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

//   // motion widths in px (to match tailwind w-20/w-64)
//   const collapsedWidth = 80;
//   const expandedWidth = 200;

//   return (
//     <motion.aside
//       aria-label="Sidebar"
//       initial={false} // avoid initial animation on first render
//       animate={{ width: collapsed ? collapsedWidth : expandedWidth }}
//       transition={{ type: 'spring', stiffness: 260, damping: 30 }}
//       style={{ minWidth: collapsed ? collapsedWidth : expandedWidth, maxWidth: expandedWidth }}
//       className="h-screen bg-white border-r border-gray-200 flex flex-col"
//     >
//       {/* top: logo + toggle */}
//       <div className="flex items-center justify-between px-4 py-4">
//         <div className="flex items-center gap-3">
//           {collapsed && <div className="w-8 h-8 flex-shrink-0">
//             <Image src="/images/LOGO ETM.png" alt="logo" width={32} height={32} className="object-contain" />
//           </div>}

//           {!collapsed && <span className="text-lg font-semibold text-gray-800">E-Katalog</span>}
//         </div>

//         <button
//           aria-label="Toggle sidebar"
//           onClick={() => setCollapsed((s) => !s)}
//           className="p-1 rounded hover:bg-gray-100"
//           title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//         >
//           <motion.svg
//             width="24"
//             height="24"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="#B11F23"
//             strokeWidth="1.6"
//             initial={false}
//             animate={{ rotate: collapsed ? 180 : 0 }}
//             transition={{ duration: 0.25 }}
//           >
//             {collapsed ? <path d="M8 6l8 6-8 6" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M16 6l-8 6 8 6" strokeLinecap="round" strokeLinejoin="round" />}
//           </motion.svg>
//         </button>
//       </div>

//       {/* nav groups */}
//       <nav className="flex-1 overflow-y-auto mt-3">
//         <ul className="space-y-1 px-2">
//           {groups.map((g, gi) => (
//             <React.Fragment key={g.id}>
//               {g.items.map((m) => {
//                 const active = isMenuActive(m.href);

//                 // Wrap item in Link but pass the visual content as child.
//                 return (
//                   <li key={m.href} className="relative">
//                     <Link href={m.href} className="no-underline">
//                       <div
//                         onMouseEnter={() => {}}
//                         className={`${collapsed ? 'justify-center' : 'justify-start'} relative`}
//                       >
//                         {/* We'll reuse SidebarItem structure but keep Link as wrapper */}
//                         <div
//                           // Use pointer-events-auto so the motion background doesn't block clicks
//                           className="relative z-0"
//                         >
//                           {/* background color animated */}
//                           <motion.div
//                             layout
//                             transition={{ duration: 0.18 }}
//                             style={{ backgroundColor: active ? '#B11F23' : 'transparent' }}
//                             className={`absolute inset-0 rounded-md pointer-events-none`}
//                           />
//                           <div
//                             // actual content (icon + label or centered icon)
//                             className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm relative z-10 ${collapsed ? 'justify-center' : ''}`}
//                           >
//                             <div className={`w-6 h-6 flex items-center justify-center ${active ? 'text-white' : 'text-gray-600'}`}>
//                               <Image src={m.icon} alt={m.label} width={20} height={20} />
//                             </div>
//                             {!collapsed && <span className={`truncate ${active ? 'text-white' : 'text-gray-700'}`}>{m.label}</span>}
//                           </div>

//                           {/* Tooltip when collapsed */}
//                           {collapsed && (
//                             <Tooltip label={m.label} />
//                           )}
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                 );
//               })}

//               {gi === 0 && <div className="border-t border-gray-200 my-3" />}
//             </React.Fragment>
//           ))}
//         </ul>
//       </nav>

//       {/* footer */}
//       <div className="px-3 py-3 border-t border-gray-200 text-xs text-gray-500">
//         {!collapsed ? (
//           <div className="flex items-center justify-between">
//             <div>v1.0</div>
//             <div className="text-right">Admin</div>
//           </div>
//         ) : (
//           <div className="text-center">v1.0</div>
//         )}
//       </div>
//     </motion.aside>
//   );
// }

// // ----- Tooltip component (used when collapsed). It appears only on hover of its parent via CSS (we render it always but hidden):
// function Tooltip({ label }: { label: string }) {
//   // we'll display tooltip using CSS hover of parent; but because we render it here always,
//   // we rely on parent :hover to toggle visibility using a small JS-free approach is tricky.
//   // Simpler: tooltip visibility controlled by CSS using 'group' utility on parent.
//   // However in the code above we didn't add 'group' class; to keep straightforward, we add a simple hover-based show using pointer events.
//   // For robust behavior, you can instead implement per-item hovered state.
//   return (
//     <span className="hidden group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20">
//       <div className="bg-gray-800 text-white text-xs rounded-md px-2 py-1 shadow">
//         {label}
//       </div>
//     </span>
//   );
// }

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type MenuItem = { label: string; href: string; icon: string };

const MAIN_MENU: MenuItem[] = [
  { label: 'Dashboard', href: '/', icon: '/icons/dashboard.svg' },
  // Products dipindahkan ke dalam Catalog submenu
  { label: 'Favorites', href: '/favorites', icon: '/icons/favorites.svg' },
  { label: 'Inbox', href: '/inbox', icon: '/icons/inbox.svg' },
  { label: 'Order Lists', href: '/orders', icon: '/icons/orders.svg' },
  { label: 'Product Stock', href: '/stock', icon: '/icons/stock.svg' },
];

const SECONDARY_MENU: MenuItem[] = [
  { label: 'Users', href: '/users', icon: '/icons/user.svg' },
  { label: 'Branches', href: '/branches', icon: '/icons/branches.svg' },
  { label: 'To-Do', href: '/todo', icon: '/icons/todo.svg' },
];

// Catalog submenu (parent)
const CATALOG_SUBMENU: MenuItem[] = [
  { label: 'Products', href: '/products', icon: '/icons/products.svg' },
  { label: 'Categories', href: '/categories', icon: '/icons/category.svg' },
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

  // motion widths in px (to match tailwind w-20/w-64)
  const collapsedWidth = 80;
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
              <Image src="/images/LOGO ETM.png" alt="logo" width={32} height={32} className="object-contain" />
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
                      <div className={`w-6 h-6 flex items-center justify-center ${active ? 'text-white' : 'text-gray-600'}`}>
                        <Image src={m.icon} alt={m.label} width={20} height={20} />
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
                        <Image src="/icons/catalog.svg" alt="Catalog" width={20} height={20} />
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

                  {/* Tooltip when collapsed (simple) */}
                  {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20">
                      <div className="bg-gray-800 text-white text-xs rounded-md px-2 py-1 shadow">Catalog</div>
                    </div>
                  )}
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
                                <Image src={c.icon} alt={c.label} width={18} height={18} />
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
                        <Image src={m.icon} alt={m.label} width={20} height={20} />
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
