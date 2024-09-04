import React, { useEffect, useState } from "react";
import { Card, CardContent, TextField, Typography } from "@mui/material";
import { red } from "@mui/material/colors";
import { blue, CustomButton } from "./CustomButton";
import { StyledTextarea } from "./StyledTextArea";
import { useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const PostDetailPage = () => {
  const navigate = useNavigate();
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([
    {
      id: 1,
      content: "댓글 내용",
      author: "작성자1",
      postId: 1,
      createdAt: "작성일시",
    },
    {
      id: 2,
      content: "댓글 내용",
      author: "작성자2",
      postId: 1,
      createdAt: "작성일시",
    },
  ]);
  const [newComment, setNewComment] = useState({
    content: "",
    author: "",
  });
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  async function fetchData() {
    const post = JSON.parse(localStorage.getItem("post"));
    await fetch(`http://localhost:8080/api/comments`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res) return;
        setComments([...res.comments.filter((c) => c?.postId === post.id)]);
      })
      .catch((err) => console.error(err));
  }

  useEffect(() => {
    const postData = JSON.parse(localStorage.getItem("post"));
    setPost({ ...postData });
    setLiked(postData.liked);
    setLikes(postData.likeCount || 0);
    try {
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }, [post.id]);

  const handlePostChange = async () => {
    const email = getEmailFromToken();
    await fetch(`http://localhost:8080/api/posts/${post.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        title: post?.title || "",
        content: post?.content || "",
        email: email,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        alert(data.message);
      })
      .then(() => navigate("/"))
      .catch((err) => {
        console.error(err);
      });
  };

  const handlePostDelete = async () => {
    const email = getEmailFromToken();
    await fetch(`http://localhost:8080/api/posts/${post.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        email: email,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        alert(data.message);
      })
      .then(() => navigate("/"))
      .catch((err) => {
        alert(err);
        console.error(err);
      });
  };

  const handleLike = async () => {
    const email = getEmailFromToken();
    await fetch(`http://localhost:8080/api/posts/${post.id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        email: email,
        postId: `${post.id}`,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        alert(data.message);
        setLiked(data.liked);
        setLikes(data.likeCount);

        const post = JSON.parse(localStorage.getItem("post"));

        if (post) {
          post.likeCount = data.likeCount;
          post.liked = data.liked;
          localStorage.setItem("post", JSON.stringify(post));
        }
      })
      .catch((err) => console.error(err));
  };

  const submitComment = async () => {
    const email = getEmailFromToken();
    if (!newComment.author || !newComment.content) {
      alert("작성자와 내용을 입력하세요");
      return;
    }
    await fetch(`http://localhost:8080/api/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        author: newComment.author,
        content: newComment.content,
        postId: post.id,
        email: email,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        alert(data.message);
        setComments([...comments], data.comment);
        setNewComment({ content: "", author: "" });
        fetchData();
      })
      .catch((err) => console.error(err));
  };

  const handleCommentChange = async (id, content) => {
    const email = getEmailFromToken();
    await fetch(`http://localhost:8080/api/comments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        email: email,
        content: content,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        alert(data.message);
        fetchData();
      })
      .catch((err) => console.error(err));
  };

  const handleCommentDelete = async (id) => {
    const email = getEmailFromToken();
    await fetch(`http://localhost:8080/api/comments/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        email: email,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        alert(data.message);
        fetchData();
      })
      .catch((err) => console.error(err));
  };

  const changeComment = (commentId, comment) => {
    const indexToUpdate = comments.findIndex((item) => item.id === commentId);

    const newComments = comments;
    if (indexToUpdate !== -1) {
      newComments[indexToUpdate] = {
        ...newComments[indexToUpdate],
        content: comment,
      };
      setComments([...newComments]);
    }
  };

  const getEmailFromToken = () => {
    const token = localStorage.getItem("token");
    const base64Url = token.split(".")[1];
    const decodedStr = atob(base64Url.replace(/-/g, "+").replace(/_/g, "/"));
    const decodedJWT = JSON.parse(
      new TextDecoder("utf-8").decode(
        new Uint8Array(decodedStr.split("").map((char) => char.charCodeAt(0))),
      ),
    );

    return decodedJWT.sub;
  };

  return (
    <div
      style={{
        padding: "40px",
      }}
    >
      <h1>게시판 상세</h1>
      <h2>글 제목</h2>
      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        value={post?.title || ""}
        onChange={(event) =>
          setPost((prev) => ({
            ...prev,
            title: event.target.value,
          }))
        }
      />
      <h2>작성자</h2>
      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        value={post?.author || ""}
        onChange={(event) =>
          setPost((prev) => ({
            ...prev,
            author: event.target.value,
          }))
        }
      />
      <h2>본문</h2>
      <StyledTextarea
        aria-label="minimum height"
        minRows={3}
        placeholder="Minimum 3 rows"
        value={post?.content || ""}
        onChange={(event) =>
          setPost((prev) => ({
            ...prev,
            content: event.target.value,
          }))
        }
      />
      <div
        style={{
          marginTop: "20px",
        }}
      >
        <CustomButton
          style={{ backgroundColor: blue[500] }}
          onClick={handlePostChange}
        >
          수정
        </CustomButton>
        <CustomButton
          style={{ backgroundColor: red[500] }}
          onClick={handlePostDelete}
        >
          삭제
        </CustomButton>
        <CustomButton
          style={{ backgroundColor: red[500] }}
          onClick={() => navigate("/")}
        >
          취소
        </CustomButton>
        <CustomButton
          style={{ backgroundColor: blue[500] }}
          onClick={handleLike}
        >
          {liked ? <AiFillHeart /> : <AiOutlineHeart />} 좋아요{" "}
          <Typography variant="h">{likes}</Typography>
        </CustomButton>
      </div>
      <div style={{ marginTop: 20 }}>
        <Card sx={{ marginBottom: 2 }}>
          <CardContent style={{ display: "flex", flexDirection: "column" }}>
            <h3>댓글 작성자</h3>
            <TextField
              variant="outlined"
              value={newComment.author || ""}
              onChange={(event) =>
                setNewComment((prev) => ({
                  ...prev,
                  author: event.target.value,
                }))
              }
            />
            <h3>댓글 내용</h3>
            <TextField
              variant="outlined"
              value={newComment.content || ""}
              onChange={(event) =>
                setNewComment((prev) => ({
                  ...prev,
                  content: event.target.value,
                }))
              }
            />
            <CustomButton
              style={{ backgroundColor: blue[500], marginTop: 10 }}
              onClick={submitComment}
            >
              생성
            </CustomButton>
          </CardContent>
        </Card>
        {comments.length > 0 &&
          comments.map((c, index) => (
            <Card sx={{ marginBottom: 2 }} key={c.id}>
              <CardContent>
                <TextField
                  variant="outlined"
                  value={c?.content || ""}
                  onChange={(event) => changeComment(c.id, event.target.value)}
                />
                <Typography variant="h5" component="div">
                  {c?.author || ""}
                </Typography>
                <Typography color="text.secondary">
                  {c?.created_at || ""}
                </Typography>
                <CustomButton
                  style={{ backgroundColor: blue[500] }}
                  onClick={() => handleCommentChange(c.id, c.content)}
                >
                  수정
                </CustomButton>
                <CustomButton
                  style={{ backgroundColor: red[500] }}
                  onClick={() => handleCommentDelete(c.id)}
                >
                  삭제
                </CustomButton>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default PostDetailPage;
