/**@type {WebGL2RenderingContext} */

$(document).ready(function () {
    const $palette = $('#palette');
    const $preview = $('#preview');
    const paletteContext = $palette[0].getContext('2d');
    paletteContext.lineCap = 'round'; // 선 끝을 둥글게
    paletteContext.lineJoin = 'round'; // 선의 교차점이 둥글게

    const previewContext = $preview[0].getContext('2d');
    previewContext.lineCap = 'round';
    previewContext.lineJoin = 'round';

    let isPainting = false;
    let isEraser = false;
    let color = '#000000';
    let shapes = "자유";
    let lineWidth = 5;
    let startX, startY;

    let canvasArr = [];
    let backCnt = 0;
    let isBack = false;

    // 마우스 클릭이 눌리면
    $palette.on('mousedown', (e) => {
        isPainting = true;
        startX = e.clientX - $preview.offset().left;
        startY = e.clientY - $preview.offset().top;
        paletteContext.moveTo(startX, startY);

        if (shapes == "자유" || isEraser) {
            paletteContext.beginPath();
        } else if (shapes == "텍스트") {
            startX = e.clientX - $preview.offset().left;
            startY = e.clientY - $preview.offset().top;

            const textBox = prompt("텍스트를 입력해주세요.");
            if (textBox == "" || textBox == null) {
                alert("아무것도 입력되지 않았습니다.");
                return;
            }

            paletteContext.font = `36px Arial`;
            paletteContext.fillStyle = color;

            const textMetrics = paletteContext.measureText(textBox);
            const textWidth = textMetrics.width;
            const textHeight = 24 * 0.7;
            startX = startX - textWidth / 2;
            startY = startY + textHeight / 2;

            paletteContext.fillText(textBox, startX, startY);
        }
    });

    // 마우스가 움직이면
    $palette.on('mousemove', (e) => {
        if (!isPainting) return;

        const endX = e.clientX - $preview.offset().left;
        const endY = e.clientY - $preview.offset().top;

        // 지우개 모드 설정 / destination-out : 지우개 / source-over : 그리기
        paletteContext.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';

        if (shapes == "자유" || isEraser) {
            paletteContext.lineTo(endX, endY);
            paletteContext.strokeStyle = color;
            paletteContext.lineWidth = lineWidth;
            paletteContext.stroke();
        } else {
            previewContext.clearRect(0, 0, $preview[0].width, $preview[0].height);
            previewContext.beginPath();
            previewContext.strokeStyle = color;
            previewContext.lineWidth = lineWidth;

            if (shapes == "직선") {
                previewContext.moveTo(startX, startY);
                previewContext.lineTo(endX, endY);
            } else if (shapes == "사각형") {
                previewContext.rect(startX, startY, endX - startX, endY - startY);
            } else if (shapes == "원") {
                const radiusX = Math.abs(endX - startX) / 2;
                const radiusY = Math.abs(endY - startY) / 2;
                const centerX = (startX + endX) / 2;
                const centerY = (startY + endY) / 2;
                previewContext.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            }

            previewContext.stroke();
        }
    });

    // 마우스 클릭이 끝나면
    $palette.on('mouseup', (e) => {
        const endX = e.clientX - $preview.offset().left;
        const endY = e.clientY - $preview.offset().top;
        drowingShapes(endX, endY);
        isPainting = false;

        saveCanvas();
        isBack = true
    });

    // 마우스가 팔레트 밖으로 나가면
    $palette.on('mouseleave', () => {
        isPainting = false;
        paletteContext.closePath();
        drowingShapes();
        saveCanvas();
    });

    // 색
    $('#color').on('input', (e) => {
        color = $(e.target).val();
    });

    // 굵기
    $('#lineWidth').on('input', (e) => {
        lineWidth = $(e.target).val();
        $("#widthVal").text(lineWidth);
    });

    // 지우개
    $('#eraser').on('click', () => {
        isEraser = !isEraser;
    });

    // 캔버스 전체 지우기
    $('#clearPalette').on('click', () => {
        paletteContext.clearRect(0, 0, $palette[0].width, $palette[0].height);
        saveCanvas();
    });

    // 도형 버튼이 눌리면
    $('input[name="shapes"]').on('change', () => {
        shapes = $('#shapes:checked').val();
    });

    // 뒤로 or 앞으로 버튼이 눌리면
    $('#back, #forward').on('click', function () {
        if (!isBack) return;

        if ($(this).attr('id') == 'back' && backCnt > 0) {
            backCnt--;
        } else if ($(this).attr('id') == 'forward' && backCnt < canvasArr.length - 1) {
            backCnt++;
        }

        paletteContext.clearRect(0, 0, $palette[0].width, $palette[0].height);

        paletteContext.save();
        paletteContext.globalCompositeOperation = 'source-over';

        paletteContext.scale(0.5, 0.5);
        paletteContext.drawImage(canvasArr[backCnt], 0, 0);
        paletteContext.restore();
    });

    // 팔레트에 도형 적용하는 함수
    function drowingShapes(endX, endY) {
        if (shapes != "자유") {
            paletteContext.beginPath();
            paletteContext.strokeStyle = color;
            paletteContext.lineWidth = lineWidth;

            if (shapes == "직선") {
                paletteContext.moveTo(startX, startY);
                paletteContext.lineTo(endX, endY);
            } else if (shapes == "사각형") {
                paletteContext.rect(startX, startY, endX - startX, endY - startY);
            } else if (shapes == "원") {
                const radiusX = Math.abs(endX - startX) / 2;
                const radiusY = Math.abs(endY - startY) / 2;
                const centerX = (startX + endX) / 2;
                const centerY = (startY + endY) / 2;
                paletteContext.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            }
            paletteContext.stroke();
        }
        previewContext.closePath();
        previewContext.clearRect(0, 0, $preview[0].width, $preview[0].height);
    }

    // 뒤로가기 or 앞으로가기 캔버스 저장
    function saveCanvas() {
        if (backCnt < canvasArr.length - 1) {
            canvasArr = canvasArr.slice(0, backCnt + 1);
        }

        // 새로운 캔버스 생성
        const createcanvas = document.createElement('canvas');

        // 캔버스 사이즈 똑같이
        createcanvas.width = $palette[0].width;
        createcanvas.height = $palette[0].height;

        const canvasContext = createcanvas.getContext('2d');

        if (isEraser) canvasContext.globalCompositeOperation = 'source-over';

        // 팔레트 내용 복사
        canvasContext.drawImage($palette[0], 0, 0);

        canvasArr.push(createcanvas);
        backCnt = canvasArr.length - 1
    }

    // 캔버스 이미지저장 => 이메일 전송
    $('#sendEmail').on('click', () => {
        const receptionEmail = $('#receptionEmail').val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (receptionEmail == "") {
            alert("이메일 주소를 입력해주세요.\n예) example@address.com");
            return;
        }

        if (!emailRegex.test(receptionEmail)) {
            alert("올바른 이메일 형식을 입력해주세요.\n예) example@address.com");
            return;
        }

        $('#blocker').addClass('spin');

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = $palette[0].width;
        tempCanvas.height = $palette[0].height;
        const tempContext = tempCanvas.getContext('2d');

        // 임시 캔버스를 흰색으로 채움
        tempContext.fillStyle = 'white';
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        tempContext.drawImage($palette[0], 0, 0);

        // 임시 캔버스를 데이터 URL로 변환
        const dataURL = tempCanvas.toDataURL('image/png');

        $.ajax({
            type: "POST",
            url: "http://localhost:3000/saveImage",
            data: JSON.stringify({ image: dataURL }),
            contentType: "application/json",
            success: function (response) {
            },
            error: function (error) {
                console.error("Error:", error);
            }
        });

        $.ajax({
            type: "POST",
            url: "http://localhost:3000/sendEmail",
            data: JSON.stringify({ email: receptionEmail }),
            contentType: "application/json",
            success: function (response) {
                $('#sendTxt').html('그림을 메일로 전송하였습니다.<br>메일을 확인해주세요');
                removeBlocker();
            },
            error: function (error) {
                console.error(error)
                $('#sendTxt').html('메일 전송에 실패하였습니다.');
                removeBlocker();
            }
        });
    });

    function removeBlocker() {
        setTimeout(() => {
            $('#sendTxt').text('이메일 전송중...');
            $('#blocker').removeClass('spin');
        }, 1000);
    }

    //========이미지 슬라이드=======

    $('#postImg').on('click', () => {
        $('#sendTxt').text('그림 게시중...');
        $('#blocker').addClass('spin');

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = $palette[0].width;
        tempCanvas.height = $palette[0].height;
        const tempContext = tempCanvas.getContext('2d');

        // 임시 캔버스를 흰색으로 채움
        tempContext.fillStyle = 'white';
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        tempContext.drawImage($palette[0], 0, 0);

        // 임시 캔버스를 데이터 URL로 변환
        const dataURL = tempCanvas.toDataURL('image/png');

        $.ajax({
            type: "post",
            url: "http://localhost:3000/postImage",
            data: JSON.stringify({ image: dataURL }),
            contentType: "application/json",
            success: function (response) {
                $('#sendTxt').text('그림이 게시되었습니다.');
                removeBlocker();
            },
            error: function (error) {
                $('#sendTxt').text('그림 게시에 실패했습니다.');
                removeBlocker();
            }
        });
    })

    let slideNum = 1;
    let imgClassNum = 1;
    $.ajax({
        url: `http://localhost:3000/next-img/${slideNum}`,
        method: 'post',
        success: function (data) {
            if (data.num == 0) {
                return;
            }
            slideNum = data.num;
        }
    })

    let imgSlide = setInterval(() => {
        $.ajax({
            url: `http://localhost:3000/next-img/${slideNum}`,
            method: 'post',
            success: function (data) {
                if (data.num == 0) {
                    return;
                }

                if (data.num == 1) {
                    slideNum = 1;
                }

                $('#imgView').append(`<img src="imgPost/post${slideNum}.png" alt="imgPost/post${slideNum}.png" class="post${imgClassNum}">`);
                slideNum++

                const nowClassNum = imgClassNum;
                $(`.post${nowClassNum}`).animate({
                    top: '1080px'
                }, 25000, 'linear', function () {
                    $(`.post${nowClassNum}`).remove();
                })
                imgClassNum++
            }
        })
    }, 3500);
});