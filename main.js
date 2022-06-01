window.onload = () => {
	//変数
	let
	codelSize = 16,
	codeWidth,
	codeHeight,
	checkPosition = [null,null],
	saveImageDataList = [],
	sidlp = 0;
	const
	//定数
	SAVEMAX = 16;
	colorList = [
		[255,192,192],[255,255,192],[192,255,192],[192,255,255],[192,192,255],[255,192,255],
		[255,  0,  0],[255,255,  0],[  0,255,  0],[  0,255,255],[  0,  0,255],[255,  0,255],
		[192,  0,  0],[192,192,  0],[  0,192,  0],[  0,192,192],[  0,  0,192],[192,  0,192],	
		[  0,  0,  0],[255,255,255]
	];
	//element
	inputCodel = document.getElementById('inputCodel'),
	inputWidth = document.getElementById('inputWidth'),
	inputHeight = document.getElementById('inputHeight'),
	setButton = document.getElementById('setButton'),
	runButton = document.getElementById('runButton'),
	inputFiles = document.getElementById('inputFiles'),
	importButton = document.getElementById('importButton'),
	inputFileName = document.getElementById('inputFileName'),
	exportButton = document.getElementById('exportButton'),
	canvas = document.getElementById('canvas'),
	colorPalette = document.getElementById('colorPalette'),
	undoButton = document.getElementById('undoButton'),
	redoButton = document.getElementById('redoButton'),
	drawTypeRadios = document.getElementsByName('dtype'),
	//その他
	ctx = canvas.getContext('2d'),
	cpctx = colorPalette.getContext('2d'),
	//関数
	set = () => {
		codelSize = +inputCodel.value;
		codeWidth = +inputWidth.value;
		codeHeight = +inputHeight.value;
		canvas.width = codelSize * codeWidth;
		canvas.height = codelSize * codeHeight;
		if(!saveImageDataList.length){
			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(0,0,canvas.width,canvas.height);
			cpctx.fillStyle = '#FFFFFF';
			sidlp=-1;
		}
		else{
			loadImageData();
		}
		saveImageData();
		colorPalette.width = codelSize*6;
		colorPalette.height = codelSize*4;
		for(let i = 0; i < 18; i++){
			cpctx.fillStyle = `rgb(${colorList[i][0]},${colorList[i][1]},${colorList[i][2]})`;
			cpctx.fillRect((i%6)*codelSize,Math.floor(i/6)*codelSize,codelSize,codelSize);
		}
		cpctx.fillStyle = '#000000';
		cpctx.fillRect(0,3*codelSize,2*codelSize,codelSize);
		cpctx.fillStyle = '#FFFFFF';
		cpctx.fillRect(2*codelSize,3*codelSize,2*codelSize,codelSize);
		cpctx.fillRect(4*codelSize,3*codelSize,2*codelSize,codelSize);

	},
	drawCodel = (e) => {
		let drawType;
		for(let i = 0; i < drawTypeRadios.length; i++){
			if(drawTypeRadios[i].checked)drawType = drawTypeRadios[i].value;
		}
		switch(drawType){
			case 'dot':
				if(checkPosition[0]!=null){
					sidlp--;
					checkPosition[0]=null;
					checkPosition[1]=null;
				}
				loadImageData();
				ctx.fillRect(Math.floor(e.offsetX/codelSize)*codelSize,Math.floor(e.offsetY/codelSize)*codelSize,codelSize,codelSize);
				break;
			case 'rect':
				if(checkPosition[0]!=null){
					const
					mox = Math.floor(e.offsetX/codelSize)*codelSize,
					moy = Math.floor(e.offsetY/codelSize)*codelSize;
					const
					lx = Math.min(mox, checkPosition[0]),
					ly = Math.min(moy, checkPosition[1]),
					rx = Math.max(mox, checkPosition[0]),
					ry = Math.max(moy, checkPosition[1]);
					sidlp--;
					loadImageData();
					ctx.fillRect(lx,ly,rx-lx+codelSize,ry-ly+codelSize);
					checkPosition[0]=null;
					checkPosition[1]=null;
				}
				else{
					loadImageData();
					checkPosition[0]=Math.floor(e.offsetX/codelSize)*codelSize;
					checkPosition[1]=Math.floor(e.offsetY/codelSize)*codelSize;
					ctx.strokeStyle = '#888';
					ctx.strokeRect(checkPosition[0],checkPosition[1],codelSize,codelSize);
				}
				break;
		}
		saveImageData();
	},
	numberCheck = (e,x) => {
		e.value = Math.floor(+e.value) > 0? Math.floor(+e.value): x;
	},
	loadImageData = () => {
		ctx.putImageData(saveImageDataList[sidlp], 0, 0);
	},
	saveImageData = () => {
		if(++sidlp>=SAVEMAX){
			saveImageDataList.shift();
			sidlp--;
		}
		while(saveImageDataList.length!=sidlp)saveImageDataList.pop();
		saveImageDataList[sidlp] = ctx.getImageData(0, 0, codelSize * codeWidth, codelSize * codeHeight);
	},
	runPiet = () => {
		const
		pietData = new Array(codeHeight);
		for(let y = 0; y < codeHeight; y++){
			pietData[y] = new Array(codeWidth);
			for(let x = 0; x < codeWidth; x++){
				const
				imageData = ctx.getImageData(x*codelSize,y*codelSize,codelSize,codelSize).data;
				let colorNumber = 19;
				for(let i = 0; i < 20; i++){
					if(colorList[i][0]==imageData[0]&&colorList[i][1]==imageData[1]&&colorList[i][2]==imageData[2]&&imageData[3]==255)colorNumber = i;
				}
				for(let i = 1; i < codelSize ** 2; i++){
					if(!(colorList[colorNumber][0]==imageData[4*i+0]&&colorList[colorNumber][0]==imageData[4*i+0]&&colorList[colorNumber][2]==imageData[4*i+2]&&imageData[4*i+3]==255))colorNumber=19; 
				}
				pietData[y][x]=colorNumber;
			}
		}
		//ここから本番
		let
		cd = 0,
		cc = 0,
		stk = [],
		pd = [0,0];
		while(0){
		}
		console.log(pietData);
	};

	//初期化
	set();
	
	runButton.addEventListener('click',runPiet);
	inputCodel.addEventListener('blur',()=>{numberCheck(inputCodel,16);});
	inputWidth.addEventListener('blur',()=>{numberCheck(inputWidth,16);});
	inputHeight.addEventListener('blur',()=>{numberCheck(inputHeight,16);});
	canvas.addEventListener('click',drawCodel);
	canvas.addEventListener('mousemove',(e)=>{
		loadImageData();
		ctx.strokeStyle = '#888';	//これどこに置くか
		const
		x = Math.floor(e.offsetX/codelSize)*codelSize,
		y = Math.floor(e.offsetY/codelSize)*codelSize;
		ctx.strokeRect(x,0,codelSize,codelSize*codeHeight);
		ctx.strokeRect(0,y,codelSize*codeWidth,codelSize);
		if(checkPosition[0]!=null){
			const rectSize = (Math.abs(x-checkPosition[0])/codelSize+1)*(Math.abs(y-checkPosition[1])/codelSize+1);
			canvas.title = `codel: ${rectSize}`;
		}
		else{
			canvas.title = '';
		}
	});
	canvas.addEventListener('mouseout',loadImageData);
	colorPalette.addEventListener('click',(e)=>{
		const cdl = cpctx.getImageData(e.offsetX,e.offsetY,1,1).data;
		ctx.fillStyle = cpctx.fillStyle = `rgb(${cdl[0]},${cdl[1]},${cdl[2]})`;
		cpctx.fillRect(4*codelSize,3*codelSize,2*codelSize,codelSize);
	});
	setButton.addEventListener('click',set);
	undoButton.addEventListener('click',()=>{
		if(checkPosition[0]!=null){
			saveImageDataList.pop();
			checkPosition[0]=null;
			checkPosition[1]=null;
		}
		sidlp = Math.max(sidlp-1,0);
		loadImageData();
	});
	redoButton.addEventListener('click',()=>{
		sidlp = Math.min(sidlp+1,SAVEMAX-1,saveImageDataList.length-1);
		loadImageData();
	});
	importButton.addEventListener('click',()=>{
		try{
			const
			targetFile = inputFiles.files[0],
			fileReader = new FileReader();
			fileReader.readAsDataURL(targetFile);
			fileReader.onload = () => {
				const img = new Image();
				img.src = fileReader.result;
				img.onload = () => {
					ctx.drawImage(img,0,0);
					saveImageData();
				};
			};
		}
		catch(e){
			console.log(e);
		}
	});
	exportButton.addEventListener('click',()=>{
		const a = document.createElement('a');
		a.href = canvas.toDataURL();
		a.download = (inputFileName.value || 'export') + '.png';
		a.click();
	});
};
