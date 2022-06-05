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
	SAVEMAX = 16,
	PIETMAX = 1000000,
	colorList = [
		[255,192,192],[255,255,192],[192,255,192],[192,255,255],[192,192,255],[255,192,255],
		[255,  0,  0],[255,255,  0],[  0,255,  0],[  0,255,255],[  0,  0,255],[255,  0,255],
		[192,  0,  0],[192,192,  0],[  0,192,  0],[  0,192,192],[  0,  0,192],[192,  0,192],	
		[  0,  0,  0],[255,255,255]
	],
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
	outArea = document.getElementById('outArea'),
	showInfoArea = document.getElementById('showInfoArea'),
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
		//console.log('残ってるけど気にしないで');
		//初期化
		outArea.value='';
		showInfoArea.value='';
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
		dp = 0,
		cc = 0,
		cs = 0,	//塊のcodelの数
		ps = [],	//プログラムスタック
		pd = {x:0,y:0},	//ポジション(?)
		cn = bn = pietData[pd.y][pd.x];	//ポジションにあるコードの番号
		str = '';
		for(let pp = 0; pp < PIETMAX; pp++){
			//とりあえずpdから探索するしかない
			/*
			 * とりあえず→L→R↓R↓L←L←R↑R↑Lの把握
			 */
			const codelEdge = new Array(8);
			for(let i = 0; i < 8; i++){
				codelEdge[i] = [pd.x,pd.y];
			}
			//色ごとに処理わけ
			if(pd.y<0||pd.x<0||pd.y>=codeHeight||pd.x>=codeWidth||pietData[pd.y][pd.x]==18){
				//黒
				//多分ここの処理を書くことはない。
			}
			else if(pietData[pd.y][pd.x]<18){
				//cnの更新
				cn = ((Math.floor(pietData[pd.y][pd.x]/6)-Math.floor(bn/6)+3)%3)*6+((pietData[pd.y][pd.x] - bn + 18) % 6);
				bn = pietData[pd.y][pd.x];
				showInfoArea.value+=`命令:${ (['none','add','div','great','dup','in(c)','push','sub','mod','point','roll','out(n)','pop','mul','not','switch','in(n)','out(c)'])[cn] }\n`;
				switch(cn){
					case 1:
						//add
						if(ps.length>=2)ps.push(ps.pop()+ps.pop());
						break;
					case 2:
						//div
						if(ps.length>=2&&ps[ps.length-1]){
							const p0 = ps.pop(), p1 = ps.pop();
							ps.push(Math.floor(p1/p0));
						}
						break;
					case 3:
						//great
						if(ps.length>=2)ps.push(+(ps.pop()<ps.pop()));
						break;
					case 4:
						//dup
						if(ps.length>=1){
							const p0 = ps.pop();
							ps.push(p0);
							ps.push(p0);
						}
						break;
					case 5:
						//in(c)
						if(!str.length)str = prompt('char') || '';
						if(str.length){
							ps.push(str.codePointAt(0));
							str=str.substr(1);
						}
						break;
					case 6:
						//push
						ps.push(cs);
						break;
					case 7:
						//sub
						if(ps.length>=2){
							const p0 = ps.pop(), p1 = ps.pop();
							ps.push(p1-p0);
						}
						break;
					case 8:
						//mod
						if(ps.length>=2){
							const p0 = ps.pop(), p1 = ps.pop();
							ps.push(((p1%p0)+p0)%p0);
						}
						break;
					case 9:
						//point
						if(ps.length>=1)dp=((ps.pop()+dp)%4+4)%4;
						break;
					case 10:
						//roll
						if(ps.length>=2){
							const n = ps.pop(), d = ps.pop(), sp = ps.length - d, tempList = new Array(d);
							//i番目の要素をi+(n%d)番目にする
							for(let i = 0; i < d; i++){
								tempList[(i+n)%d] = ps[sp+i];
							}
							for(let i = 0; i < d; i++){
								ps[sp+i] = tempList[i];
							}
						}
						break;
					case 11:
						//out(n)
						if(ps.length>=1)outArea.value+=ps.pop();
						break;
					case 12:
						//pop
						if(ps.length>=1)ps.pop();
						break;
					case 13:
						//mul
						if(ps.length>=2)ps.push(ps.pop()*ps.pop());
						break;
					case 14:
						//not
						if(ps.length>=1)ps.push(+(!ps.pop()));
						break;
					case 15:
						//switch
						if(ps.length>=1)cc=(Math.abs(ps.pop())+cc)%2;
						break;
					case 16:
						//in(n)
						const num=prompt('number');
						if(+num||(0===+num))ps.push(+num);
						break;
					case 17:
						//out(c)
						if(ps.length>=1)outArea.value+=String.fromCodePoint(ps.pop());
						break;
					default:
						//???
				}
				showInfoArea.value+=`\tスタック:${ps}\n`;
				//codelの形を把握
				
				//初期化
				cs = 0;
				//0,1,2,3の順,shift()を使う
				const
				codelAnalysis = new Array(4),
				lp = [pd.x,pd.y],
				tcd = new Array(codeHeight);
				for(let i = 0; i < codeHeight; i++){
					tcd[i] = new Array(codeWidth);
					for(let j = 0; j < codeWidth; j++){
						tcd[i][j] = 0;
					}
				}
				let codelSize = 0;
				//とりあえず、現在指し示してるブロックを端とする
				for(let i = 0; i < 4; i++){
					codelAnalysis[i] = [];
				}
				codelAnalysis[0][0]=[lp[0],lp[1]];
				while(1){
					//もしcodeAnalysisが空なら終了
					if((!codelAnalysis[0].length)&&(!codelAnalysis[1].length)&&(!codelAnalysis[2].length)&&(!codelAnalysis[3].length))break;
					tcd[lp[1]][lp[0]] = 1;
					cs++;
					for(let i = 0; i < 4; i++){
						if(codelAnalysis[i].length){
							const popCodeData = codelAnalysis[i].pop();
							lp[0]=popCodeData[0];
							lp[1]=popCodeData[1];
							break;
						}
					}
					//codelEdgeの更新
					if(codelEdge[0][0]<lp[0]){
						codelEdge[0][0]=lp[0],codelEdge[0][1]=lp[1];
						codelEdge[1][0]=lp[0],codelEdge[1][1]=lp[1];
					}
					if(codelEdge[2][1]<lp[1]){
						codelEdge[2][0]=lp[0],codelEdge[2][1]=lp[1];
						codelEdge[3][0]=lp[0],codelEdge[3][1]=lp[1];
					}
					if(codelEdge[4][0]>lp[0]){
						codelEdge[4][0]=lp[0],codelEdge[4][1]=lp[1];
						codelEdge[5][0]=lp[0],codelEdge[5][1]=lp[1];
					}
					if(codelEdge[6][1]>lp[1]){
						codelEdge[6][0]=lp[0],codelEdge[6][1]=lp[1];
						codelEdge[7][0]=lp[0],codelEdge[7][1]=lp[1];
					}
	
					if(codelEdge[0][0]==lp[0]){
						if(codelEdge[0][1]>lp[1])codelEdge[0][0]=lp[0],codelEdge[0][1]=lp[1];
						if(codelEdge[1][1]<lp[1])codelEdge[1][0]=lp[0],codelEdge[1][1]=lp[1];
					}
					if(codelEdge[2][1]==lp[1]){
						if(codelEdge[2][0]<lp[0])codelEdge[2][0]=lp[0],codelEdge[2][1]=lp[1];
						if(codelEdge[3][0]>lp[0])codelEdge[3][0]=lp[0],codelEdge[3][1]=lp[1];
					}
					if(codelEdge[4][0]==lp[0]){
						if(codelEdge[4][1]<lp[1])codelEdge[4][0]=lp[0],codelEdge[4][1]=lp[1];
						if(codelEdge[5][1]>lp[1])codelEdge[5][0]=lp[0],codelEdge[5][1]=lp[1];
					}
					if(codelEdge[6][1]==lp[1]){
						if(codelEdge[6][0]>lp[0])codelEdge[6][0]=lp[0],codelEdge[6][1]=lp[1];
						if(codelEdge[7][0]<lp[0])codelEdge[7][0]=lp[0],codelEdge[7][1]=lp[1];
					}
					//右下左上の状態を確認
					if(lp[0]+1 < codeWidth && bn == pietData[lp[1]][lp[0]+1] && !tcd[lp[1]][lp[0]+1]){
						codelAnalysis[0].push([lp[0]+1,lp[1]]);
						tcd[lp[1]][lp[0]+1]=1;
					}
					if(lp[1]+1 < codeHeight && bn == pietData[lp[1]+1][lp[0]] && !tcd[lp[1]+1][lp[0]]){
						codelAnalysis[1].push([lp[0],lp[1]+1]);
						tcd[lp[1]+1][lp[0]]=1;
					}
					if(lp[0]-1 >= 0 && bn == pietData[lp[1]][lp[0]-1] && !tcd[lp[1]][lp[0]-1]){
						codelAnalysis[0].push([lp[0]-1,lp[1]]);
						tcd[lp[1]][lp[0]-1]=1;
					}
					if(lp[1]-1 >= 0 && bn == pietData[lp[1]-1][lp[0]] && !tcd[lp[1]-1][lp[0]]){
						codelAnalysis[1].push([lp[0],lp[1]-1]);
						tcd[lp[1]-1][lp[0]]=1;
					}
				}
				showInfoArea.value+=`\tcolorBlockのサイズ:${cs}\n`;
				for(let i=0; i < 8; i++){
					showInfoArea.value+=`\t\t${'→↓←↑'[Math.floor(i/2)]}${'LR'[i%2]}:${codelEdge[i]}\n`;
				}
				/*
				 * ここに書くのが良い？
				 */
			}
			else{
				//白
				//ここも特に処理を書かない
			}
			//codelの移動
			for(let i = 0; i <= 8; i++){
				if(i==8)return;
				//ここに範囲外やblackの判定を入れる
				const edgePoint = codelEdge[dp*2+cc];
				switch(dp){
					case 0:
						edgePoint[0]++;
						break;
					case 1:
						edgePoint[1]++;
						break;
					case 2:
						edgePoint[0]--;
						break;
					case 3:
						edgePoint[1]--;
						break;
				}
				if(0<=edgePoint[0]&&edgePoint[0]<codeWidth&&0<=edgePoint[1]&&edgePoint[1]<codeHeight&&pietData[edgePoint[1]][edgePoint[0]]!=18){
					pd.x = edgePoint[0], pd.y = edgePoint[1];
					break;
				}
				if(!(i%2))cc=(cc+1)%2;
				if(i%2)dp=(dp+1)%4;
			}
		}
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
