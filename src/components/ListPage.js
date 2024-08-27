import React, { useEffect, useState } from "react";
import { blue, CustomButton } from "./CustomButton";
import { useNavigate } from "react-router-dom";
import { red } from "@mui/material/colors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import * as data from "react-dom/test-utils";

const ListPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "게시물 제목1",
      content: "게시물 내용1",
      author: "작성자",
      created_at: "작성일시",
    },
    {
      id: 2,
      title: "게시물 제목2",
      content: "게시물 내용2",
      author: "작성자",
      created_at: "작성일시",
    },
  ]);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token")?.replace("Bearer ", "");

      if (!token) {
        navigate("/login");
        return;
      } else if (token === "null") {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      if (token !== null && token !== "null") {
        const email = getEmailFromToken();
        await fetch(
          "http://ec2-13-124-38-196.ap-northeast-2.compute.amazonaws.com:8080/api/posts",
          {
            headers: {
              Authorization: token,
              Email: email,
            },
          },
        )
          .then((res) => {
            if (res.status === 403) {
              localStorage.removeItem("token");
              navigate("/");
              return;
            }
            return res.json();
          })
          .then((res) => setPosts([...res.posts]))
          .catch((err) => console.error(err));
      }
    }
    fetchData();
  }, []);

  const logoutHandler = async () => {
    const token = localStorage.getItem("token");
    const email = getEmailFromToken();

    if (!email) {
      navigate("/login");
      return;
    }
    await fetch(
      `http://ec2-13-124-38-196.ap-northeast-2.compute.amazonaws.com:8080/api/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          email,
        }),
      },
    ).then(async (res) => {
      const data = await res.json();
      try {
        localStorage.removeItem("token"); //로그인 정보 삭제
        navigate("/login");
        alert("로그아웃 되었습니다.");
      } catch (error) {
        alert(data.message);
        console.error(error);
      }
    });
  };

  const searchHandler = async (email) => {
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return;

    const { posts } = await fetch(
      `http://ec2-13-124-38-196.ap-northeast-2.compute.amazonaws.com:8080/api/posts/search?author_email=${email}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")?.replace("Bearer ", ""),
        },
      },
    )
      .then((res) => res.json())
      .catch((error) => {
        console.error(error);
      });
    if (!posts) return;
    setPosts([...posts]);
  };

  const getEmailFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      const base64Url = token.split(".")[1];
      const decodedStr = atob(base64Url.replace(/-/g, "+").replace(/_/g, "/"));
      const decodedJWT = JSON.parse(
        new TextDecoder("utf-8").decode(
          new Uint8Array(
            decodedStr.split("").map((char) => char.charCodeAt(0)),
          ),
        ),
      );

      return decodedJWT.sub;
    } catch (error) {
      alert("토큰을 파싱하는 과정에서 오류가 발생했습니다.");
      localStorage.removeItem("token");
      console.log(error);
      navigate("/");
    }
  };

  return (
    <div
      style={{
        padding: "40px",
      }}
    >
      <h1>게시판 리스트</h1>
      <div>
        <TextField
          id="standard-required"
          label="작성자 이메일 검색"
          variant="standard"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <CustomButton
          style={{ backgroundColor: blue[500] }}
          onClick={() => searchHandler(keyword)}
        >
          검색
        </CustomButton>
      </div>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>이름</TableCell>
            <TableCell>게시물내용</TableCell>
            <TableCell>작성자</TableCell>
            <TableCell>작성일시</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.map((post) => (
            <TableRow
              key={post.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              onClick={() => {
                localStorage.setItem("post", JSON.stringify({ ...post }));
                navigate(`/post/${post.id}`);
              }}
            >
              <TableCell component="th" scope="row">
                {post.title}
              </TableCell>
              <TableCell>{post.content}</TableCell>
              <TableCell>{post.author}</TableCell>
              <TableCell>{post.created_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CustomButton
        style={{ backgroundColor: blue[500] }}
        onClick={() => navigate("/post/create")}
      >
        게시글 작성
      </CustomButton>
      <CustomButton
        style={{ backgroundColor: red[500] }}
        onClick={logoutHandler}
      >
        로그아웃
      </CustomButton>
    </div>
  );
};

export default ListPage;
