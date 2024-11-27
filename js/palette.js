$(document).ready(function () {
    const $palette = $('#palette')[0];
    const paletteContext = $palette.getContext('2d');
    paletteContext.lineCap = 'round';
    paletteContext.lineJoin = 'round';
    paletteContext.lineWidth = 5;

    const $preview = $('#preview')[0];
    const previewContext = $preview.getContext('2d');
    previewContext.lineCap = 'round';
    previewContext.lineJoin = 'round';
    previewContext.lineWidth = 5;

    let drawing = false;
    let shapes = "자유";
    let startX, startY, currentX, currentY;

    let drawLog = [];
    let logIndex = -1;

    function startDrawing(x, y) {
        drawing = true;
        paletteContext.beginPath();
        paletteContext.moveTo(x, y);
        startX = x;
        startY = y;
    }

    function draw(x, y) {
        if (shapes == "자유" || shapes == "지우개") {
            paletteContext.globalCompositeOperation = shapes == "지우개" ? "destination-out" : "source-over";
            paletteContext.lineTo(x, y);
            paletteContext.stroke();
        }
    }

    function previewLine(x, y) {
        currentX = x;
        currentY = y;
        redraw();
        previewContext.beginPath();
        previewContext.moveTo(startX, startY);
        previewContext.lineTo(currentX, currentY);
        previewContext.stroke();
    }

    function previewRec(x, y) {
        currentX = x;
        currentY = y;
        redraw();
        const width = currentX - startX;
        const height = currentY - startY;
        previewContext.strokeRect(startX, startY, width, height);
    }

    function previewCircle(x, y) {
        currentX = x;
        currentY = y;
        redraw();
        const width = currentX - startX;
        const height = currentY - startY;
        previewContext.beginPath();
        previewContext.ellipse(startX + width / 2, startY + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
        previewContext.stroke();
    }

    function stopDrawing() {
        if (shapes == "직선") {
            paletteContext.beginPath();
            paletteContext.moveTo(startX, startY);
            paletteContext.lineTo(currentX, currentY);
            paletteContext.stroke();
        } else if (shapes == "사각형") {
            const width = currentX - startX;
            const height = currentY - startY;
            paletteContext.strokeRect(startX, startY, width, height);
        } else if (shapes == "원") {
            const width = currentX - startX;
            const height = currentY - startY;
            paletteContext.beginPath();
            paletteContext.ellipse(startX + width / 2, startY + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
            paletteContext.stroke();
        }
        drawing = false;
        redraw();
        
        if (logIndex < drawLog.length - 1) {
            drawLog = drawLog.slice(0, logIndex + 1);
        }

        drawLog.push($palette.toDataURL());
        logIndex++;
    }

    function loadImg(dataURL) {
        const img = new Image();
        img.src = dataURL;
        img.onload = function () {
            paletteContext.clearRect(0, 0, palette.width, palette.height);
            paletteContext.drawImage(img, 0, 0, palette.width / 2, palette.height / 2); // 반으로 줄여서 그림
        };
    }

    function redraw() {
        previewContext.clearRect(0, 0, $palette.width, $palette.height);
    }

    $('#preview').on('mousedown touchstart', function(e) {
        const offset = $(e.currentTarget).offset();
        const x = e.type === 'mousedown' ? e.clientX - offset.left : e.touches[0].clientX - offset.left;
        const y = e.type === 'mousedown' ? e.clientY - offset.top : e.touches[0].clientY - offset.top;

        if (shapes == "텍스트") {
            const text = prompt('글 입력');
            if(text == null) return;
            const fontSize = $('#lineWidth').val() * 4;
            paletteContext.font = `${fontSize}px gothic`;

            const textMetrics = paletteContext.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = fontSize;

            const fixX = x - textWidth / 2;
            const fixY = y + textHeight / 2;

            paletteContext.fillText(text, fixX, fixY);
            return;
        }

        startDrawing(x, y);
        e.preventDefault();
    }).on('mousemove touchmove', function(e) {
        if (!drawing) return;

        const offset = $(e.currentTarget).offset();
        const x = e.type === 'mousemove' ? e.clientX - offset.left : e.touches[0].clientX - offset.left;
        const y = e.type === 'mousemove' ? e.clientY - offset.top : e.touches[0].clientY - offset.top;

        if (shapes == "자유" || shapes == "지우개") draw(x, y);
        else if (shapes == "직선") previewLine(x, y);
        else if (shapes == "사각형") previewRec(x, y);
        else if (shapes == "원") previewCircle(x, y);

        e.preventDefault();
    }).on('mouseup touchend touchcancel', stopDrawing);

    $('#clearPalette').on('click', function() {
        paletteContext.clearRect(0, 0, $palette.width, $palette.height);
    });

    $('#color').on('input', function() {
        paletteContext.strokeStyle = $(this).val();
        previewContext.strokeStyle = $(this).val();
    });

    $('#lineWidth').on('input', function() {
        paletteContext.lineWidth = $(this).val();
        previewContext.lineWidth = $(this).val();
        $('#widthVal').text($(this).val());
    });

    $('input[name="shapes"]').on('change', function() {
        shapes = $('input[name="shapes"]:checked').val();
        paletteContext.globalCompositeOperation = (shapes === "지우개") ? "destination-out" : "source-over";
    });

    $('#back').on('click', () => {
        if (logIndex > 0) {
            logIndex--;
            loadImg(drawLog[logIndex]);
        }
    })

    $('#forward').on('click', () => {
        if (logIndex < drawLog.length - 1) {
            logIndex++;
            loadImg(drawLog[logIndex]);
        }
    })

    const $layerList = $('#layerList');  
    let layerCnt = 1;
    $('#addLayer').on('click', () => {
        const $layer = $('#wire').clone();
        $layer.find('.layerName').text(`레이어 ${++layerCnt}`);
        $layer.find('.cancasId').val(layerCnt);
        $layer.removeAttr('id');    
        $layerList.append($layer);
    });

    $("#layerList").on('click', '.layerRemove', function() {
        $(this).closest('.layer').remove();
    });

    // ======================
    // =========AJAX=========
    // =====================

    function removeBlocker() {
        setTimeout(() => {
            $('#sendTxt').text('이메일 전송중...');
            $('#blocker').removeClass('spin');
        }, 2500);
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
        tempCanvas.width = $palette.width;
        tempCanvas.height = $palette.height;
        const tempContext = tempCanvas.getContext('2d');

        tempContext.fillStyle = 'white';
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        tempContext.drawImage($palette, 0, 0);

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
                $('#postName').val("");
            },
            error: function (error) {
                console.error(error)
                $('#sendTxt').html('메일 전송에 실패하였습니다.');
                removeBlocker();
                $('#receptionEmail').val("");
            }
        });
    });

    $('#postImg').on('click', () => {
        const postName = $('#postName').val();

        if (postName == '') {
            alert("그림의 이름을 적어주세요.");
            return;
        }

        $('#sendTxt').text('그림 게시중...');
        $('#blocker').addClass('spin');

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = $palette.width;
        tempCanvas.height = $palette.height;
        const tempContext = tempCanvas.getContext('2d');

        // 임시 캔버스를 흰색으로 채움
        tempContext.fillStyle = 'white';
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        tempContext.drawImage($palette, 0, 0);

        // 임시 캔버스를 데이터 URL로 변환
        const dataURL = tempCanvas.toDataURL('image/png');

        $.ajax({
            type: "post",
            url: "http://localhost:3000/postImage",
            data: JSON.stringify({ image: dataURL, postName: postName }),
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
});
