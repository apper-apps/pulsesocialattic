import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PostCard from "@/components/organisms/PostCard";
import CreatePostForm from "@/components/molecules/CreatePostForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { PostService } from "@/services/api/postService";
import { UserService } from "@/services/api/userService";
import { cn } from "@/utils/cn";

const PostFeed = ({ userId, className }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
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
    } catch (err) {
      toast.error("Failed to update like");
    }
  };

  const handleComment = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleShare = (postId) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.success("Post link copied to clipboard!");
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
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostFeed;