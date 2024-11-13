/** 
File Name : modalHandler
Description : 모달 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.07  이유민      Created     
2024.11.07  이유민      Modified    중고거래 물품 등록 API 연동
2024.11.07  이유민      Modified    리본 리메이크 제품 추천 API 연동
2024.11.07  이유민      Modified    리본 리메이크 제품 요청 API 연동
2024.11.08  이유민      Modified    토스트 메시지 추가
2024.11.12  이유민      Modified    물건 등록 시 헤더 추가
2024.11.12  이유민      Modified    제품 요청 시 헤더 추가
*/
document
  .getElementById("modalSubmitBtn")
  .addEventListener("click", async function () {
    const modalCheck = document
      .getElementById("modalContainer")
      .getAttribute("data-modal-check");

    if (modalCheck === "createProduct") {
      // pre-loved 물건 등록
      const name = document.getElementById("productName").value;
      const price = document.getElementById("productPrice").value;
      const detail = document.getElementById("productDetail").value;

      if (!name || !price || !detail) {
        alert("입력하지 않은 값이 있습니다.");
        return;
      }

      try {
        const response = await axios.post(
          `http://localhost:4000/product`,
          {
            name,
            price,
            detail,
            theme: "user",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        //  모달 닫기
        var modal = bootstrap.Modal.getInstance(
          document.getElementById("modalContainer")
        );
        modal.hide();

        // 정보 최신화
        preLoved();

        // 입력칸 초기화
        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("productDetail").value = "";

        // 토스트 메시지
        var toast = new bootstrap.Toast(
          document.getElementById("productRequestToast")
        );
        toast.show();
      } catch (err) {
        console.log(err);
      }
    } else if (modalCheck === "recommend") {
      // reborn-remake 제품 추천
      const thing = document.getElementById("recommendInput").value;
      const resultText = document.getElementById("recommendResult");
      const noticeText = document.getElementById("gray-600");

      if (!thing) {
        alert("입력하지 않은 값이 있습니다.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:4000/remake`, {
          params: {
            thing,
          },
        });

        resultText.innerHTML = `리메이크 추천 제품 : ${response.data.theme}<br />
        추천 이유 : ${response.data.reason}<br />`;
        noticeText.style.display = "block";
      } catch (err) {
        console.log(err);
      }
    } else if (modalCheck === "request") {
      // reborn-remake 제품 요청
      const remake_product = document.getElementById("requestInput").value;

      try {
        const response = await axios.post(
          `http://localhost:4000/remake/request`,
          {
            remake_product,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        //  모달 닫기
        var modal = bootstrap.Modal.getInstance(
          document.getElementById("modalContainer")
        );
        modal.hide();

        // 토스트 메시지
        var toast = new bootstrap.Toast(
          document.getElementById("productRequestToast")
        );
        toast.show();
      } catch (err) {
        console.log(err);
      }
    }
  });
