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
2024.11.28  이유민      Modified    토큰 만료 후 이동 경로 수정
2024.12.03  이유민      Modified    로그아웃 코드 추가
2024.12.04  이유민      Modified    관리자 확인 추가
2024.12.04  이유민      Modified    API 경로 수정
2024.12.05  이유민      Modified    채팅 폴더명 변경
2024.12.10  이유민      Modified    새 채팅 표시 추가
2024.12.30  이유민      Modified    예외 처리 코드 수정
2025.01.16  이유민      Modified    장바구니 UI 추가
*/
const currentChatId = window.location.pathname.split("/").pop();
const newChats = JSON.parse(localStorage.getItem("newChats")) || [];

// 토큰 있을 경우 로드될 때마다 토큰 검증
window.addEventListener("load", () => {
  loginCheckInHeader();

  const check = newChats.indexOf(currentChatId);
  if (check >= 0) {
    newChats.splice(check, 1);
    localStorage.setItem("newChats", JSON.stringify(newChats));
  }
});

const socket = io(`${window.API_SERVER_URL}`);
socket.on("new_chat_message", (data) => {
  if (data.chat_id !== currentChatId) {
    document.getElementById("newChatIndicator").style.display = "inline-block";

    if (!newChats.includes(data.chat_id)) {
      newChats.push(data.chat_id);
      localStorage.setItem("newChats", JSON.stringify(newChats));
    }
  }
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
      const response = await axios.get(`${window.API_SERVER_URL}/users/my`, {
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
      console.error(err);
    }

    document.getElementById("loginCheck").innerHTML = `
      <div style="display: flex; align-items: center;">
        <div class="dropdown">
            <div style="margin-right: 20px; display: flex; align-items: center; cursor: pointer" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
              <p style="font-family: LINESeed-BD; font-size: 19px; margin: 0; line-height: 45px;">${nickname}</p>
              <div style="position: relative; display: inline-block;">
                <img
                  src="${window.API_SERVER_URL}/${profileImageUrl}"
                  style="width: 45px; height: 45px; border-radius: 50%; margin-left: 10px;"
                />
                <span
                  id="newChatIndicator"
                  style="display: none; position: absolute; top: -5px; right: -5px; width: 12px; height: 12px; background-color: #FFCD39; border-radius: 50%;"
                ></span>
              </div>
            </div>

          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1" style="margin-top: 25px; margin-right: 50px">
            <li><a class="dropdown-item" href="/login" onclick="logout()">로그아웃</a></li>
            <li><a class="dropdown-item" href="/chat">
              <div style="position: relative; display: inline-block;">내 채팅
                <span
                  id="newChatDropdown"
                  style="display: none; position: absolute; top: 0px; right: -7px; width: 7px; height: 7px; background-color: #FFCD39; border-radius: 50%;">
                </span>
              </div>
            </a></li>
            <li><a class="dropdown-item" href="/mypage">마이페이지</a></li>
            <li id="adminDropDown" style="display: none"><a class="dropdown-item" href="/admin">관리자</a></li>
          </ul>
        </div>

        <img id="cartImg" src="/assets/icons/cart.svg" style="height: 35px; width: 35px; margin-right: 80px; cursor: pointer" onclick="moveCart()" />
      </div>
    `;

    if (newChats.length > 0) {
      document.getElementById("newChatIndicator").style.display =
        "inline-block";
      document.getElementById("newChatDropdown").style.display = "inline-block";
    }
  } else {
    document.getElementById("loginCheck").innerHTML = `
     <div style="margin-right: 100px">
      <a href="/login">
        <button type="button" class="btn login-btn">로그인</button>
      </a>
    </div>`;
  }

  if (localStorage.getItem("access_token")) verifyToken();
}

function moveCart() {
  location.href = "/cart";
}

// 로그아웃
function logout() {
  localStorage.removeItem("access_token");
  location.href = "/login";
}

// 토큰 검증
async function verifyToken() {
  try {
    const user = await axios.get(`${window.API_SERVER_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (user.data.role === "admin")
      document.getElementById("adminDropDown").style.display = "block";
  } catch (err) {
    localStorage.setItem("redirect_url", location.href);
    alert("만료된 세션입니다. 다시 로그인해 주세요.");
    logout();
  }
}
