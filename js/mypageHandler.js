/** 
File Name : mypageHandler
Description : 마이페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.08  이유민      Created     
2024.11.08  이유민      Modified    모달 버튼 제거
2024.11.08  이유민      Modified    툴팁 추가
2024.11.13  이유민      Modified    사용자 정보 가져오기 추가
2024.11.13  이유민      Modified    프로필 이미지 API 연동
2024.11.18  이유민      Modified    API 경로 수정
*/
// 토큰 없을 경우 마이페이지 접근 금지
window.addEventListener("load", () => {
  if (!localStorage.getItem("access_token")) location.href = "/login";

  getUserInfo();
});

// 모달 버튼
document.getElementById("modalSubmitBtn").style.display = "none";

// 툴팁
document.addEventListener("DOMContentLoaded", function () {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
});
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

async function getUserInfo() {
  const userNickname = document.getElementById("userNickname");
  const userProfileImage = document.getElementById("userProfileImage");

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

    userNickname.innerHTML = response.data.nickname;
    userProfileImage.src = `${window.API_SERVER_URL}/${profile.data.url}`;
  } catch (err) {
    console.log(err);
  }
}
