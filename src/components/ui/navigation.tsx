import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Trophy, Home, List, Shield, Menu, GraduationCap, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavigationLinks = ({ mobile = false, onLinkClick = () => {} }) => (
    <>
      <Link
        to="/dashboard"
        onClick={onLinkClick}
        className={`flex items-center space-x-2 ${mobile ? 'px-4 py-3 rounded-md text-base font-medium' : 'px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium'} responsive-transition ${
          isActive('/dashboard')
            ? 'bg-gradient-to-r from-purple-700 to-blue-700 text-white'
            : 'text-gray-200 hover:text-white hover:bg-[#23272e]'
        }`}
      >
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/learn"
        onClick={onLinkClick}
        className={`flex items-center space-x-2 ${mobile ? 'px-4 py-3 rounded-md text-base font-medium' : 'px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium'} responsive-transition ${
          isActive('/learn')
            ? 'bg-gradient-to-r from-purple-700 to-blue-700 text-white'
            : 'text-gray-200 hover:text-white hover:bg-[#23272e]'
        }`}
      >
        <GraduationCap className="w-4 h-4" />
        <span>Learn</span>
      </Link>
      <Link
        to="/challenges"
        onClick={onLinkClick}
        className={`flex items-center space-x-2 ${mobile ? 'px-4 py-3 rounded-md text-base font-medium' : 'px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium'} responsive-transition ${
          isActive('/challenges')
            ? 'bg-gradient-to-r from-purple-700 to-blue-700 text-white'
            : 'text-gray-200 hover:text-white hover:bg-[#23272e]'
        }`}
      >
        <List className="w-4 h-4" />
        <span>Challenges</span>
      </Link>
      <Link
        to="/leaderboard"
        onClick={onLinkClick}
        className={`flex items-center space-x-2 ${mobile ? 'px-4 py-3 rounded-md text-base font-medium' : 'px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium'} responsive-transition ${
          isActive('/leaderboard')
            ? 'bg-gradient-to-r from-purple-700 to-blue-700 text-white'
            : 'text-gray-200 hover:text-white hover:bg-[#23272e]'
        }`}
      >
        <Trophy className="w-4 h-4" />
        <span>Leaderboard</span>
      </Link>

      {user?.role === 'admin' && (
        <Link
          to="/admin"
          onClick={onLinkClick}
          className={`flex items-center space-x-2 ${mobile ? 'px-4 py-3 rounded-md text-base font-medium' : 'px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium'} responsive-transition ${
            isActive('/admin')
              ? 'bg-gradient-to-r from-purple-700 to-blue-700 text-white'
              : 'text-gray-200 hover:text-white hover:bg-[#23272e]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Admin</span>
        </Link>
      )}
    </>
  );

  return (
    <nav className="w-full sticky top-0 z-50 bg-gradient-to-r from-[#23272e] to-[#161b22] border-b border-[#30363d] shadow-navbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">N</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-gray-100 hidden sm:inline">NoCodeJam</span>
            <span className="font-bold text-base text-gray-100 sm:hidden">NCJ</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <NavigationLinks />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage src={user.avatar || undefined} alt={user.username || ''} />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.username || ''}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          <span className="text-xs sm:text-sm font-medium leading-none">{user.username || ''}</span>
                        </p>
                        <p className="text-sm text-purple-600 font-medium">{user.xp ?? 0} XP</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild className="text-xs sm:text-sm">
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar || undefined} alt={user.username || ''} />
                      <AvatarFallback className="text-xs">
                        {user.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.username || ''}</p>
                      <p className="text-sm text-purple-600 font-medium">{user.xp ?? 0} XP</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">N</span>
                    </div>
                    <span>NoCodeJam</span>
                  </SheetTitle>
                  <SheetDescription>
                    Navigate through the platform
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-3">
                  {user ? (
                    <NavigationLinks mobile onLinkClick={() => setMobileMenuOpen(false)} />
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Button asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/register">Register</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}