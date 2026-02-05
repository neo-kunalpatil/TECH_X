import React, { useState } from 'react';
import { postsAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/demo/image/upload/v1690000000/placeholder.jpg';

const PostCard = ({ post, onPostUpdate }) => {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      const res = await postsAPI.like(post._id);
      onPostUpdate(res.data);
    } catch {
      toast.error('Like failed');
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsCommenting(true);
      const res = await postsAPI.comment(post._id, newComment);
      onPostUpdate(res.data);
      setNewComment('');
    } catch {
      toast.error('Comment failed');
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h4 className="font-semibold">{post.author?.name || 'User'}</h4>
      </div>

      <div className="p-4">
        <p className="mb-4">{post.content}</p>

        {/* ✅ SAFE IMAGE RENDER */}
        {Array.isArray(post.images) && post.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {post.images.map((img, i) => (
              <img
                key={i}
                src={img} // ✅ Cloudinary URL ONLY
                alt="post"
                className="w-full h-48 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null; // 🔥 STOP LOOP
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t flex gap-6">
        <button onClick={handleLike}>❤️ {post.likes?.length || 0}</button>
        <button onClick={() => setShowComments(!showComments)}>
          💬 {post.comments?.length || 0}
        </button>
      </div>

      {showComments && (
        <div className="p-4 border-t">
          {post.comments?.map((c, i) => (
            <div key={i}>
              <b>{c.user?.name}:</b> {c.text}
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2 mt-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border px-2"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
