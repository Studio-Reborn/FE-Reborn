/** 
File Name : loginHandler
Description : 로그인 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.07  이유민      Created     
2024.11.07  이유민      Modified    로그인 API 연동
2024.11.08  이유민      Modified    API 경로 수정
2024.11.12  이유민      Modified    토큰 로컬스토리지 저장 추가
2024.11.13  이유민      Modified    로그인 확인 추가
2024.11.18  이유민      Modified    API 경로 수정
*/
// 이미 로그인 된 경우 로그인 페이지 접근 불가능
window.addEventListener("load", () => {
  if (localStorage.getItem("access_token")) location.href = "/mypage";
});

document
  .getElementById("loginBtn")
  .addEventListener("click", async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const warningText = document.getElementById("warningText");

    if (!email || !password) {
      warningText.textContent = "입력하지 않은 값이 있습니다.";
      warningText.style.display = "block";

      return;
    }

    try {
      const response = await axios.post(
        `${window.API_SERVER_URL}/auth/signin`,
        {
          email,
          password,
        }
      );

      localStorage.setItem("access_token", response.data["Authorization"]);
      location.href = "/";
    } catch (err) {
      warningText.textContent = err.response.data.message;
      warningText.style.display = "block";
    }
  });
