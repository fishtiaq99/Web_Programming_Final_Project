import { useState } from 'react';
import { Heart, MessageCircle, Trash2, Flag, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(!!post.isliked);
  const [likeCount, setLikeCount] = useState(Number(post.likecount) || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [showPostReport, setShowPostReport] = useState(false);
  const [postReportReason, setPostReportReason] = useState('');
  const [postReportSuccess, setPostReportSuccess] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [commentReportReason, setCommentReportReason] = useState('');
  const [commentReportSuccess, setCommentReportSuccess] = useState(false);

  const toggleLike = async () => {
    try {
      const res = await api.post(`/posts/${post.postid}/like`);
      setLiked(res.data.liked);
      setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      try {
        const res = await api.get(`/posts/${post.postid}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error('Comments error:', err);
      }
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.post(`/posts/${post.postid}/comments`, { contentText: commentText });
      const res = await api.get(`/posts/${post.postid}/comments`);
      setComments(res.data);
      setCommentText('');
    } catch (err) {
      console.error('Comment submit error:', err);
    }
  };

  const submitPostReport = async () => {
    if (!postReportReason.trim()) return;
    try {
      await api.post(`/posts/${post.postid}/report`, { reason: postReportReason });
      setPostReportSuccess(true);
      setPostReportReason('');
      setTimeout(() => { setShowPostReport(false); setPostReportSuccess(false); }, 1500);
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  const submitCommentReport = async (commentId) => {
    if (!commentReportReason.trim()) return;
    try {
      await api.post(`/comments/${commentId}/report`, { reason: commentReportReason });
      setCommentReportSuccess(true);
      setCommentReportReason('');
      setTimeout(() => { setReportingCommentId(null); setCommentReportSuccess(false); }, 1500);
    } catch (err) {
      console.error('Comment report error:', err);
    }
  };

  const canDelete = user?.id === post.userid || user?.role === 'admin';
  const hashtags = post.hashtags ? post.hashtags.split(',').filter(Boolean) : [];

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <Link to={`/profile/${post.userid}`} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-black font-black text-sm">
            {post.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm group-hover:text-orange-400 transition-colors">
              @{post.username}
            </p>
            <p className="text-gray-600 text-xs">
              {post.creationdate
                ? new Date(post.creationdate).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })
                : ''}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowPostReport(!showPostReport); setPostReportSuccess(false); }}
            className="text-gray-600 hover:text-yellow-500 transition-colors p-1.5 rounded-lg hover:bg-yellow-500/10"
            title="Report post"
          >
            <Flag size={14} />
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete?.(post.postid)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
              title="Delete post"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-3">
        <p className="text-gray-200 text-sm leading-relaxed">{post.contenttext}</p>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {hashtags.map(h => (
              <span key={h} className="text-orange-400 text-xs font-medium">#{h}</span>
            ))}
          </div>
        )}
      </div>

      {/* Post Report Box */}
      {showPostReport && (
        <div className="px-5 pb-3">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">Report Post</p>
            {postReportSuccess ? (
              <p className="text-green-400 text-xs py-2">Report submitted successfully!</p>
            ) : (
              <>
                <textarea
                  value={postReportReason}
                  onChange={e => setPostReportReason(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-xs text-gray-300 resize-none focus:outline-none focus:border-yellow-500/30"
                  rows={2}
                  placeholder="Describe the issue..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={submitPostReport}
                    className="bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowPostReport(false)}
                    className="text-gray-500 text-xs px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center gap-5">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-400 transition-colors"
        >
          <MessageCircle size={16} />
          <span>{Number(post.commentcount) || 0}</span>
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-5 pb-5 border-t border-white/5 pt-3">
          <div className="space-y-3 mb-3 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-600 text-xs">No comments yet</p>
            ) : (
              comments.map(c => (
                <div key={c.commentid}>
                  <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-black font-black text-xs flex-shrink-0 mt-0.5">
                      {c.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="bg-[#1a1a1a] rounded-xl px-3 py-2 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-orange-400 text-xs font-bold">@{c.username}</span>
                        <button
                          onClick={() => {
                            setReportingCommentId(
                              reportingCommentId === c.commentid ? null : c.commentid
                            );
                            setCommentReportReason('');
                            setCommentReportSuccess(false);
                          }}
                          className="text-gray-600 hover:text-yellow-500 transition-colors flex-shrink-0"
                          title="Report comment"
                        >
                          <Flag size={11} />
                        </button>
                      </div>
                      <p className="text-gray-300 text-xs mt-0.5">{c.contenttext}</p>
                    </div>
                  </div>

                  {/* Comment Report Box */}
                  {reportingCommentId === c.commentid && (
                    <div className="ml-8 mt-1.5">
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-2.5">
                        <p className="text-yellow-400 text-xs font-bold mb-1.5">Report Comment</p>
                        {commentReportSuccess ? (
                          <p className="text-green-400 text-xs py-1">Report submitted!</p>
                        ) : (
                          <>
                            <textarea
                              value={commentReportReason}
                              onChange={e => setCommentReportReason(e.target.value)}
                              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-xs text-gray-300 resize-none focus:outline-none focus:border-yellow-500/30"
                              rows={2}
                              placeholder="Describe the issue..."
                            />
                            <div className="flex gap-2 mt-1.5">
                              <button
                                onClick={() => submitCommentReport(c.commentid)}
                                className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-lg"
                              >
                                Submit
                              </button>
                              <button
                                onClick={() => setReportingCommentId(null)}
                                className="text-gray-500 text-xs px-2 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/30 placeholder-gray-700"
              placeholder="Write a comment..."
              maxLength={500}
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-400 text-black p-2 rounded-xl transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}