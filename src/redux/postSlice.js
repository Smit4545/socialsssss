import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Initial State
const initialState = {
  posts: [],
  loading: false,
  error: null,
};

// ✅ Fetch Posts (Async Thunk)
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const { data } = await axios.get("/api/posts/all");
  return data.posts;
});

// ✅ Create a New Post (Async Thunk)
export const createPost = createAsyncThunk(
  "posts/createPost",
  async ({ userId, content }, { rejectWithValue }) => {
    try {
    const res=  await axios.post("/api/posts", { userId, content });
      return res.data ; // Return payload to update UI
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// ✅ Like a Post (Async Thunk)
export const likePost = createAsyncThunk(
  "posts/likePost",
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/api/posts/${postId}`, { userId });
      return { postId, userId: data.userId }; // Return payload to update UI
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// ✅ Post Slice
const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload); // Add new post to the start
      })

      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) =>
          post._id === action.payload.postId
            ? { ...post, likes: [...post.likes, action.payload.userId] }
            : post
        );
      });
  },
});

export default postSlice.reducer;
