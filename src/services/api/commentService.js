import comments from "@/services/mockData/comments.json";
import users from "@/services/mockData/users.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const enrichCommentWithUser = (comment) => {
  const user = users.find(u => u.Id === comment.userId);
  return {
    ...comment,
    id: comment.Id.toString(),
    user: user ? {
      ...user,
      id: user.Id.toString()
    } : null
  };
};

export const CommentService = {
  async getAll() {
    await delay(300);
    return comments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(enrichCommentWithUser);
  },

  async getById(id) {
    await delay(250);
    const comment = comments.find(c => c.Id === parseInt(id));
    if (!comment) {
      throw new Error("Comment not found");
    }
    return enrichCommentWithUser(comment);
  },

  async getByPostId(postId) {
    await delay(350);
    const postComments = comments.filter(c => c.postId === parseInt(postId));
    return postComments
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(enrichCommentWithUser);
  },

  async create(commentData) {
    await delay(400);
    const currentUser = users.find(u => u.Id === 1); // Mock current user
    
    const newComment = {
      Id: Math.max(...comments.map(c => c.Id)) + 1,
      postId: parseInt(commentData.postId),
      userId: 1,
      content: commentData.content,
      parentId: commentData.parentId ? parseInt(commentData.parentId) : null,
      createdAt: new Date().toISOString()
    };
    
    comments.push(newComment);
    return enrichCommentWithUser(newComment);
  },

  async update(id, commentData) {
    await delay(350);
    const commentIndex = comments.findIndex(c => c.Id === parseInt(id));
    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }
    
    const updatedComment = {
      ...comments[commentIndex],
      ...commentData,
      Id: comments[commentIndex].Id
    };
    
    comments[commentIndex] = updatedComment;
    return enrichCommentWithUser(updatedComment);
  },

  async delete(id) {
    await delay(300);
    const commentIndex = comments.findIndex(c => c.Id === parseInt(id));
    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }
    
    // Also delete any replies to this comment
    const commentId = parseInt(id);
    const indicesToRemove = [];
    
    for (let i = comments.length - 1; i >= 0; i--) {
      {
        const comment = comments[i];
        if (comment.Id === commentId || comment.parentId === commentId) {
          indicesToRemove.push(i);
        }
      }
    }
    
    indicesToRemove.forEach(index => comments.splice(index, 1));
    return { success: true };
  },

  async getReplies(parentId) {
    await delay(250);
    const replies = comments.filter(c => c.parentId === parseInt(parentId));
    return replies
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(enrichCommentWithUser);
  }
};