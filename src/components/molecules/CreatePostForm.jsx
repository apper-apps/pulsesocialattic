import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import TextArea from "@/components/atoms/TextArea";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const CreatePostForm = ({ currentUser, onSubmit, className }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please write something to share");
      return;
    }

    setIsLoading(true);
    
    try {
      const postData = {
        content: content.trim(),
        imageUrl: imagePreview, // In real app, would upload to server
        privacy
      };
      
      await onSubmit(postData);
      
      // Reset form
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      setPrivacy("public");
      
      toast.success("Post shared successfully!");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-card p-6", className)}>
      <div className="flex space-x-4">
        <Avatar
          src={currentUser?.avatarUrl}
          alt={currentUser?.displayName}
          fallback={currentUser?.displayName}
        />
        
        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <TextArea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] border-none resize-none focus:ring-0 text-lg placeholder:text-gray-400"
            maxLength={500}
          />
          
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50">
                  <ApperIcon name="Image" className="w-5 h-5" />
                  <span className="text-sm font-medium">Photo</span>
                </div>
              </label>
              
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="text-sm text-gray-500 bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                <option value="public">🌍 Public</option>
                <option value="followers">👥 Followers only</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400">
                {content.length}/500
              </span>
              <Button
                type="submit"
                disabled={!content.trim() || isLoading}
                loading={isLoading}
                className="px-6"
              >
                Share
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostForm;