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
*/
// 토큰 없을 경우 마이페이지 접근 금지
window.addEventListener("load", () => {
  if (!localStorage.getItem("access_token")) location.href = "/login";

  getUserInfo();
});

// 저장 버튼 클릭 시 발생하는 이벤트
document
  .getElementById("submitBtn")
  .addEventListener("click", async function () {
    const nickname = document.getElementById("userNickname").value;

    const changePassword = document.getElementById("changePassword").value;
    const passwordCheck = document.getElementById("passwordCheck").value;
    const password = document.getElementById("password").value;

    try {
      if (nickname) await updateNickname(nickname);
      if (changePassword || passwordCheck || password)
        await updatePassword(password, changePassword, passwordCheck);

      alert("회원 정보가 수정되었습니다.");
      location.href = "/mypage";
    } catch (err) {
      console.log(err);
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

      const response = await axios.post(
        `http://localhost:4000/upload/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // 파일 업로드 시 필요한 헤더
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      alert("프로필 이미지가 변경되었습니다.");
      location.href = "/mypage/update";
    }
  } catch (err) {
    console.log(err);
  }
}

// 유저 정보 가져오기
async function getUserInfo() {
  const userNickname = document.getElementById("userNickname");
  const userProfileImg = document.getElementById("userProfileImg");

  try {
    const response = await axios.get(`http://localhost:4000/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    const profile = await axios.get(`http://localhost:4000/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    userNickname.placeholder = response.data.nickname;
    userProfileImg.src = `http://localhost:4000/${profile.data.url}`;
  } catch (err) {
    console.log(err);
  }
}

// 닉네임 수정
async function updateNickname(nickname) {
  try {
    await axios.patch(
      `http://localhost:4000/users/nickname`,
      { nickname },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
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
      `http://localhost:4000/auth/change-password`,
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
