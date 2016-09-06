var winHeight=window.screen.height;
var winWidth=window.screen.width;
var webHref=window.location.href;
var agentData;
var agentNow;
var agentList=[];
var agentTime;
var equiName;
var upMessageDate;
var agentMessage;
var fnList=[];
var powerNow;
var maxNow;
var minNow;
var unitNow;
var powerUpTime;
var productName;
var productID;
var pickervalue;
var xArry=[];
var userToken;
var ajCode=GetQueryString("code");
var agentUrl = 'http://weixin.j1st.io/website/userToken?code='+ajCode;
//var url = 'https://192.167.1.1:8080/getInfo?code='+ajCode;
$.init();
Array.prototype.unique= function(){
    var res = [];
    var json = {};
    for(var i = 0; i < this.length; i++){
        if(!json[this[i]]){
            res.push(this[i]);
            json[this[i]] = 1;
        }
    }
    return res;
};
function GetQueryString(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  r[2];
}
$.ajax({
    type: 'GET',
    url: agentUrl ,
    success: function(data) {
        userToken=data;
        getAgentForm(data);
    },
    error:function (data) {
        console.log("服务器故障，请稍后再试。")
    }
});
function getAgentForm(data) {
    $.ajax({
        type: 'GET',
        url: 'http://weixin.j1st.io/website/agents?usertoken='+data,
        success: function(data) {
            agentData=JSON.parse(data).data;
            getAgentList(JSON.parse(data).data,0);
            apendAgent(agentData);
        },
        error:function (data) {
            console.log("服务器故障，请稍后再试。")
        }
    });
}
function getAgentList(data,num) {
    agentList=[];
    for(var x=0;x<data.length;x++){
        agentList.push(data[x].agentId)
        agentList=agentList.unique();
    }
    agentNow=agentList[num];
    productID=data[num].productId;
    productName=data[num].alias;
    agentTime=data[num].updateAt;
    $(".updateTime").html(new Date(agentTime).toLocaleString());
    $(".productName").html(productName);
    $(".agentIdNow").html(agentNow);
    initPicker(agentList);
    initTime();
    getFnlist(data[num].fnX);
    getPower(data[num].fnX);
    getChart(productID,agentNow,new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate());

}
function getFnlist(data) {
    for(var y=0;y<data.length;y++){
        fnList.push(data[y]);
    }
    setEquivName(fnList);
    getMessage(fnList);
}
function setEquivName(fxList) {
    for(var z=0;z<fxList.length;z++){
        if(fnList[z].type==2){
            equiName=fnList[z].values[0].value;
        }
    }
    $(".equi").html(equiName);
}
function getMessage(fxList) {
    for(var z=0;z<fxList.length;z++){
        if(fnList[z].type==4){
            agentMessage=fnList[z].values[0].value;
            upMessageDate=fnList[z].values[0].updateAt;
        }
    }
    $("#agentMessage").html(agentMessage);
    $("#upMessageDate").html(new Date(upMessageDate).toLocaleString());
}
function getPower(data) {
    for(var xx=0;xx<data.length;xx++){
        if(data[xx].type==5){
            powerNow=data[xx].values[0].value;
            minNow=data[xx].values[0].min;
            maxNow=data[xx].values[0].max;
            unitNow=data[xx].values[0].unit;
            powerUpTime=data[xx].values[0].updateAt;
        }
    }
    $(".unit").text(unitNow);
    $(".minPw").text("Min:"+minNow);
    $(".maxPw").text("Max:"+maxNow);
    $(".pwNow").text(powerNow);
    $("#power-progress").css("width",parseInt(powerNow/maxNow*100)+"%");
    $("#powerTime").text(new Date(powerUpTime).toLocaleString())
}
function getChart(productID,agentID,year,month,day) {
    var charturl='http://weixin.j1st.io/website/chart?usertoken='+userToken+'&productID='+productID+'&agentID='+agentID+'&year='+year+'&month='+month+'&day='+day;
    $.ajax({
        type: 'GET',
        url: charturl,
        success: function(data) {
            drawChart(JSON.parse(data).data);
        },
        error:function (data) {
            alert("服务器故障，请稍后再试。")
        }
    });
}
function drawChart(data) {
    var chartTemp;
    for(var c=1;c<data.length;c++){
         chartTemp='<div class="card card'+c+'">\
            <canvas id="myChart'+c+'" width="380" height="300"></canvas>\
            </div>'
        $("#Chart>.content").append(chartTemp);
        var ctx = document.getElementById("myChart"+c);
        xArry=[];
        for(var zz=0;zz<data[c].list.length;zz++){
            if (zz%2==0){xArry.push(data[c].list[zz].value)};
        }
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                xLabels: ["0","2", "4", "6", "8", "10", "12","14","16","18","20","22","24"],
                datasets: [{
                    label: 'pw/time',
                    data: xArry,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1,
                    tension: 0,
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true,
                            stepSize: 10
                        }
                    }]
                }
            }
        });
    }
}
function initPicker(agents) {
    $(".picker").picker({
        toolbarTemplate: '<header class="bar bar-nav">\
  <button class="button button-link pull-left"></button>\
  <button class="button button-link pull-right close-picker">确定</button>\
  <h1 class="title">请选择AGENT</h1>\
  </header>',
        cols: [
            {
                textAlign: 'center',
                values: agentList
            }
        ],
        onClose:function () {
            deleteChart()
            agentList=agentList.unique();
            getAgentList(agentData,$.inArray(pickervalue.toString(),agentList))

        },
        formatValue:function (picker, value, displayValue) {
            pickervalue=value;
        }
    });
}
var charDate
var cYear;
var cMon;
var cDay;
function initTime() {
    $("#chartDate").calendar({
        value:[new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate()],
        onChange:function (p, values, displayValues) {
            charDate=displayValues.toString();
            arr=charDate.split("-");
            cYear=arr[0];
            cMon=parseInt(arr[1])<10?arr[1].split("0")[1]:arr[1];
            cDay=parseInt(arr[2])<10?arr[2].split("0")[1]:arr[2];
        },
        onClose:function () {
            if(cYear==new Date().getFullYear()&&cMon<=new Date().getMonth()+1&&cDay<=new Date().getDate()){
                getChart(productID,agentNow,cYear,cMon,cDay)
            }else if (cYear<new Date().getFullYear()){
                getChart(productID,agentNow,cYear,cMon,cDay)
            }else {
                return;
            }

        }
    });
}

function removeAgent(agentID) {
    $.ajax({
        type: 'GET',
        url: 'http://weixin.j1st.io/website/deleteagent?usertoken='+userToken+'&agentID='+agentNow,
        success: function(data) {
            $.showIndicator();
            setTimeout(function () {
                $.hideIndicator();
                $.toast("操作成功");
            }, 2000);
            console.log("删除成功");
        },
        error:function (data) {
            $.showIndicator();
            setTimeout(function () {
                $.hideIndicator();
                $.toast("操作失败或已经删除，请重新打开此界面");
            }, 2000);
            console.log("服务器故障，请稍后再试。");
        }
    });
}
function apendAgent(data) {
    var tempHtml;
    var deviceHtml;
    var dateHtml;
        for(var a=0;a<data.length;a++) {
            tempHtml = '<div class="list-block">\
            <ul>\
            <li class="item-content">\
            <div class="item-inner">\
            <div class="item-title initTitle">Product</div>\
               <div class="item-after productName' + a + '">' + data[a].alias + '</div>\
            </div>\
            </li>\
            <li class="item-content">\
            <div class="item-inner">\
            <div class="item-title initTitle">Agent</div>\
            <div class="item-after agentIdNow' + a + '">' + data[a].agentId + '</div>\
            </div>\
            </li>'
            dateHtml = '<li class="item-content">\
            <div class="item-inner">\
            <div class="item-title initTitle">Update</div>\
            <div class="item-after updateTime' + a + '">' + data[a].updateAt + '</div>\
            </div>\
            </li>\
            </ul>\
            </div>'
            if(!data[a].devices||data[a].devices==""){
                tempHtml = tempHtml + dateHtml;
                $(".native-scroll").append(tempHtml);
            }
            else if (data[a].devices.length > 1) {
                deviceHtml = '';
                for (var b = 0; b < data[a].devices.length; b++) {
                    deviceHtml += '<li class="item-content">\
            <div class="item-inner">\
            <div class="item-title initTitle">' + data[a].devices[b].deviceType + '</div>\
            <div class="item-after equi">' + data[a].devices[b].model + '</div>\
            </div>\
            </li>'
                }
                tempHtml = tempHtml + deviceHtml + dateHtml;
                $(".native-scroll").append(tempHtml);
            } else {
                deviceHtml = '<li class="item-content">\
            <div class="item-inner">\
            <div class="item-title initTitle">' + data[a].devices[0].deviceType + '</div>\
            <div class="item-after equi">' + data[a].devices[0].model + '</div>\
            </div>\
            </li>'
                tempHtml = tempHtml + deviceHtml + dateHtml;
                $(".native-scroll").append(tempHtml);
            }
        }
}
function deleteChart(){
    var Chartcard=$("#Chart .card");
    for (var d=2;d<Chartcard.length;d++){
       Chartcard[d].remove();
    }
}
$(".icon-remove").click(function () {
    removeAgent(agentNow);
    getAgentForm(userToken);
});
