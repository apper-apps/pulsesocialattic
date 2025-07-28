import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { UserService } from "@/services/api/userService";
import { cn } from "@/utils/cn";

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    bio: "",
    isPrivate: false
  });

  const loadUserData = async () => {
    try {
      setError("");
      setLoading(true);
      const userData = await UserService.getCurrentUser();
      setUser(userData);
      setFormData({
        displayName: userData.displayName || "",
        username: userData.username || "",
        bio: userData.bio || "",
        isPrivate: userData.isPrivate || false
      });
    } catch (err) {
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      const updatedUser = await UserService.update(user.id, formData);
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: "User" },
    { id: "privacy", label: "Privacy", icon: "Shield" },
    { id: "notifications", label: "Notifications", icon: "Bell" }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadUserData} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold gradient-text font-display mb-2">
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account and privacy preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl border border-gray-200 shadow-card p-4">
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    activeSection === section.id
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <ApperIcon name={section.icon} className="w-5 h-5" />
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Settings
                  </h2>
                  <Badge variant="secondary">
                    <ApperIcon name="User" className="w-3 h-3 mr-1" />
                    Public Profile
                  </Badge>
                </div>
                
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar
                    src={user?.avatarUrl}
                    alt={user?.displayName}
                    fallback={user?.displayName}
                    size="xl"
                  />
                  <div>
                    <Button variant="secondary" size="sm">
                      <ApperIcon name="Camera" className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
                
                {/* Profile Form */}
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Display Name"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange("displayName", e.target.value)}
                      placeholder="Your display name"
                      required
                    />
                    
                    <FormField
                      label="Username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Your username"
                      required
                    />
                  </div>
                  
                  <FormField
                    label="Bio"
                    type="textarea"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    helperText="Maximum 160 characters"
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={saving}
                      className="px-6"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {activeSection === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Privacy Settings
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Private Account</h3>
                      <p className="text-sm text-gray-500">
                        Only followers can see your posts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPrivate}
                        onChange={(e) => handleInputChange("isPrivate", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Discovery</h3>
                      <p className="text-sm text-gray-500">
                        Allow others to find you by email or phone
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Notification Preferences
                </h2>
                
                <div className="space-y-4">
                  {[
                    { label: "New followers", description: "When someone follows you" },
                    { label: "Likes", description: "When someone likes your post" },
                    { label: "Comments", description: "When someone comments on your post" },
                    { label: "Mentions", description: "When someone mentions you" },
                    { label: "Direct messages", description: "When you receive a new message" }
                  ].map((notification) => (
                    <div key={notification.label} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{notification.label}</h3>
                        <p className="text-sm text-gray-500">{notification.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;