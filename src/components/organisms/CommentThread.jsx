import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import UserCard from "@/components/molecules/UserCard";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { CommentService } from "@/services/api/commentService";
import { UserService } from "@/services/api/userService";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";

const CommentThread = ({ postId, className }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const loadComments = async () => {
    try {
      setError("");
      setLoading(true);
      
      const [commentsData, userData] = await Promise.all([
        CommentService.getByPostId(postId),
        UserService.getCurrentUser()
      ]);
      
      setComments(commentsData);
      setCurrentUser(userData);
    } catch (err) {
      setError("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    if (!currentUser) {
      toast.error("Please log in to comment");
      return;
    }
    
    setSubmitting(true);
    try {
      const commentData = {
        postId,
        content: newComment.trim(),
        parentId: replyingTo
      };
      
      const comment = await CommentService.create(commentData);
      setComments(prev => [comment, ...prev]);
      setNewComment("");
      setReplyingTo(null);
      
      toast.success("Comment posted!");
    } catch (err) {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadComments} />;

  const topLevelComments = comments.filter(comment => !comment.parentId);
  const getReplies = (parentId) => comments.filter(comment => comment.parentId === parentId);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Comment Form */}
      {currentUser && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          {replyingTo && (
            <div className="flex items-center justify-between bg-surface p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ApperIcon name="Reply" className="w-4 h-4" />
                <span>Replying to comment</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelReply}
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <FormField
            type="textarea"
            placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="flex justify-end space-x-3">
            {replyingTo && (
              <Button
                type="button"
                variant="secondary"
                onClick={cancelReply}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!newComment.trim() || submitting}
              loading={submitting}
            >
              {replyingTo ? "Reply" : "Comment"}
            </Button>
          </div>
        </form>
      )}
      
      {/* Comments List */}
      {topLevelComments.length === 0 ? (
        <Empty
          title="No comments yet"
          description="Be the first to share your thoughts!"
          icon="MessageCircle"
        />
      ) : (
        <div className="space-y-6">
          {topLevelComments.map((comment) => {
            const replies = getReplies(comment.id);
            
            return (
              <div key={comment.id} className="space-y-4">
                {/* Main Comment */}
                <div className="bg-surface rounded-lg p-4">
                  <UserCard
                    user={comment.user}
                    showTimestamp
                    timestamp={comment.createdAt}
                  />
                  
                  <div className="mt-3 ml-13">
                    <p className="text-gray-900 leading-relaxed">
                      {comment.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                        className="text-gray-500 hover:text-primary text-sm"
                      >
                        <ApperIcon name="Reply" className="w-4 h-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Replies */}
                {replies.length > 0 && (
                  <div className="ml-8 space-y-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <UserCard
                          user={reply.user}
                          showTimestamp
                          timestamp={reply.createdAt}
                        />
                        
                        <div className="mt-3 ml-13">
                          <p className="text-gray-900 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentThread;