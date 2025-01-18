/** 
File Name : clickHandler
Description : 내 마켓 상세 조회 핸들러
Author : 이유민

History
Date        Author      Status      Description
2025.01.18  이유민      Created     
2025.01.18  이유민      Modified    내 마켓 추가
*/
const id = window.location.pathname.split("/").pop();
const marketTitle = document.getElementById("marketTitle");

marketTitle.addEventListener("click", () => {
  location.href = `/eco-market/${id}`;
});

window.addEventListener("load", () => {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 사용 가능합니다.");
    location.href = "/login";
  }

  myMarket(id);
});

async function myMarket(id) {
  const market = await axios.get(`${window.API_SERVER_URL}/market/info/${id}`);

  marketTitle.innerHTML = `${market.data.market_name}`;

  const info = await axios.get(`${window.API_SERVER_URL}/market/my/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

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
  console.log(info.data);
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
