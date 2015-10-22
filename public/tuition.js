var mousePressed = false;
var lastX, lastY;
var ctx;
var pageLimit = 20;
var stepLimit = 15;
var steps = new Array();
var curPage = 0;
var maxPage = 0;
var imgRecords = new Array();
var userName;
var colors = ["RGB(241,7,7)", "RGB(253,227,0)", "RGB(0,210,0)", "RGB(57,57,251)", "RGB(0,0,0)"];
var colorPath = ["/Content/images/red.png", "/Content/images/yellow.png", "/Content/images/green.png", "/Content/images/blue.png", "/Content/images/black.png"];
var guestColor = colors[4];
var guestThickness = 4;
var color = colors[4];
var thickness = 4;



// ctx = document.getElementById('myCanvas').getContext("2d");



function InitLobby() {


}

function InitBlackboard() {
    ctx = document.getElementById('myCanvas').getContext("2d");
    //var pageLimitCopy = pageLimit;
    //while (pageLimit--) {
    //    steps.push(-1);
    //    imgRecords.push(new Array());
    //}
    //steps[0] = 0;
    //imgRecords[0].push(document.getElementById('myCanvas').toDataURL());

    //$("#pages").delegate('.pageIcon', 'click', function () {
    //    switchPage($(this).parent().index());
    //});

    //$("#pages").delegate('.pageDel', 'click', function () {
    //    deletePage($(this).parent().index());
    //});

    //$("#colorList").delegate('li', 'click', function () {
    //    $("#colorSelImg").attr('src', colorPath[$(this).index()]);
    //    changeColor($(this).index());
    //});

    //$("#thicknessList").delegate('li', 'click', function () {
    //    var t = 4;
    //    var ti = $(this).index();
    //    if (ti == 0)
    //        t = 2;
    //    else if (ti == 1)
    //        t = 4;
    //    else if (ti == 2)
    //        t = 8;
    //    changeThickness(t);
    //});


    //$("#pageAdd").click("addNewPage()");


    $('#myCanvas').mousedown(function (e) {
        mousePressed = true;
        var x = e.pageX - $(this).offset().left;
        var y = e.pageY - $(this).offset().top;
        lastX = x;
        lastY = y;
    });

    $('#myCanvas').mousemove(function (e) {
        if (mousePressed) {
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;
            draw(x, y);
        }
    });

    $('#myCanvas').mouseup(function (e) {
        if (mousePressed) {
            //pushImg();
            //hub.server.pushImg(GroupId);
        }
        mousePressed = false;
    });


    $("#undo").click(function () {
        undo();
        hub.server.undo(GroupId);
    });

    $("#redo").click(function () {
        redo();
        hub.server.redo(GroupId);
    });

    if (isCaller) {
        hub.server.peerConnection(GroupId);
    }

}

function draw(x, y) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineJoin = "round";
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
    hub.server.draw(lastX, lastY, x, y, GroupId);
    lastX = x;
    lastY = y;
}

function pushImg() {
    steps[curPage]++;
    if (steps[curPage] < imgRecords[curPage].length) { imgRecords[curPage].length = steps[curPage]; }
    imgRecords[curPage].push(document.getElementById('myCanvas').toDataURL());
}

function undo() {
    if (steps[curPage] > 0) {
        steps[curPage]--;
        var canvasPic = new Image();
        canvasPic.src = imgRecords[curPage][steps[curPage]];
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(canvasPic, 0, 0);
    }
}


function redo() {
    if (steps[curPage] < imgRecords[curPage].length - 1) {
        steps[curPage]++;
        var canvasPic = new Image();
        canvasPic.src = imgRecords[curPage][steps[curPage]];
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(canvasPic, 0, 0);
    }
}

function addNewPage() {
    maxPage++;
    steps[maxPage] = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    imgRecords[maxPage].push(document.getElementById('myCanvas').toDataURL());
    switchPage(maxPage);
    $("#pages li:eq(" + (maxPage - 1) + ")").after("<li class='pageLi'><img class='pageIcon' src=''></li>");
    hub.server.addNewPage(GroupId);
}
function deletePage(pageIndex) {
    if (maxPage == 0) {
        steps[0] = 0;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        imgRecords[0] = new Array();
        imgRecords[0].push(document.getElementById('myCanvas').toDataURL());
    } else {
        for (var i = pageIndex; i < maxPage; i++) {
            imgRecords[i] = imgRecords[i + 1];
            steps[i] = steps[i + 1];
        }
        imgRecords[maxPage] = new Array();
        steps[maxPage] = -1;
        maxPage--;
        if (curPage == pageIndex) {
            switchPage(pageIndex);
        }
        $("#pages .pageLi").eq(pageIndex).remove();
    }
    hub.server.deletePage(pageIndex, GroupId);
}

function switchPage(page) {
    curPage = page;
    var canvasPic = new Image();
    canvasPic.src = imgRecords[curPage][steps[curPage]];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(canvasPic, 0, 0);
    hub.server.switchPage(page, GroupId);
}

function changeColor(colorIndex) {
    color = colors[colorIndex];
    hub.server.changeColor(colorIndex, GroupId);
}

function changeThickness(t) {
    thickness = t;
    hub.server.changeThickness(t, GroupId);
}


function showPages() {
    $.each($("#pages .pageLi"), function (index, value) {
        value.children[0].src = imgRecords[index][steps[index]];
    });
}




function clearArea() {
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    cStep[cPage] = -1;
    cPushArray[cPage] = new Array();
    cPush();
    hub.server.clear();
}



//$(document).ready(function () {
//    $('#myCarousel').carousel({
//        interval: false
//    })
//});