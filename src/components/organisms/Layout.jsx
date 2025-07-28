import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import NotificationDropdown from "@/components/molecules/NotificationDropdown";
import UserSearchBar from "@/components/molecules/UserSearchBar";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import { cn } from "@/utils/cn";
import { AuthContext } from "../../App";
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  // Mock current user - in real app would come from auth context
  const currentUser = {
    id: "1",
    username: "johndoe",
    displayName: "John Doe",
    avatarUrl: null
  };
const navigation = [
    { name: "Home", href: "/", icon: "Home" },
    { name: "Messages", href: "/messages", icon: "MessageCircle" },
    { name: "Profile", href: `/profile/${currentUser.username}`, icon: "User" },
    { name: "Settings", href: "/settings", icon: "Settings" }
  ];

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text font-display">
                Pulse
              </span>
            </Link>

            {/* Search Bar */}
            <div className="hidden sm:block flex-1 max-w-md mx-4">
              <UserSearchBar />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 flex-shrink-0">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <ApperIcon name={item.icon} className="w-5 h-5" />
                  <span className="hidden lg:block">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
<div className="flex items-center space-x-4">
              <NotificationDropdown />
              
<Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Logout functionality using AuthContext
                  if (authContext?.logout) {
                    authContext.logout();
                  }
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
                Logout
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => {/* Toggle mobile menu */}}
              >
                <ApperIcon name="Menu" className="w-5 h-5" />
              </Button>
              <Link to={`/profile/${currentUser.username}`}>
                <Avatar
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  fallback={currentUser.displayName}
                  className="hover:scale-105 transition-transform duration-200 cursor-pointer"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-gray-200 bg-white">
          <div className="flex items-center justify-around py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-gray-600"
                )}
              >
                <ApperIcon name={item.icon} className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {children}
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block space-y-6">
            {/* Trending Topics */}
            <div className="bg-surface rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trending Topics
              </h3>
              <div className="space-y-3">
                {["#React", "#WebDev", "#JavaScript", "#Design"].map((tag) => (
                  <button
                    key={tag}
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <span className="text-primary font-medium">{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-surface rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Who to Follow
              </h3>
              <div className="space-y-4">
                {[
                  { username: "sarah_design", displayName: "Sarah Chen" },
                  { username: "mike_codes", displayName: "Mike Johnson" },
                  { username: "alex_writes", displayName: "Alex Rivera" }
                ].map((user) => (
                  <div key={user.username} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        alt={user.displayName}
                        fallback={user.displayName}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;