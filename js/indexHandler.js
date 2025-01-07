/** 
File Name : indexHandler
Description : 홈 화면 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.12.30  이유민      Created     
2024.12.30  이유민      Modified    홈 화면 정보 조회 API 연동
*/
window.addEventListener("load", () => {
  readHomeInfo();
});

async function readHomeInfo() {
  try {
    const info = await axios.get(`${window.API_SERVER_URL}/product/home`);

    document.getElementById("preLovedCount").innerHTML = Number(
      info.data.preLovedCnt
    ).toLocaleString();
    document.getElementById("ecoMarketCount").innerHTML = Number(
      info.data.ecoMarketCnt
    ).toLocaleString();
    document.getElementById("rebornRemakeCount").innerHTML = Number(
      info.data.rebornRemakeCnt
    ).toLocaleString();
  } catch (err) {
    console.error(err);
  }
}
