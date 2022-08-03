import React , {useState} from 'react'
import { useDispatch , useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { postUpdate , selectPostById } from './postsSlice'

export const EditPostForm = ({match}) => {
    const {postId} = match.params

    const post = useSelector(state => selectPostById(state, postId))

    const [title,setTitle] = useState(post.title)
    const [body,setBody] = useState(post.body)

    const dispatch = useDispatch()
    const history = useHistory()

    const onTitleChange = (e) => setTitle(e.target.value)
    const onContentChange = (e) => setBody(e.target.value)

    const onSavePostClicked = () => {
        if(title && body){
            dispatch(postUpdate({ id:postId,title,body}))
            history.push(`/posts/${postId}`)
        }
    }

    return (
        <section>
            <h2>Edit Post</h2>
            <form>
                <label htmlFor="postTitle" >Post Title</label>
                <input type="text" id="postTitle" value={title} onChange={onTitleChange} />
                <label htmlFor="postContent" >Post Content</label>
                <textarea id="postContent" value={body} onChange={onContentChange} />
                <button type="button" onClick={onSavePostClicked} >Save Post</button>
            </form>
        </section>
    )


}