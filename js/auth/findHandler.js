/** 
File Name : findHandler
Description : 아이디 찾기 및 비밀번호 찾기 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2025.01.19  이유민      Created     
2025.01.19  이유민      Modified    아이디 찾기 및 비밀번호 찾기 API 연동
*/
const path = window.location.pathname.split("/").pop();

window.addEventListener("load", () => {
  if (localStorage.getItem("access_token")) location.href = "/mypage";

  if (!["email", "password"].includes(path)) {
    location.href = "/404";
  }

  findData();
});

const dataFindBtn = document.getElementById("dataFindBtn");
const inputContainer = document.getElementById("inputContainer");
const warningText = document.getElementById("warningText");

function findData() {
  if (path === "email") {
    dataFindBtn.innerHTML = "아이디 찾기";
    dataFindBtn.style.display = "block";

    inputContainer.innerHTML = `
    <!-- 닉네임 입력 -->
    <div class="form-floating mb-3" style="width: 373px">
      <input type="text" class="form-control" id="nickname" placeholder="닉네임">
      <label for="nickname">닉네임</label>
    </div>

    <!-- 전화번호 입력 -->
    <div class="form-floating mb-3" style="width: 373px">
      <input type="tel" class="form-control" id="phone" placeholder="전화번호" oninput="formatPhoneNumber(this)">
      <label for="phone">전화번호</label>
    </div>
    `;
  } else if (path === "password") {
    dataFindBtn.innerHTML = "임시 비밀번호 발급하기";
    dataFindBtn.style.display = "block";

    inputContainer.innerHTML = `
    <!-- 이메일 입력 -->
    <div class="form-floating mb-3" style="width: 373px">
      <input type="email" class="form-control" id="email" placeholder="이메일">
      <label for="email">이메일</label>
    </div>

    <!-- 닉네임 입력 -->
    <div class="form-floating mb-3" style="width: 373px">
      <input type="text" class="form-control" id="nickname" placeholder="닉네임">
      <label for="nickname">닉네임</label>
    </div>

    <!-- 전화번호 입력 -->
    <div class="form-floating mb-3" style="width: 373px">
      <input type="tel" class="form-control" id="phone" placeholder="전화번호" oninput="formatPhoneNumber(this)">
      <label for="phone">전화번호</label>
    </div>
    `;
  }
}

async function findBtnClick() {
  try {
    const nickname = document.getElementById("nickname").value;
    const phone = document.getElementById("phone").value;
    if (path === "email") {
      const user = await axios.get(
        `${window.API_SERVER_URL}/auth/find-email?nickname=${nickname}&phone=${phone}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      inputContainer.innerHTML = `
    <div style="padding: 20px; text-align: center;">
        <div>
            <img id="profileImage" src="${window.API_SERVER_URL}/${user.data.profile_image_url}" alt="프로필 이미지" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;" />
        </div>

        <!-- 이메일 -->
        <div style="font-size: 16px; font-weight: bold; color: #333;">
        ${user.data.user_email}
        </div>

        <!-- 다시 찾기 버튼 -->
        <div style="margin-top: 20px;">
            <button onclick="findData()" class="global-btn" style="width: 373px;">
                다시 찾기
            </button>
        </div>

        <!-- 비밀번호 찾기 버튼 -->
        <div style="margin-top: 20px;">
            <a href="/find/password">
                <button class="global-btn" style="width: 373px;">
                    비밀번호 찾기
                </button>
            </a>
        </div>
    </div>
    `;

      dataFindBtn.style.display = "none";
      warningText.style.display = "none";
    } else if (path === "password") {
      const email = document.getElementById("email").value;

      await axios.get(
        `${window.API_SERVER_URL}/auth/find-password?nickname=${nickname}&phone=${phone}&email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      alert("이메일로 임시 비밀번호가 발급되었습니다.");

      location.href = "/login";
    }
  } catch (err) {
    warningText.style.display = "block";
    warningText.innerHTML = err.response.data.message;
  }
}

// 전화번호 입력 함수
function formatPhoneNumber(input) {
  // 숫자만 추출
  const numbers = input.value.replace(/\D/g, "");

  // 형식 지정
  const formatted = numbers.replace(
    /(\d{3})(\d{3,4})?(\d{4})?/,
    (match, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join("-")
  );

  // 포맷된 값 적용
  input.value = formatted;
}
