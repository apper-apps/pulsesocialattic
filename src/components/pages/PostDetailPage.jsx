import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "@/components/organisms/PostCard";
import CommentThread from "@/components/organisms/CommentThread";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { PostService } from "@/services/api/postService";
import { toast } from "react-toastify";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPost = async () => {
    try {
      setError("");
      setLoading(true);
      const postData = await PostService.getById(postId);
      setPost(postData);
    } catch (err) {
      setError("Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const handleLike = async (postId, isLiked) => {
    try {
      await PostService.toggleLike(postId, isLiked);
      setPost(prev => ({
        ...prev,
        likeCount: isLiked ? prev.likeCount + 1 : prev.likeCount - 1,
        isLiked
      }));
    } catch (err) {
      toast.error("Failed to update like");
    }
  };

  const handleShare = (postId) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.success("Post link copied to clipboard!");
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPost} />;
  if (!post) return <Error message="Post not found" />;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
        Back
      </Button>
      
      {/* Post */}
      <PostCard
        post={post}
        user={post.user}
        onLike={handleLike}
        onShare={handleShare}
      />
      
      {/* Comments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Comments
        </h2>
        <CommentThread postId={postId} />
      </div>
    </div>
  );
};

export default PostDetailPage;