import React, { useState } from "react";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { blue, CustomButton } from "./CustomButton";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
    username: "",
  });

  const loginHandler = async (path, email, password, username) => {
    try {
      const res = await fetch(`http://localhost:8080${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      const token = res.headers.get("Authorization");
      if (path === "/api/login") {
        if (res.status === 404) {
          alert("이메일을 찾을 수 없습니다.");
          navigate("/");
          return;
        } else if (res.status === 406) {
          alert("접근할 수 없습니다.");
          navigate("/");
          return;
        } else if (res.status === 200) {
          alert("로그인 되었습니다.");
        }
        localStorage.setItem("token", token);
        navigate("/");
      } else if (path === "/api/signup") {
        if (res.status === 400) {
          alert("중복된 아이디 입니다.");
        } else if (res.status === 200) {
          alert("성공적으로 가입되었습니다.");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div
      style={{
        padding: "40px",
      }}
    >
      <h1>로그인 페이지</h1>
      <h2>이메일</h2>
      <TextField
        id="outlined-basic"
        label="이메일을 입력해주세요."
        variant="outlined"
        onChange={(event) =>
          setLoginState((prev) => ({ ...prev, email: event.target.value }))
        }
      />
      <h2>비밀번호</h2>
      <TextField
        id="outlined-basic"
        label="비밀번호를 입력해주세요."
        variant="outlined"
        type="password"
        onChange={(event) =>
          setLoginState((prev) => ({ ...prev, password: event.target.value }))
        }
      />
      <h2>사용자 이름</h2>
      <TextField
        id="username"
        label="사용자 이름을 입력해주세요."
        variant="outlined"
        onChange={(event) =>
          setLoginState((prev) => ({
            ...prev,
            username: event.target.value,
          }))
        }
      />
      <div
        style={{
          marginTop: "20px",
        }}
      >
        <CustomButton
          style={{ backgroundColor: blue[900] }}
          onClick={() =>
            loginHandler(
              "/api/signup",
              loginState.email,
              loginState.password,
              loginState.username,
            )
          }
        >
          회원가입
        </CustomButton>
        <CustomButton
          style={{ backgroundColor: blue[500] }}
          onClick={() =>
            loginHandler("/api/login", loginState.email, loginState.password)
          }
        >
          로그인
        </CustomButton>
      </div>
    </div>
  );
};

export default LoginPage;
