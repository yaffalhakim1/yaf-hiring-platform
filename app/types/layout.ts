/**
 * Layout Component Types
 * Types for layout components like Navbar, Sidebar, etc.
 */

export interface SidebarContentProps {
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export interface NavbarProps {
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
}
