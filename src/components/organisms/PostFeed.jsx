import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserService } from "@/services/api/userService";
import { PostService } from "@/services/api/postService";
import ApperIcon from "@/components/ApperIcon";
import CreatePostForm from "@/components/molecules/CreatePostForm";
import PostCard from "@/components/organisms/PostCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { cn } from "@/utils/cn";

const PostFeed = ({ userId, className }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const navigate = useNavigate();

  const loadPosts = async () => {
    try {
      setError("");
      setLoading(true);
      
      const [postsData, userData] = await Promise.all([
        userId ? PostService.getByUserId(userId) : PostService.getFeed(),
        UserService.getCurrentUser()
      ]);
      
      setPosts(postsData);
      setCurrentUser(userData);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [userId]);

const handleCreatePost = async (postData) => {
    const newPost = await PostService.create(postData);
    setPosts(prev => [newPost, ...prev]);
  };

  const handleEdit = async (postId, updatedData) => {
    try {
      const updatedPost = await PostService.update(postId, updatedData);
      setPosts(prev => prev.map(post => 
        post.id === postId ? updatedPost : post
      ));
      toast.success("Post updated successfully!");
    } catch (error) {
      toast.error("Failed to update post");
    }
  };

  const handleDelete = (postId) => {
    setPostToDelete(postId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      await PostService.delete(postToDelete);
      setPosts(prev => prev.filter(post => post.id !== postToDelete));
      toast.success("Post deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setShowConfirmDialog(false);
      setPostToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setPostToDelete(null);
  };

const handleLike = async (postId, isLiked) => {
    try {
      await PostService.toggleLike(postId, isLiked);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1,
              isLiked 
            }
          : post
      ));
      
      if (isLiked) {
        toast.success("Post liked!");
      }
    } catch (err) {
      toast.error("Failed to update like");
    }
  };

  const handleComment = (postId) => {
    navigate(`/post/${postId}`);
  };

const handleShare = async (postId) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Post link copied to clipboard!");
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        if (document.execCommand('copy')) {
          toast.success("Post link copied to clipboard!");
        } else {
          throw new Error('Copy command failed');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error("Unable to copy link. Please copy manually from the address bar.");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPosts} />;

  return (
    <div className={cn("space-y-6", className)}>
      {!userId && currentUser && (
        <CreatePostForm
          currentUser={currentUser}
          onSubmit={handleCreatePost}
        />
      )}
      
      {posts.length === 0 ? (
        <Empty
          title={userId ? "No posts yet" : "Welcome to Pulse!"}
          description={userId 
            ? "This user hasn't shared anything yet."
            : "Follow some friends to see their posts in your feed."
          }
          actionText={userId ? null : "Explore"}
          onAction={() => !userId && navigate("/explore")}
        />
      ) : (
        <div className="space-y-6">
{posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={post.user}
              currentUser={currentUser}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <ApperIcon name="Trash2" className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This will permanently remove the post and all its comments.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFeed;