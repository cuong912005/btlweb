import { create } from 'zustand';
import api from '../utils/api';

export const useChannelStore = create((set, get) => ({
  // State
  channel: null,
  posts: [],
  isLoading: false,
  error: null,
  permissions: {
    canPost: false,
    canModerate: false
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  },
  // Track posts being liked to prevent double-likes
  likingPosts: new Set(),

  // Actions
  getChannelByEventId: async (eventId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/channels/event/${eventId}`);
      set({ 
        channel: response.data.channel,
        permissions: response.data.channel?.permissions || response.data.permissions || { canPost: true, canModerate: false },
        isLoading: false 
      });
      return { success: true, channel: response.data.channel };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi tải kênh trao đổi';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  fetchChannelPosts: async (channelId, page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/channels/${channelId}/posts`, {
        params: { page, limit: 20 }
      });
      set({ 
        posts: response.data.posts,
        pagination: response.data.pagination,
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi tải bài viết';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  createPost: async (channelId, content, imageUrl = null) => {
    try {
      const response = await api.post(`/channels/${channelId}/posts`, {
        content,
        imageUrl
      });
      
      const newPost = response.data.post;
      set(state => ({ 
        posts: [newPost, ...state.posts]
      }));
      
      return { success: true, post: newPost };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi tạo bài viết';
      return { success: false, error: errorMsg };
    }
  },

  uploadImage: async (channelId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/channels/${channelId}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return { success: true, imageUrl: response.data.imageUrl };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi tải lên hình ảnh';
      return { success: false, error: errorMsg };
    }
  },

  toggleLike: async (postId) => {
    const state = get();
    
    // Prevent multiple simultaneous likes on same post
    if (state.likingPosts.has(postId)) {
      return { success: false, error: 'Like action already in progress' };
    }

    try {
      // Mark post as being liked
      set(state => ({
        likingPosts: new Set([...state.likingPosts, postId])
      }));

      // Store original post state for rollback
      let originalPost = null;
      
      // Optimistic update
      set(state => {
        const updatedPosts = state.posts.map(post => {
          if (post.id === postId) {
            originalPost = { ...post }; // Deep copy for rollback
            const currentIsLiked = post.isLikedByUser || post.isLiked || false;
            const newIsLiked = !currentIsLiked;
            const newCount = newIsLiked 
              ? (post.likeCount || 0) + 1 
              : Math.max((post.likeCount || 0) - 1, 0);
            return { 
              ...post, 
              likeCount: newCount,
              isLikedByUser: newIsLiked,
              isLiked: newIsLiked // Support both property names
            };
          }
          return post;
        });
        return { posts: updatedPosts };
      });

      const response = await api.post(`/channels/posts/${postId}/like`);
      
      // Update with server response to ensure consistency
      set(state => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likeCount: response.data.likeCount,
                isLikedByUser: response.data.isLiked,
                isLiked: response.data.isLiked
              }
            : post
        ),
        // Remove from liking posts
        likingPosts: new Set([...state.likingPosts].filter(id => id !== postId))
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      // Revert optimistic update on error
      if (originalPost) {
        set(state => ({
          posts: state.posts.map(post => 
            post.id === postId ? originalPost : post
          ),
          likingPosts: new Set([...state.likingPosts].filter(id => id !== postId))
        }));
      }
      
      const errorMsg = error.response?.data?.error || 'Lỗi khi thích bài viết';
      return { success: false, error: errorMsg };
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await api.post(`/channels/posts/${postId}/comments`, {
        content
      });
      
      const newComment = response.data.comment;
      
      // Update post with new comment
      set(state => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: [...(post.comments || []), newComment],
                commentCount: (post.commentCount || 0) + 1
              }
            : post
        )
      }));
      
      return { success: true, comment: newComment };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi thêm bình luận';
      return { success: false, error: errorMsg };
    }
  },

  deletePost: async (postId) => {
    try {
      await api.delete(`/channels/posts/${postId}`);
      
      // Remove post from store
      set(state => ({
        posts: state.posts.filter(post => post.id !== postId)
      }));
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi xóa bài viết';
      return { success: false, error: errorMsg };
    }
  },

  // Real-time update handlers
  addPostFromSocket: (post) => {
    set(state => {
      // Check if post already exists
      const exists = state.posts.some(p => p.id === post.id);
      if (exists) return state;
      
      return {
        posts: [post, ...state.posts]
      };
    });
  },

  updatePostLike: (postId, likeCount, isLiked) => {
    set(state => ({
      posts: state.posts.map(post => 
        post.id === postId 
          ? { ...post, likeCount, isLikedByUser: isLiked }
          : post
      )
    }));
  },

  updatePostLikeFromSocket: (postId, likeCount) => {
    set(state => ({
      posts: state.posts.map(post => 
        post.id === postId 
          ? { ...post, likeCount } // Only update count, preserve current user's like status
          : post
      )
    }));
  },

  addCommentFromSocket: (postId, comment) => {
    set(state => ({
      posts: state.posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments: [...(post.comments || []), comment],
              commentCount: (post.commentCount || 0) + 1
            }
          : post
      )
    }));
  },

  removePostFromSocket: (postId) => {
    set(state => ({
      posts: state.posts.filter(post => post.id !== postId)
    }));
  },

  clearError: () => set({ error: null }),
  
  reset: () => set({
    channel: null,
    posts: [],
    isLoading: false,
    error: null,
    permissions: { canPost: false, canModerate: false },
    pagination: { currentPage: 1, totalPages: 1, hasNext: false, hasPrev: false },
    likingPosts: new Set()
  })
}));