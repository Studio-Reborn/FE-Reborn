/** 
File Name : indexHandler
Description : 관리자 메인 페이지
Author : 이유민

History
Date        Author      Status      Description
2024.12.04  이유민      Created     
2024.12.04  이유민      Modified    관리자 API 연동
*/
window.addEventListener("load", async () => {
  const createMarket = await axios.get(
    `${window.API_SERVER_URL}/market/request/new`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );

  const deleteMarket = await axios.get(
    `${window.API_SERVER_URL}/market/request/delete`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );

  const requestReborn = await axios.get(
    `${window.API_SERVER_URL}/remake/request`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );

  document.getElementById("createEcoMarketNum").innerHTML =
    createMarket.data.length;
  document.getElementById("deleteEcoMarketNum").innerHTML =
    deleteMarket.data.length;
  document.getElementById("requestRemakeNum").innerHTML =
    requestReborn.data.length;
});
