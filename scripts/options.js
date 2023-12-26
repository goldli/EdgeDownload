//弹出对话框
const myModal = new bootstrap.Modal('#myModal', {
    keyboard: false
});

//取得所有的domain
function getAllDomains(){
    const $tds = $("#tbDomains tbody tr td:nth-child(2)");
    let domains = [];
    
    $.each($tds,(index,td) => {
        domains.push($(td).text());
    });
    
    return domains;
};

//重新排序
function reOrderTableItems(){
    const $table = $("#tbDomains");
    const rowCount = $table.find("tr").length;
    const domains = getAllDomains();
    
    $table.find('tbody tr').remove();

    for(let i = 0; i < domains.length; i++){
        $table.append("<tr><td>" + (i + 1) + "</td><td>" + domains[i] + "</td></tr>");
    };
};

//table 上的右键菜单
let menu = new BootstrapMenu('.table tbody tr', {
    fetchElementData: function (row) {     //fetchElementData获取原数据并返回
        if (row){
            let $item = $(row);
            let idx = $item.children().first().text();
            
            let ret = {
                index : $item.children().first().text(),
                value : $item.children().eq(1).text(),
                $tr : $item
            };
            return ret;
        }
        return null;
    },
    actions: [{
        name: '添加',
        onClick: function(item) {
                myModal.show();
            }
        }, {
        name: '删除',
        onClick: function(item) {
            var $tbody = item.$tr.closest("tbody");
            if ($tbody.children().length == 1){
                    item.$tr.children().eq(1).text("");
            } else {
                    item.$tr.remove();
                    //重新排排序
                    reOrderTableItems();
                }
            }
        }
    ]
});

function saveUserInput(type){
    if (!type){
        return;
    }

    let token;
    let exts;
    switch(type){
        case "Root":
            const rootDir = $("#txtRoot").val();
            if (rootDir) {
                chrome.storage.sync.set({ 'Root' : rootDir });
            };
            return;
        case "Compressed":
            token = $("#txtCompressed").val();
            exts = $("#extCompressed").val();
            break;
        case "Documents":
            token = $("#txtDocument").val();
            exts = $("#extDocument").val();
            break;
        case "Videos":
            token = $("#txtVideos").val();
            exts = $("#extVideos").val();
            break;
        case "Music":
            token = $("#txtMusic").val();
            exts = $("#extMusic").val();
            break;
        case "Images":
            token = $("#txtImages").val();
            exts = $("#extImages").val();
            break;
        case "Others":
            token = $("#txtOthers").val();
            exts = $("#extOthers").val();
            break;
        default:
            return;
    };
    if (token && exts) {
        const data = {};
        data[type] = {
            token : token,
            exts : exts
        };
        chrome.storage.sync.set(data);
    };

};

//读取用户设置
function loadSettings(){
    chrome.storage.sync.get(["Compressed","Root","Documents","Videos","Music","Images","Others", "domains"], async result => {
            if (result.Root){
                $("#txtRoot").val(result.Root);
            };
            if (result.Compressed){
                $("#txtCompressed").val(result.Compressed.token);
                $("#extCompressed").val(result.Compressed.exts);
            };
            if (result.Documents){
                $("#txtDocument").val(result.Documents.token);
                $("#extDocument").val(result.Documents.exts);
            };
            if (result.Videos){
                $("#txtVideos").val(result.Videos.token);
                $("#extVideos").val(result.Videos.exts);
            };
            if (result.Music){
                $("#txtMusic").val(result.Music.token);
                $("#extMusic").val(result.Music.exts);
            };
            if (result.Images){
                $("#txtImages").val(result.Images.token);
                $("#extImages").val(result.Images.exts);
            };
            if (result.Others){
                $("#txtOthers").val(result.Others.token);
                $("#extOthers").val(result.Others.exts);
            };
            if (result.domains){
                const domains = result.domains;
                if (domains.length > 0){
                    const $table = $("#tbDomains");
                    $table.find('tbody tr').remove();
                    for(let i=0; i < domains.length; i++){
                        $table.append("<tr><td>" + (i + 1) + "</td><td>" + domains[i] + "</td></tr>");
                    }
                };
            };
        }
    );
};

function saveDomains(){
    const data = {
        domains : getAllDomains()
    };
    chrome.storage.sync.set(data);
}

$(()=>{
    loadSettings();

    //添加对话框的确定事件
    $("#dlgOk").click(()=>{
        let txt = $("#txtNewDomain").val().split(/[\t\r\f\n\s]*/g).join('');//去掉空格
        if (txt && txt.length > 0){
            const $table = $("#tbDomains");
            const rowCount = $table.find("tbody tr").length;
            if (rowCount == 1){
                const $td = $table.find('tbody tr td:nth-child(2)');
                const tdText = $td.text();
                if (!tdText || tdText=="") {
                    $td.text(txt);
                    myModal.hide();

                    saveDomains();
                    return;
                }
            } 

            $table.append("<tr><td>" + (1 + rowCount) + "</td><td>" + txt + "</td></tr>");
            myModal.hide();
            saveDomains();
        }
    });

    //文本框输入事件
    /*
        delayContext = {
            {type} = handle
        }
    */
    const delayContext = {};

    $('input[type="text"]').on('input',function(e) {
        //const value = console.log(e.delegateTarget.value);
        const type = $(e.delegateTarget).attr('data-Type');
        if (!type){
            return;
        }
        const handle = delayContext[type];
        if (!handle){
            delayContext[type] = setTimeout(() => {
                delayContext[type] = null;
                saveUserInput(type);
            }, 500);
        } else {
            clearInterval(handle);
            delayContext[type] = setTimeout(() => {
                delayContext[type] = null;
                saveUserInput(type);
            }, 500);
        }
    });


});