import posts from "@/services/mockData/posts.json";
import users from "@/services/mockData/users.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const enrichPostWithUser = (post) => {
  const user = users.find(u => u.Id === post.userId);
  return {
    ...post,
    id: post.Id.toString(),
    user: user ? {
      ...user,
      id: user.Id.toString()
    } : null
  };
};

export const PostService = {
  async getAll() {
    await delay(400);
    return posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(enrichPostWithUser);
  },

  async getFeed() {
    await delay(350);
    // Mock feed - in real app would filter by followed users
    return posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(enrichPostWithUser);
  },

  async getById(id) {
    await delay(250);
    const post = posts.find(p => p.Id === parseInt(id));
    if (!post) {
      throw new Error("Post not found");
    }
    return enrichPostWithUser(post);
  },

  async getByUserId(userId) {
    await delay(300);
    const userPosts = posts.filter(p => p.userId === parseInt(userId));
    return userPosts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(enrichPostWithUser);
  },

  async create(postData) {
    await delay(500);
    const currentUser = users.find(u => u.Id === 1); // Mock current user
    
    const newPost = {
      Id: Math.max(...posts.map(p => p.Id)) + 1,
      userId: 1,
      content: postData.content,
      imageUrl: postData.imageUrl || null,
      likeCount: 0,
      commentCount: 0,
      privacy: postData.privacy || "public",
      isLiked: false,
      createdAt: new Date().toISOString()
    };
    
    posts.unshift(newPost);
    return enrichPostWithUser(newPost);
  },

  async update(id, postData) {
    await delay(400);
    const postIndex = posts.findIndex(p => p.Id === parseInt(id));
    if (postIndex === -1) {
      throw new Error("Post not found");
    }
    
    const updatedPost = {
      ...posts[postIndex],
      ...postData,
      Id: posts[postIndex].Id
    };
    
    posts[postIndex] = updatedPost;
    return enrichPostWithUser(updatedPost);
  },

  async delete(id) {
    await delay(300);
    const postIndex = posts.findIndex(p => p.Id === parseInt(id));
    if (postIndex === -1) {
      throw new Error("Post not found");
    }
    
    posts.splice(postIndex, 1);
    return { success: true };
  },

  async toggleLike(id, isLiked) {
    await delay(200);
    const postIndex = posts.findIndex(p => p.Id === parseInt(id));
    if (postIndex === -1) {
      throw new Error("Post not found");
    }
    
    const post = posts[postIndex];
    post.likeCount = isLiked ? post.likeCount + 1 : Math.max(0, post.likeCount - 1);
    post.isLiked = isLiked;
    
    return enrichPostWithUser(post);
  }
};