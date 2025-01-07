/** 
File Name : preLovedUserHandler
Description : 일반 사용자 정보 조회
Author : 이유민

History
Date        Author      Status      Description
2025.01.07  이유민      Created     
2025.01.07  이유민      Modified    일반 사용자 정보 조회 추가
*/
const user_id = window.location.pathname.split("/").pop();
const userPreLovedProductContainer = document.getElementById(
  "userPreLovedProductContainer"
);

window.addEventListener("load", () => {
  getUserInfo(user_id);
});

async function getUserInfo(user_id) {
  let containerHTML = "";

  try {
    const user = await axios.get(
      `${window.API_SERVER_URL}/users/info/${user_id}`
    );

    document.getElementById(
      "userProfileImageBig"
    ).src = `${window.API_SERVER_URL}/${user.data.profile_image_url}`;
    document.getElementById(
      "userProfileImageSmall"
    ).src = `${window.API_SERVER_URL}/${user.data.profile_image_url}`;
    document.getElementById("userName").innerHTML = user.data.nickname;

    const products = await axios.get(
      `${window.API_SERVER_URL}/product/pre-loved/user/${user_id}`
    );

    console.log(products.data);

    for (let i = 0; i < products.data.length; i++) {
      // html
      if (i % 3 === 0) containerHTML += `<div class="card-contents">`;

      containerHTML += `
              <a href="/pre-loved/${products.data[i].product_id}">
                <div class="card" style="width: 18rem">
                  <img src="${window.API_SERVER_URL}/${products.data[i].product_image[0]}" class="card-img-top" alt="..." style="height: 214px; object-fit: cover" />`;

      if (products.data[i].status !== "판매중")
        containerHTML += `<!-- 반투명 오버레이 -->
                      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 214px; 
                          background-color: rgba(255, 255, 255, 0.5);">
                        <span style="font-family: LINESeed-BD; font-size: 30px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #E35D6A">
                        ${products.data[i].product_status}
                        </span>
                      </div>`;

      containerHTML += `<div class="card-body">
            <!-- 판매명이 13글자 이상이면 12글자까지 잘라서 화면에 표시 -->
                <h5 class="card-title">${
                  products.data[i].product_name.length > 12
                    ? products.data[i].product_name.slice(0, 12) + "..."
                    : products.data[i].product_name
                }</h5>
                    <p class="card-text">${Number(
                      products.data[i].product_price
                    ).toLocaleString()}원</p>
                    <p class="card-text" style="color: #6c757d; font-size: 12px">후기 654</p>
                  </div>
                </div>
              </a>
        `;

      if (products.data.length % 3 !== 0 && i === products.data.length - 1) {
        containerHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;

        if (products.data.length % 3 === 1)
          containerHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;
      }

      if (i % 3 === 2) containerHTML += `</div>`;
    }

    userPreLovedProductContainer.innerHTML = containerHTML;
  } catch (err) {
    console.error(err);
  }
}
