/** 
File Name : manageHandler
Description : 관리자 활동 페이지
Author : 이유민

History
Date        Author      Status      Description
2024.12.04  이유민      Created     
2024.12.04  이유민      Modified    관리자 활동 API 연동
2025.01.10  이유민      Modified    검색 및 정렬 API 연동
2025.01.18  이유민      Modified    리본 리메이크 판매 내역 추가
2025.01.20  이유민      Modified    카드 이미지 UI 수정
2025.01.20  이유민      Modified    코드 리팩토링
2025.01.20  이유민      Modified    반려 관련 기능 및 UI 추가
*/
const pathSegments = window.location.pathname.split("/")[2];
let searchValue = undefined;
let sortValue = undefined;

window.addEventListener("load", () => {
  if (
    ![
      "create-eco-market",
      "delete-eco-market",
      "request-reborn-remake",
      "manage-admin",
      "selling-reborn-remake",
    ].includes(pathSegments)
  ) {
    location.href = "/404";
    return;
  }

  adminManage(pathSegments);
});

async function adminManage(path, searchValue, sortValue) {
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
    case "selling-reborn-remake":
      title = "리본 리메이크 제품 판매 내역";
      dataUrl = `billing/item/remake`;
      break;
    case "manage-admin":
      title =
        "관리자 추가/삭제 <span style='font-family: LINESeed-RG; font-size: 15px; color: #6c757d'>* 사용자 유형 클릭 시 수정 가능합니다.</span>";
      dataUrl = !searchValue
        ? `users?sort=${sortValue}`
        : `users?sort=${sortValue}&search=${searchValue}`;
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
      }" class="img-fluid rounded-start" alt="프로필" style="height: 100%; width: 100%; object-fit: cover" />
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
                    <button type="button" class="global-btn" onclick="updateIsVerified(${
                      response.data[i].market_id
                    }, 'rejected')" style="margin-right: 10px; background-color: #E35D6A"">
                        반려
                    </button>
                    <button type="button" class="global-btn" onclick="updateIsVerified(${
                      response.data[i].market_id
                    }, 'approved')">
                        승인
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
      }" class="img-fluid rounded-start" alt="프로필" style="height: 100%; width: 100%; object-fit: cover" />
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
                            justify-content: space-between;
                            background: white; 
                        ">
                        <textarea id="rejectionReason" class="form-control" placeholder="반려 이유를 입력하세요" style="height: 39px; width: 70%; resize: none;" onkeydown="preventEnter(event)"></textarea>
                        <div style="display: flex;">
                    <button type="button" class="global-btn" onclick="checkDeleteMarket(${
                      response.data[i].market_id
                    }, 'rejected')" style="margin-right: 10px; background-color: #E35D6A"">
                        반려
                    </button>
                        <button type="button" class="global-btn" onclick="checkDeleteMarket(${
                          response.data[i].market_id
                        }, 'approved')">
                            승인
                        </button>
                        </div>
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
  } else if (path === "selling-reborn-remake") {
    let cardDataHTML = `
    <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc; border-radius: 8px; padding: 16px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <table class="table" style="width: 100%; border-collapse: collapse; text-align: left; font-family: LINESeed-RG;">
            <thead style="font-family: LINESeed-BD; position: sticky; top: 0; background-color: #f9f9f9; z-index: 1; border-bottom: 2px solid #ddd;">
                <tr>
                    <th scope="col" style="padding: 12px;">#</th>
                    <th scope="col" style="padding: 12px;">이름</th>
                    <th scope="col" style="padding: 12px;">전화번호</th>
                    <th scope="col" style="padding: 12px; min-width: 150px;">제품명</th>
                    <th scope="col" style="padding: 12px; text-align: center;">수량</th>
                    <th scope="col" style="padding: 12px;">우편번호</th>
                    <th scope="col" style="padding: 12px; min-width: 200px;">주소</th>
                    <th scope="col" style="padding: 12px; text-align: center;">배송상태</th>
                    <th scope="col" style="padding: 12px; text-align: center;">운송장번호</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < response.data.length; i++) {
      cardDataHTML += `
        <tr style="border-bottom: 1px solid #ddd;">
            <th scope="row" style="font-family: LINESeed-BD; padding: 12px; text-align: center;">${
              i + 1
            }</th>
            <td style="padding: 12px;">${response.data[i].user_name}</td>
            <td style="padding: 12px;">${response.data[i].user_phone}</td>
            <td style="padding: 12px;">
            <a href="/reborn-remake/${
              response.data[i].product_id
            }" style="color: black">${response.data[i].product_name}
            </a>
            </td>
            <td style="padding: 12px; text-align: center;">${
              response.data[i].items_quantity
            }</td>
            <td style="padding: 12px;">${response.data[i].orders_postcode}</td>
            <td style="padding: 12px;">${response.data[i].orders_address} ${
        response.data[i].orders_detail_address
      } ${response.data[i].orders_extra_address}</td>
            <td style="padding: 12px; text-align: center;">
            <select class="form-select" style="width: 110px; text-align: center;" id="status-${
              response.data[i].items_id
            }" onchange="updateData(${
        response.data[i].items_id
      }, 'status',  this.value)">
                <option value="결제완료" ${
                  response.data[i].items_status === "결제완료" ? "selected" : ""
                }>결제완료</option>
                <option value="배송중" ${
                  response.data[i].items_status === "배송중" ? "selected" : ""
                }>배송중</option>
                <option value="배송완료" ${
                  response.data[i].items_status === "배송완료" ? "selected" : ""
                }>배송완료</option>
            </select>
            </td>
            <td style="padding: 12px; text-align: center;">
                <input type="text" class="form-control" id="tracking-${
                  response.data[i].items_id
                }" placeholder="${
        response.data[i].items_tracking_number
      }" oninput="updateData(${
        response.data[i].items_id
      }, 'tracking_number',  this.value)"/>
            </td>
        </tr>
    `;
    }

    cardDataHTML += `
            </tbody>
        </table>
    </div>
    `;

    document.getElementById("sellingRemake").innerHTML = cardDataHTML;
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
              <input type="text" class="form-control" id="adminSearch" placeholder="사용자를 검색해보세요." oninput="searchContent()">
              <button class="global-btn" type="button" id="searchButton" onclick="logInputValue()" style="width: 70px">초기화</button>
            </div>
            <div>
                <select class="form-select" id="adminSort" style="width: 110px; text-align: center" onchange="logChangeInput(event)">
                  <option ${
                    sortValue === "name" ? "selected" : ""
                  } value="name">이름순</option>
                  <option  ${
                    sortValue === "latest" ? "selected" : ""
                  } value="latest">최신순</option>
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

  if (path !== "selling-reborn-remake")
    document.getElementById("contentContainer").innerHTML = cardDataHTML;
}

// 에코 마켓 승인 요청 수정
async function updateIsVerified(market_id, is_verified) {
  const check =
    is_verified === "approved"
      ? confirm("이 요청을 승인하시겠습니까?")
      : confirm("이 요청을 반려하시겠습니까?");

  if (check) {
    await axios.patch(
      `${window.API_SERVER_URL}/market/request/check/${market_id}`,
      { is_verified },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    alert("정상 처리되었습니다.");
    location.reload(true);
  }
}

// 에코 마켓 삭제 요청 수정
async function checkDeleteMarket(market_id, is_deletion_requested) {
  const reason = document.getElementById("rejectionReason").value;
  const check =
    is_deletion_requested === "approved"
      ? confirm("이 요청을 승인하시겠습니까?")
      : confirm("이 요청을 반려하시겠습니까?");

  if (check) {
    if (reason === "") {
      alert("반려 이유를 작성해주세요.");
      return;
    }

    await axios.delete(
      `${window.API_SERVER_URL}/market/${market_id}?is_deletion_requested=${is_deletion_requested}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    await axios.post(
      `${window.API_SERVER_URL}/market/rejection/${market_id}`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    alert("정상 처리되었습니다.");
    location.reload(true);
  }
}

function preventEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
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

// 리본 리메이크 판매 상태 변경
async function updateData(item_id, name, value) {
  await axios.patch(
    `${window.API_SERVER_URL}/billing/item/${item_id}`,
    { [name]: value },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );
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

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const adminSortElement = document.getElementById("adminSort");
    sortValue = adminSortElement ? adminSortElement.value : "name";
  }, 100); // 렌더링 완료를 기다림
});

function searchContent() {
  const searchInput = document.getElementById("adminSearch");
  const searchButton = document.getElementById("searchButton");

  if (searchInput.value === "") {
    searchButton.textContent = "초기화"; // 입력값이 없으면 "초기화"
  } else {
    searchButton.textContent = "검색"; // 입력값이 있으면 "검색"
  }
}

// 검색값 입력 시
async function logInputValue() {
  searchValue = document.getElementById("adminSearch").value;
  await adminManage(pathSegments, searchValue, sortValue);
}

// 정렬
async function logChangeInput(event) {
  sortValue = event.target.value;
  await adminManage(pathSegments, searchValue, sortValue);
}
