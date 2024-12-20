/** 
File Name : manageHandler
Description : 관리자 활동 페이지
Author : 이유민

History
Date        Author      Status      Description
2024.12.04  이유민      Created     
2024.12.04  이유민      Modified    관리자 활동 API 연동
*/
window.addEventListener("load", () => {
  const pathSegments = window.location.pathname.split("/")[2];

  if (
    ![
      "create-eco-market",
      "delete-eco-market",
      "request-reborn-remake",
      "manage-admin",
    ].includes(pathSegments)
  ) {
    location.href = "/404";
    return;
  }

  adminManage(pathSegments);
});

async function adminManage(path) {
  let title = "";
  let dataUrl = "";
  let cardDataHTML = "";

  switch (path) {
    case "create-eco-market":
      title = "에코 마켓 신청 내역";
      dataUrl = "market/request/new";
      break;
    case "delete-eco-market":
      title = "에코 마켓 삭제 내역";
      dataUrl = "market/request/delete";
      break;
    case "request-reborn-remake":
      title = "리본 리메이크 제품 요청 내역";
      dataUrl = "remake/request";
      break;
    case "manage-admin":
      title =
        "관리자 추가/삭제 <span style='font-family: LINESeed-RG; font-size: 15px; color: #6c757d'>* 사용자 유형 클릭 시 수정 가능합니다.</span>";
      dataUrl = "users";
      break;
  }

  const response = await axios.get(`${window.API_SERVER_URL}/${dataUrl}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  // 에코마켓 승인
  if (path === "create-eco-market") {
    if (response.data.length === 0) {
      cardDataHTML += `<span style="font-family: LINESeed-RG; font-size: 20px; color: #6c757d;">에코 마켓 생성 요청이 없습니다.</span>`;
    }

    for (let i = 0; i < response.data.length; i++) {
      cardDataHTML += `
        <div class="card mb-3" style="width: 738px; height: 191px; cursor: default">
            <div class="row g-0" style="height: 100%">
                <div class="col-md-4" style="height: 100%">
                    <img src="${window.API_SERVER_URL}/${
        response.data[i].market_profile_image
      }" class="img-fluid rounded-start" alt="프로필" style="height: 100%; width: auto; object-fit: cover" />
                </div>
                <div class="col-md-8" style="height: 100%; position: relative">
                    <div class="card-text-container" style="
                        height: calc(100% - 50px); 
                        overflow-y: auto; 
                        padding-right: 10px; 
                    ">
                    <h5 class="card-title">${response.data[i].market_name}</h5>
                    <p class="card-text">
                        <small class="text-body-secondary">
                        신청 유저:
                        <span style="color: black">${
                          response.data[i].user_nickname
                        } | ${response.data[i].user_email} </span>
                        <br />
                        마켓 신청 날짜:
                        <span style="color: black">${
                          response.data[i].market_created_at.split("T")[0]
                        } </span>
                        <br />
                        마켓 설명:
                        <span style="color: black">${
                          response.data[i].market_detail
                        } </span>
                        </small>
                    </p>
                    </div>
                    <div class="card-button-container" style="
                        height: 50px; 
                        position: absolute; 
                        bottom: 0;
                        left: 0;
                        right: 0;
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;
                        padding: 10px;
                        background: white; 
                    ">
                    <button type="button" class="global-btn" onclick="checkCreateMarket(${
                      response.data[i].market_id
                    })">
                        확인
                    </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    }
  } else if (path === "delete-eco-market") {
    // 에코마켓 삭제
    for (let i = 0; i < response.data.length; i++) {
      cardDataHTML += `
            <div class="card mb-3" style="width: 738px; height: 191px; cursor: default">
                <div class="row g-0" style="height: 100%">
                    <div class="col-md-4" style="height: 100%">
                        <img src="${window.API_SERVER_URL}/${
        response.data[i].market_profile_image
      }" class="img-fluid rounded-start" alt="프로필" style="height: 100%; width: auto; object-fit: cover" />
                    </div>
                    <div class="col-md-8" style="height: 100%; position: relative">
                        <div class="card-text-container" style="
                            height: calc(100% - 50px); 
                            overflow-y: auto; 
                            padding-right: 10px; 
                        ">
                        <h5 class="card-title">${
                          response.data[i].market_name
                        }</h5>
                        <p class="card-text">
                            <small class="text-body-secondary">
                            신청 유저:
                            <span style="color: black">${
                              response.data[i].user_nickname
                            } | ${response.data[i].user_email} </span>
                            <br />
                            마켓 신청 날짜:
                            <span style="color: black">${
                              response.data[i].market_created_at.split("T")[0]
                            } </span>
                            <br />
                            마켓 설명:
                            <span style="color: black">${
                              response.data[i].market_detail
                            } </span>
                            </small>
                        </p>
                        </div>
                        <div class="card-button-container" style="
                            height: 50px; 
                            position: absolute; 
                            bottom: 0;
                            left: 0;
                            right: 0;
                            display: flex;
                            align-items: center;
                            justify-content: flex-end;
                            padding: 10px;
                            background: white; 
                        ">
                        <button type="button" class="global-btn" style="background-color: #E35D6A" onclick="checkDeleteMarket(${
                          response.data[i].market_id
                        })">
                            확인
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
  } else if (path === "request-reborn-remake") {
    // 리본 리메이크 제품 요청
    cardDataHTML += `
        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc;">
        <table class="table">
            <thead style="font-family: LINESeed-BD; position: sticky; top: 0; background-color: white; z-index: 1;">
            <tr>
                <th scope="col">#</th>
                <th scope="col">요청 사용자</th>
                <th scope="col">요청 내용</th>
                <th scope="col">클릭 시 요청이 삭제됩니다.</th>
            </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < response.data.length; i++) {
      cardDataHTML += `
            <tr>
                <th scope="row" style="font-family: LINESeed-BD">${i + 1}</th>
                <td style="font-family: LINESeed-RG">${
                  response.data[i].user_nickname
                }(${response.data[i].user_phone})</td>
                <td style="font-family: LINESeed-RG">${
                  response.data[i].request_remake_product
                }</td>
                <td style="font-family: LINESeed-RG; color: #E35D6A; cursor: pointer" onclick="deleteRequest(${
                  response.data[i].request_id
                })">삭제</td>
            </tr>
        `;

      if (i === response.data.length - 1) {
        cardDataHTML += `
            </tbody>
            </table>
            </div>
        `;
      }
    }
  } else if (path === "manage-admin") {
    // 관리자 변경
    cardDataHTML += `
        <!-- 검색 및 정렬 -->
        <div style="
            display: flex;
            justify-content: center;
            margin-top: 21px;
            margin-bottom: 21px;
        ">
            <div class="input-group mb-3" style="width: 437px; margin-right: 30px">
                <input type="text" class="form-control" id="form-select" placeholder="사용자를 검색해보세요." aria-label="Username" />
            </div>
            <div>
                <select class="form-select" id="form-select" aria-label="Default select example" style="width: 110px; text-align: center">
                <option selected value="이름순">이름순</option>
                <option value="최신순">최신순</option>
                </select>
            </div>
        </div>
        <!-- 회원 정보 -->
        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc;">
        <table class="table">
            <thead style="font-family: LINESeed-BD; position: sticky; top: 0; background-color: white; z-index: 1;">
            <tr>
                <th scope="col">#</th>
                <th scope="col">닉네임</th>
                <th scope="col">이메일</th>
                <th scope="col">전화번호</th>
                <th scope="col">사용자 유형</th>
            </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < response.data.length; i++) {
      cardDataHTML += `
            <tr>
                <th scope="row" style="font-family: LINESeed-BD">${i + 1}</th>
                <td style="font-family: LINESeed-RG">${
                  response.data[i].user_nickname
                }</td>
                <td style="font-family: LINESeed-RG">${
                  response.data[i].user_email
                }</td>
                <td style="font-family: LINESeed-RG">${
                  response.data[i].user_phone
                }</td>
                <td style="font-family: LINESeed-RG; cursor: pointer; color: #E35D6A" onclick="changeUserRole(${
                  response.data[i].user_id
                }, '${response.data[i].user_nickname}', '${
        response.data[i].user_role
      }')">${response.data[i].user_role}
                </td>
            </tr>
        `;

      if (i === response.data.length - 1) {
        cardDataHTML += `
            </tbody>
            </table>
            </div>
        `;
      }
    }
  }

  document.getElementById("adminManageTitle").innerHTML = title;
  document.getElementById("contentContainer").innerHTML = cardDataHTML;
}

// 에코 마켓 생성 승인
async function checkCreateMarket(market_id) {
  const check = confirm("이 요청을 승인하여 에코 마켓을 생성하시겠습니까?");

  if (check) {
    await axios.patch(
      `${window.API_SERVER_URL}/market/request/check/${market_id}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    alert("요청이 승인되었습니다.");
    location.reload(true);
  }
}

// 에코 마켓 삭제 승인
async function checkDeleteMarket(market_id) {
  const check = confirm("이 요청을 승인하여 에코 마켓을 삭제하시겠습니까?");

  if (check) {
    await axios.delete(`${window.API_SERVER_URL}/market/${market_id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    alert("성공적으로 삭제되었습니다.");
    location.reload(true);
  }
}

// 리본 리메이크 요청 삭제
async function deleteRequest(request_id) {
  const check = confirm(`제품 요청을 삭제하시겠습니까?`);

  if (check) {
    await axios.delete(
      `${window.API_SERVER_URL}/remake/request/${request_id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    location.reload(true);
  }
}

// 사용자 유형 변경
async function changeUserRole(user_id, user_nickname, user_role) {
  const changeRole = user_role === "admin" ? "user" : "admin";
  const change = confirm(
    `${user_nickname}님의 사용자 유형을 ${user_role}에서 ${changeRole}으로 변경하시겠습니까?`
  );

  if (change) {
    await axios.patch(`${window.API_SERVER_URL}/users/role/${user_id}`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    location.reload(true);
  }
}
