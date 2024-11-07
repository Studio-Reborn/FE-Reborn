/** 
File Name : loginHandler
Description : 로그인 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.07  이유민      Created     
2024.11.07  이유민      Modified    로그인 API 연동
*/
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
      const response = await axios.post(`http://localhost:4000/signin`, {
        email,
        password,
      });

      location.href = "/";
    } catch (err) {
      warningText.textContent = err.response.data.message;
      warningText.style.display = "block";
    }
  });
