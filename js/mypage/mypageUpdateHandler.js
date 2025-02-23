/** 
File Name : mypageUpdateHandler
Description : 회원정보 수정 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.13  이유민      Created     
2024.11.13  이유민      Modified    프로필 변경 API 연동
2024.11.13  이유민      Modified    닉네임 변경 API 연동
2024.11.13  이유민      Modified    비밀번호 변경 API 연동
2024.11.18  이유민      Modified    API 경로 수정
2024.12.04  이유민      Modified    API 경로 수정
2024.12.30  이유민      Modified    예외 처리 코드 수정
2025.01.09  이유민      Modified    사용자 정보 수정 코드 리팩토링
2025.01.19  이유민      Modified    회원 탈퇴 API 연동
2025.01.31  이유민      Modified    이미지 경로 수정
*/
// 토큰 없을 경우 마이페이지 접근 금지
window.addEventListener("load", () => {
  if (!localStorage.getItem("access_token")) location.href = "/login";

  getUserInfo();
});

// 회원 탈퇴 버튼
document.getElementById("deleteUserBtn").addEventListener("click", async () => {
  const check = confirm(
    "회원탈퇴를 진행하시겠습니까? 탈퇴 후에는 계정 복구가 불가능합니다."
  );

  try {
    if (check) {
      await axios.delete(`${window.API_SERVER_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      alert("회원 탈퇴가 성공적으로 진행되었습니다. 그동안 감사했습니다. ☺️");

      localStorage.removeItem("access_token");
      location.href = "/login";
    }
  } catch (err) {
    if (err.response.data.statusCode === 409) alert(err.response.data.message);
  }
});

// 저장 버튼 클릭 시 발생하는 이벤트
document
  .getElementById("submitBtn")
  .addEventListener("click", async function () {
    const nickname = document.getElementById("userNickname").value;
    const description = document.getElementById("userDescription").value;

    const changePassword = document.getElementById("changePassword").value;
    const passwordCheck = document.getElementById("passwordCheck").value;
    const password = document.getElementById("password").value;

    try {
      // if (nickname) await updateNickname(nickname);
      if (nickname || description)
        await updateUserInfo({ nickname, description });

      if (changePassword || passwordCheck || password)
        await updatePassword(password, changePassword, passwordCheck);

      alert("회원 정보가 수정되었습니다.");
      location.href = "/mypage";
    } catch (err) {
      console.error(err);
    }
  });

// 프로필 이미지 변경
async function uploadFile() {
  try {
    const fileInput = document.getElementById("inputGroupFile01");
    const file = fileInput.files[0]; // 선택된 첫 번째 파일

    if (file) {
      const formData = new FormData();
      formData.append("file", file); // 파일을 FormData에 추가

      await axios.post(`${window.API_SERVER_URL}/upload/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // 파일 업로드 시 필요한 헤더
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      alert("프로필 이미지가 변경되었습니다.");
      location.href = "/mypage/update";
    }
  } catch (err) {
    console.error(err);
  }
}

// 유저 정보 가져오기
async function getUserInfo() {
  const userNickname = document.getElementById("userNickname");
  const userDescription = document.getElementById("userDescription");
  const userProfileImg = document.getElementById("userProfileImg");

  try {
    const response = await axios.get(`${window.API_SERVER_URL}/users/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    userNickname.placeholder = response.data.nickname;
    userDescription.placeholder = response.data.description;
    userProfileImg.src = `${window.IMAGE_SERVER_URL}${response.data.profile_image_url}`;
  } catch (err) {
    console.error(err);
  }
}

// 사용자 정보 수정
async function updateUserInfo({ nickname, description }) {
  const requestData = {};
  if (nickname) requestData.nickname = nickname;
  if (description) requestData.description = description;

  await axios.patch(`${window.API_SERVER_URL}/users`, requestData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}

// 비밀번호 변경
async function updatePassword(password, changePassword, passwordCheck) {
  if (!password || !changePassword || !passwordCheck) {
    alert("비밀번호 변경에서 입력하지 않은 값이 있습니다.");
    throw new Error();
  }

  if (passwordCheck !== changePassword) {
    alert(
      "입력하신 비밀번호와 확인 비밀번호가 일치하지 않습니다. 다시 확인해 주세요."
    );
    throw new Error();
  }

  try {
    const response = await axios.patch(
      `${window.API_SERVER_URL}/auth/change-password`,
      {
        password,
        changePassword,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (response.data.message !== "비밀번호가 변경되었습니다.")
      throw new Error();

    return response;
  } catch (err) {
    alert(err.response.data.message);
    throw err;
  }
}
