/* --- 下载管理逻辑 ---*/

// chrome.downloads.onCreated.addListener(downloadItem =>{
	// console.log('下载管理逻辑-- downloadItem');
	// console.dir(downloadItem);
	// console.log('下载管理逻辑-- onCreated, 尝试修改文件名');
	
	// let filename = downloadItem.filename;
	// let fn = "z:\\" + filename.split('\\').pop();
	// console.log('修改后的文件路径为： ' + fn);
	// downloadItem.filename = fn;
	//在这里可以监听到网页 另存为 消息.
	//网页另存为消息在onDeterminingFilename里并不能发监听到
// });

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
	//console.log('下载管理逻辑-- onDeterminingFilename');
    let filename = downloadItem.filename;
	//console.log('下载的文件: ' + filename);
	let ext = filename.split('.').pop(); //文件扩展名. 如: zip, rar
	
	//console.log('----- ' + ext + ' -----');
	let url = downloadItem.referrer;
    let fileDownloadDomain = url.split("//").pop(); //域名. 如: pan.baidu.com, github.com 
    
	//从云存储(如果失败，则使用 本地)存储中读取用户设置
    chrome.storage.sync.get(["Root", "Compressed","Documents","Videos","Music","Images","Others", "domains"], async result => {
		// const rootDir = result.Root;
		// if (!rootDir) {
		// 	return false;
		// }

		const rootDir = "";

		let pathToken = null; //扩展名对应的路径
		for (const key in result) {
			const data = result[key];
			if (data.exts && data.exts.includes(ext)){
				pathToken = data.token;
				break;
			}
		};

		//域名是否存在
		let domainIsExists = fileDownloadDomain && result.domains && result.domains.includes(fileDownloadDomain);
		
		let destDir = rootDir;
		if (pathToken) {
			destDir += pathToken + "/"; //子目录会自动创建
		};
			
		if (domainIsExists){
			destDir += fileDownloadDomain + "/";
		};

		// console.log('目标存储文件：' + destDir + filename);
		suggest({
			filename : destDir + filename
		});
	});

    return true;
});