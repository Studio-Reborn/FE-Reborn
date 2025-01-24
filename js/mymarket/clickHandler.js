/** 
File Name : clickHandler
Description : 내 마켓 상세 조회 핸들러
Author : 이유민

History
Date        Author      Status      Description
2025.01.18  이유민      Created     
2025.01.18  이유민      Modified    내 마켓 추가
2025.01.18  이유민      Modified    디버깅 코드 제거
2025.01.19  이유민      Modified    상점명 클릭 코드 리팩토링
2025.01.20  이유민      Modified    코드 리팩토링
2025.01.20  이유민      Modified    반려 관련 기능 및 UI 추가
2025.01.21  이유민      Modified    반려 이유 작성 추가
2025.01.22  이유민      Modified    예외 처리 코드 수정
*/
const id = window.location.pathname.split("/").pop();
const marketTitle = document.getElementById("marketTitle");
let marketIsVerified = 0;

const marketProfile = document.getElementById("marketProfile");
const marketName = document.getElementById("marketName");
const marketDescription = document.getElementById("marketDescription");
const rejectedTitle = document.getElementById("rejectedTitle");
const rejectedCreateMarket = document.getElementById("rejectedCreateMarket");
const rejectedReason = document.getElementById("rejectedReason");

window.addEventListener("load", () => {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 사용 가능합니다.");
    location.href = "/login";
  }

  myMarket(id);
});

async function myMarket(id) {
  const info = await axios.get(`${window.API_SERVER_URL}/market/my/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  // 마켓 신청 반려 시
  if (info.data[0].market_is_verified === "rejected") {
    rejectedCreateMarket.style.display = "block";
    rejectedTitle.innerHTML = "마켓 생성 재신청하기";
    marketProfile.setAttribute(
      "data-profile-id",
      `${info.data[0].market_profile_id}`
    );
    marketProfile.src = `${window.API_SERVER_URL}/${info.data[0].market_profile_url}`;
    marketName.value = info.data[0].market_name;
    marketDescription.textContent = info.data[0].market_detail;

    const rejection = await readRejectData();
    document.getElementById("createRejectedReason").innerHTML =
      rejection.data.reason;
  }

  // 마켓 삭제 반려 시
  if (
    info.data[0].market_is_verified === "approved" &&
    info.data[0].market_is_deletion === "rejected"
  ) {
    const rejection = await readRejectData();

    if (rejection.data.visibility === true) {
      document.getElementById("rejectedDeleteMarket").style.display = "block";
      rejectedReason.innerHTML = rejection.data.reason;

      rejectedReason.addEventListener("click", async () => {
        await removeReason(rejection.data.id);
      });
    }
  }

  marketTitle.innerHTML = info.data[0].market_name;

  marketIsVerified = info.data[0].market_is_verified;

  let infoHTML = `
    <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc; border-radius: 8px; padding: 16px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <table class="table" style="width: 100%; border-collapse: collapse; text-align: left; font-family: LINESeed-RG;">
            <thead style="font-family: LINESeed-BD; position: sticky; top: 0; background-color: #f9f9f9; z-index: 1; border-bottom: 2px solid #ddd;">
                <tr>
                    <th scope="col" style="padding: 12px;">#</th>
                    <th scope="col" style="padding: 12px;">이름</th>
                    <th scope="col" style="padding: 12px;">전화번호</th>
                    <th scope="col" style="padding: 12px; min-width: 150px;">제품명<span style="font-family: LINESeed-RG; font-size: 12px; color: #6c757d">(클릭 시 해당 페이지로 이동합니다.)</span></th>
                    <th scope="col" style="padding: 12px; text-align: center;">수량</th>
                    <th scope="col" style="padding: 12px;">우편번호</th>
                    <th scope="col" style="padding: 12px; min-width: 200px;">주소</th>
                    <th scope="col" style="padding: 12px; text-align: center;">배송상태</th>
                    <th scope="col" style="padding: 12px; text-align: center;">운송장번호</th>
                </tr>
            </thead>
            <tbody>
    `;

  for (let i = 0; i < info.data.length; i++) {
    infoHTML += `
        <tr style="border-bottom: 1px solid #ddd;">
            <th scope="row" style="font-family: LINESeed-BD; padding: 12px; text-align: center;">${
              i + 1
            }</th>
            <td style="padding: 12px;">${info.data[i].user_name}</td>
            <td style="padding: 12px;">${info.data[i].user_phone}</td>
            <td style="padding: 12px;">
            <a href="/eco-market/${id}/${
      info.data[i].product_id
    }" style="color: black">${info.data[i].product_name}
            </a>
            </td>
            <td style="padding: 12px; text-align: center;">${
              info.data[i].items_quantity
            }</td>
            <td style="padding: 12px;">${info.data[i].orders_postcode}</td>
            <td style="padding: 12px;">${info.data[i].orders_address} ${
      info.data[i].orders_detail_address
    } ${info.data[i].orders_extra_address}</td>
            <td style="padding: 12px; text-align: center;">
            <select class="form-select" style="width: 110px; text-align: center;" id="status-${
              info.data[i].items_id
            }" onchange="updateData(${
      info.data[i].items_id
    }, 'status',  this.value)">
                <option value="결제완료" ${
                  info.data[i].items_status === "결제완료" ? "selected" : ""
                }>결제완료</option>
                <option value="배송중" ${
                  info.data[i].items_status === "배송중" ? "selected" : ""
                }>배송중</option>
                <option value="배송완료" ${
                  info.data[i].items_status === "배송완료" ? "selected" : ""
                }>배송완료</option>
            </select>
            </td>
            <td style="padding: 12px; text-align: center;">
                <input type="text" class="form-control" id="tracking-${
                  info.data[i].items_id
                }" placeholder="${
      info.data[i].items_tracking_number
    }" oninput="updateData(${
      info.data[i].items_id
    }, 'tracking_number',  this.value)"/>
            </td>
        </tr>
    `;

    if (i === info.data.length - 1) {
      infoHTML += `
            </tbody>
        </table>
    </div>
    `;
    }
  }

  document.getElementById("sellingContainer").innerHTML = infoHTML;
}

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

function titleClick() {
  if (marketIsVerified !== "approved") {
    alert("마켓 오픈 전입니다.");
    return;
  }
  location.href = `/eco-market/${id}`;
}

// 승인 재신청
async function marketRetry() {
  try {
    const check = confirm(
      "재신청 이후 관리자의 승인이 완료될 때까지 수정할 수 없습니다. \n재신청하시겠습니까?"
    );

    if (check) {
      await axios.patch(
        `${window.API_SERVER_URL}/market/retry/${id}`,
        {
          profile_image_id: marketProfile.getAttribute("data-profile-id"),
          market_name: marketName.value,
          market_detail: marketDescription.value,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      alert("에코마켓 재신청이 완료되었습니다.");
      location.reload(true);
    }
  } catch (err) {
    if (err.response.data.statusCode === 409) alert(err.response.data.message);
  }
}

// 반려 사유 숨김 처리
async function removeReason(reject_id) {
  const check = confirm(
    "제거한 후에는 사유가 갱신되기 전까지 조회할 수 없습니다. \n제거하시겠습니까?"
  );

  if (check) {
    await axios.patch(
      `${window.API_SERVER_URL}/market/rejection/${reject_id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    alert("반려 사유가 숨김 처리되었습니다.");
    location.reload(true);
  }
}

// 반려 사유 조회
async function readRejectData() {
  return await axios.get(`${window.API_SERVER_URL}/market/rejection/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}

async function deleteMarket() {
  const check = confirm("마켓 신청을 철회하시겠습니까?");

  if (check) {
    await axios.delete(`${window.API_SERVER_URL}/market/rejection/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    alert("마켓 신청이 철회되었습니다.");
    history.go(-1);
    location.reload(true);
  }
}

// 마켓 커버 업로드
async function uploadFile() {
  try {
    const fileInput = document.getElementById("inputGroupFile01");
    const file = fileInput.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${window.API_SERVER_URL}/upload/profile/eco-market`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      marketProfile.src = `${window.API_SERVER_URL}/${response.data.url}`;
      marketProfile.setAttribute("data-profile-id", `${response.data.id}`);

      alert(
        "재신청 버튼을 눌러야 마켓 프로필 이미지가 정상적으로 변경됩니다. \n변경 사항을 확인 후 재신청해 주세요."
      );
      return;
    }
  } catch (err) {
    console.error(err);
  }
}
