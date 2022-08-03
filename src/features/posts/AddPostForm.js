import React , { useState} from 'react'
import { useDispatch , useSelector } from 'react-redux'
import { addNewPost } from './postsSlice'

import {
  selectAllUsers,  
} from '../users/usersSlice'

export default function AddPostForm() {
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [userId, setUserId] = useState('')
    const [addRequestStatus, setAddRequestStatus] = useState('idle')

    const dispatch = useDispatch()
    const users = useSelector(selectAllUsers)

    const onTitleChange = (e) => setTitle(e.target.value)
    const onContentChange = (e) => setBody(e.target.value)

    const canSave = [title, body, userId].every(Boolean) && addRequestStatus === 'idle'

    const onSavePostClicked = async () => {
        if (canSave) {
          try {
            setAddRequestStatus('pending')
            await dispatch(addNewPost({ title, body, user: userId })).unwrap()
            setTitle('')
            setBody('')
            setUserId('')
          } catch (err) {
            console.error('Failed to save the post: ', err)
          } finally {
            setAddRequestStatus('idle')
          }
        }
      }
    
    const userOptions = users.map(user => (
        <option key={user.id} value={user.id}>{user.name}</option>
    ))

    return (
        <section>
            <h2>Add Post</h2>
            <form>
                <label htmlFor="postTitle" >Post Title</label>
                <input type="text" id="postTitle" value={title} onChange={onTitleChange} />
                <label htmlFor="postContent" >Post Content</label>
                <label htmlFor="postUserId" >Author</label>
                <select id="postUserId" value={userId} onChange={e => setUserId(e.target.value)}>
                    <option value="">Select Author</option>
                    {userOptions}
                </select>
                <textarea id="postContent" value={body} onChange={onContentChange} />
                <button type="button" onClick={onSavePostClicked} disabled={!canSave}>Add Post</button>
            </form>
        </section>
    )
}