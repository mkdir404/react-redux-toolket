import { 
    createSlice, 
    createAsyncThunk, 
    createSelector , 
    nanoid,
    createEntityAdapter } from '@reduxjs/toolkit'
import {client} from '../../api/client';

const postsAdapter = createEntityAdapter({
    sortComparer: (a, b) => b.date.localeCompare(a.date)
  })
  
  const initialState = postsAdapter.getInitialState({
    status: 'idle',
    error: null
  })

export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',     
    async () => {
        const response = await client.get('/fakeApi/posts')
        return response.data
})

export const addNewPost = createAsyncThunk(
    'posts/addNewPost',
    // The payload creator receives the partial `{title, content, user}` object
    async initialPost => {
      // We send the initial data to the fake API server
      const response = await client.post('/fakeApi/posts', initialPost)
      // The response includes the complete post object, including unique ID
      return response.data
    }
  )

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        postAdded:{
            reducer(state,action){
                state.posts.push(action.payload)
            },
            prepare(title,body,userId){
                return {
                    payload:{
                        id:nanoid(),
                        date: new Date().toISOString(),
                        title,
                        body,
                        user:userId, 
                        reactions: {thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0}
                    }
                }
            }        
        },
        postUpdate(state,action){
            const {id,title,body} = action.payload
            const existingPost = state.entities[id]
            
            if(existingPost){
                existingPost.title = title
                existingPost.body = body
            }
        },
        reactionAdded(state,action){
            const {postId,reaction} = action.payload
            const existingPost = state.entities[postId]
            if(existingPost){
                existingPost.reactions[reaction]++
            }
        }
    },
        extraReducers(builder) {
            builder
            .addCase(fetchPosts.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded'
                // Add any fetched posts to the array

                /*

                { NORMALIZATION }
                    users: {
                            ids: ["user1", "user2", "user3"],
                            entities: {
                            "user1": {id: "user1", firstName, lastName},
                            "user2": {id: "user2", firstName, lastName},
                            "user3": {id: "user3", firstName, lastName},
                            }
                            }
                    }

                */

                postsAdapter.upsertMany(state, action.payload)
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })            
            .addCase(addNewPost.fulfilled, postsAdapter.addOne)
          
        }
});

export const { postAdded , postUpdate , reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;

// Export the customized selectors for this adapter using `getSelectors`
export const {
    selectAll: selectAllPosts,
    selectById: selectPostById,
    selectIds: selectPostIds
    // Pass in a selector that returns the posts slice of state
  } = postsAdapter.getSelectors(state => state.posts)

export const selectPostsByUser = createSelector(
    [selectAllPosts, (state, userId) => userId],
    (posts, userId) => posts.filter(post => post.user === userId)
  )