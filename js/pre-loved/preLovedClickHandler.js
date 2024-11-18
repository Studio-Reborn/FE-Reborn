/** 
File Name : preLovedClickHandler
Description : 중고거래 제품 상세 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.18  이유민      Created     
2024.11.18  이유민      Modified    상품 개별 조회 API 연동
*/
window.addEventListener("load", () => {
  const id = window.location.pathname.split("/").pop();

  readProductData(id);
});

async function readProductData(id) {
  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const productDetail = document.getElementById("productDetail");
  const userName = document.getElementById("sellUserName");
  const userProfile = document.getElementById("sellUserProfile");
  try {
    const response = await axios.get(`http://localhost:4000/product/${id}`);

    productName.innerHTML = response.data.name;
    productPrice.innerHTML = response.data.price;
    productDetail.innerHTML = response.data.detail;

    const user = await axios.get(
      `http://localhost:4000/users/${response.data.user_id}`
    );

    userName.innerHTML = user.data.nickname;

    const profile = await axios.get(
      `http://localhost:4000/profile/${user.data.profile_image_id}`
    );

    userProfile.src = `http://localhost:4000/${profile.data.url}`;

    console.log(profile);

    return;
  } catch (err) {
    console.log(err);
  }
}
