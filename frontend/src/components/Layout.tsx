import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📋' },
  { label: 'Driver Master', path: '/drivers', icon: '🚗' },
  { label: 'Vehicle Master', path: '/vehicles', icon: '🚚' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '64px',
        background: '#4C1D95',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
      }}>

        {/* Logo area */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minHeight: '64px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: '#7C3AED',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}>🚀</div>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>SwiftERP</div>
              <div style={{ color: '#C4B5FD', fontSize: '11px' }}>Fleet & Logistics</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: isActive ? '#fff' : '#C4B5FD',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  marginBottom: '2px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive)(e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={e => {
                  if (!isActive)(e.target as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div style={{
          padding: '12px 8px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          {sidebarOpen ? (
            <div style={{ padding: '8px 12px' }}>
              <div style={{ color: '#C4B5FD', fontSize: '11px', marginBottom: '4px' }}>Logged in as</div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>{user}</div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: 'none',
                color: '#C4B5FD',
                fontSize: '18px',
                cursor: 'pointer',
                borderRadius: '8px',
              }}
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F5F3FF', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          height: '64px',
          background: '#fff',
          borderBottom: '1px solid #E9D5FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#6B21A8',
                padding: '4px',
              }}
            >
              ☰
            </button>
            <span style={{ color: '#6B21A8', fontSize: '14px', fontWeight: 500 }}>
              {navItems.find(n => n.path === location.pathname)?.label || 'Home'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#F3E8FF',
              color: '#6B21A8',
              fontSize: '13px',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: '20px',
            }}>
              {user}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}