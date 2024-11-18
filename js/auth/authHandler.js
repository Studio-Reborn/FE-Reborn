/** 
File Name : authHandler
Description : 회원가입 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.07  이유민      Created     
2024.11.07  이유민      Modified    회원가입 API 연동
2024.11.08  이유민      Modified    API 경로 수정
2024.11.13  이유민      Modified    로그인 확인 추가
2024.11.18  이유민      Modified    API 경로 수정
*/
// 이미 로그인 된 경우 회원가입 페이지 접근 불가능
window.addEventListener("load", () => {
  if (localStorage.getItem("access_token")) location.href = "/mypage";
});

document
  .getElementById("signUpBtn")
  .addEventListener("click", async function () {
    const nickname = document.getElementById("nickname").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordCheck = document.getElementById("passwordCheck").value;

    const warningText = document.getElementById("warningText");

    if (!nickname || !phone || !email || !password || !passwordCheck) {
      warningText.textContent = "입력하지 않은 값이 있습니다.";
      warningText.style.display = "block";

      return;
    }

    if (password !== passwordCheck) {
      warningText.textContent =
        "비밀번호가 일치하지 않습니다. 다시 확인해주세요.";
      warningText.style.display = "block";

      return;
    }

    try {
      const response = await axios.post(
        `${window.API_SERVER_URL}/auth/signup`,
        {
          nickname,
          email,
          password,
          phone,
        }
      );

      alert("회원가입이 성공적으로 완료되었습니다.");
      location.href = "/login";
    } catch (err) {
      warningText.textContent = err.response.data.message;
      warningText.style.display = "block";
    }
  });
