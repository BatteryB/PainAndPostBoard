$(document).ready(function () {4
    const $article = $('#artPost');
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/getPostImg",
        success: (response) => {
            response.forEach(post => {
                const $cloneDiv = $('#wire').clone();
                $cloneDiv.find('input[name="postId"]').val(post.postId);
                $cloneDiv.find('img').attr('src', `/imgPost/${post.postName}.png`);
                $cloneDiv.find('.postName').text(post.postName);
                $cloneDiv.find('.likeCnt').text(post.postLike);
                $cloneDiv.removeAttr('id');
                $article.append($cloneDiv);
            });
        }
    });

    $("#artPost").on('click', '.likeBtn', function (e) {
        e.preventDefault();
        const postId = $(this).closest('.likeForm').find('input[name="postId"]').val();
        
        $.ajax({
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ postId: postId }),
            url: "http://localhost:3000/addLike",
            success: () => {
                const likeCnt = $(this).closest('.likeForm').find('.likeCnt');
                likeCnt.text(parseInt(likeCnt.text()) + 1);
            }
        });
    });
});