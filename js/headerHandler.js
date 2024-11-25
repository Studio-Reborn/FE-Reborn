/** 
File Name : headerHandler
Description : 헤더 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.12  이유민      Created     
2024.11.12  이유민      Modified    스크립트 파일 분리
2024.11.12  이유민      Modified    로그인 확인 추가
2024.11.13  이유민      Modified    토큰 검증 추가
2024.11.13  이유민      Modified    프로필 이미지 API 연동
2024.11.18  이유민      Modified    API 경로 수정
2024.11.23  이유민      Modified    드롭다운 UI 수정
*/
// 토큰 있을 경우 로드될 때마다 토큰 검증
window.addEventListener("load", () => {
  loginCheckInHeader();

  if (localStorage.getItem("access_token")) verifyToken();
});

// 드롭다운
document.querySelectorAll(".dropdown-item").forEach((item) => {
  item.addEventListener("click", function () {
    // 드롭다운 닫기
    const dropdown = document.getElementById("dropdownMenuButton1");
    const bsDropdown = new bootstrap.Dropdown(dropdown);
    bsDropdown.hide();
  });
});

// 로그인 확인
async function loginCheckInHeader() {
  if (localStorage.getItem("access_token")) {
    let nickname = "";
    let profileImageUrl = "";
    try {
      const response = await axios.get(`${window.API_SERVER_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      const profile = await axios.get(`${window.API_SERVER_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      nickname = response.data.nickname;
      profileImageUrl = profile.data.url;
    } catch (err) {
      console.log(err);
    }

    document.getElementById("loginCheck").innerHTML = `
    <div class="dropdown">
      <div style="margin-right: 100px; display: flex; align-items: center; cursor: pointer" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
        <p style="font-family: LINESeed-BD; font-size: 19px; margin: 0; line-height: 45px;">${nickname}</p>
        <img src="${window.API_SERVER_URL}/${profileImageUrl}" style="width: 45px; height: 45px; border-radius: 50%; margin-left: 10px;" />
      </div>

      <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1" style="margin-top: 25px; margin-right: 50px">
        <li><a class="dropdown-item" href="#" onclick="logout()">로그아웃</a></li>
        <li><a class="dropdown-item" href="/chatting">내 채팅</a></li>
        <li><a class="dropdown-item" href="/mypage">마이페이지</a></li>
      </ul>
    </div>`;
  } else {
    document.getElementById("loginCheck").innerHTML = `
     <div style="margin-right: 100px">
      <a href="/login">
        <button type="button" class="btn login-btn">로그인</button>
      </a>
    </div>`;
  }
}

// 로그아웃
function logout() {
  localStorage.clear();
  location.href = "/";
}

// 토큰 검증
async function verifyToken() {
  try {
    const response = await axios.get(`${window.API_SERVER_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  } catch (err) {
    alert("만료된 세션입니다. 다시 로그인해 주세요.");
    logout();
  }
}
