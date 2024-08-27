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
      const res = await fetch(`http://43.200.204.217:8080${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      const token = res.headers.get("Authorization");
      const data = await res.json();
      if (path === "/api/login") {
        if (res.status === 200) {
          alert(data.message);
          localStorage.setItem("token", token);
          navigate("/");
        } else {
          alert(data.message);
          navigate("/");
        }
      } else if (path === "/api/signup") {
        if (res.status === 200) {
          alert(data.message);
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      alert(error);
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
        id="email"
        label="이메일을 입력해주세요."
        variant="outlined"
        onChange={(event) =>
          setLoginState((prev) => ({ ...prev, email: event.target.value }))
        }
      />
      <h2>비밀번호</h2>
      <TextField
        id="password"
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
