import React, { useState } from 'react';
import { postsAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuthStore();

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= IMAGE SELECT ================= */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  /* ================= REMOVE IMAGE ================= */
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  /* ================= CREATE POST ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Post content is required');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('content', content);

      images.forEach((img) => {
        formData.append('images', img);
      });

      const res = await postsAPI.create(formData);

      toast.success('Post created successfully!');
      setContent('');
      setImages([]);
      setPreviewImages([]);

      if (onPostCreated) {
        onPostCreated(res.data);
      }
    } catch (err) {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <form onSubmit={handleSubmit}>
        {/* USER */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <p className="font-medium">{user?.name || 'User'}</p>
        </div>

        {/* CONTENT */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />

        {/* IMAGE UPLOAD */}
        <div className="mt-3">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </div>

        {/* IMAGE PREVIEW */}
        {previewImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {previewImages.map((src, index) => (
              <div key={index} className="relative">
                <img
                  src={src}
                  alt="preview"
                  className="h-24 w-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
