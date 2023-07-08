/*:ja
 * @target MZ
 * @plugindesc クラス管理をするマネージャー3（これを汎用プラグインにしたい）
 * @author フェルミウム湾
 *
 * @help ClassManager.js
 * 
 * @command initialize
 * @text 初期化
 * @desc オブジェクトの初期化を行います。
 *
 * @arg name
 * @dir img/pictures/
 * @type file
 * @text this.filename
 * @desc 画像ファイルを入力します。
 * 
 * @arg origin
 * @type string
 * @default 1
 * @text this.origin
 * @desc 原点の位置(0:左上, 1:中央)を指定します。
 * 
 * @arg x
 * @type string
 * @default 0
 * @text this.x
 * @desc x座標を指定します。
 * 
 * @arg y
 * @type string
 * @default 0
 * @text this.y
 * @desc y座標を指定します。
 * 
 * @arg scaleX
 * @type string
 * @default 100
 * @text this.scaleX
 * @desc 拡大率 幅[%]を指定します。
 * 
 * @arg scaleY
 * @type string
 * @default 100
 * @text this.scaleY
 * @desc 拡大率 高さ[%]を指定します。
 * 
 * @arg opacity
 * @type string
 * @default 255
 * @text this.opacity
 * @desc 不透明度を指定します。
 * 
 * @arg divX
 * @type string
 * @default 1
 * @text this.divX
 * @desc 画像の分割数(横)を指定します。
 * 
 * @arg divY
 * @type string
 * @default 1
 * @text this.divY
 * @desc 画像の分割数(縦)を指定します。
 * 
 * @arg cellX
 * @type string
 * @default 0
 * @text this.cellX
 * @desc 描画セル番号(横)を指定します。
 * 
 * @arg cellY
 * @type string
 * @default 0
 * @text this.cellY
 * @desc 描画セル番号(縦)を指定します。
 * 
 * @arg angle
 * @type string
 * @default 0
 * @text this.angle
 * @desc 角度[deg]を指定します。
 * 
 * @arg color
 * @type string
 * @default [0, 0, 0, 0]
 * @text this.color
 * @desc 色調を指定します。([赤, 緑, 青, グレー])
 * 
 * @arg blendMode
 * @type string
 * @default 0
 * @text this.blendMode
 * @desc 合成方法を指定します。(0:通常, 1:加算, 2:乗算, 3:スクリーン)
 * 
 * @arg pictureManager
 * @type string
 * @default pictureManager
 * @text this.pictureManager
 * @desc ピクチャ管理オブジェクトを指定します。
 * 
 */

// 関数定義クラス
var FuncDef = function() {
	// 関数名
	this.name = "";
	// 引数
	this.args = "";
	// 関数の内容
	this.script = "";
};

// クラス定義クラス
var ClassDef = function() {
	// 集約(矢印元)
	this.prevAggregation = [];
	// 集約(矢印先)
	this.nextAggregation = [];
	// 汎化(矢印元)
	this.prevInheritance = [];
	// 汎化(矢印先)
	this.nextInheritance = [];
	// 実行(矢印元)
	this.prevExecute = [];
	// 実行(矢印先)
	this.nextExecute = [];

	// 所属するパッケージ
	this.package = "";
	// クラス名
	this.name = "";
	// 保有する関数
	this.funcs = [];
	// クラスのアクセスレベル(0:private, 1:public)
	this.accessLevel = 0;
};

ClassManager = function() {
	// 生成したJavaScriptコード
	this.script = "";
	eval("global = new function(){};\n");	// グローバル変数を初期化する
	eval("classInitializer = new function(){};\n");	// クラス初期化用の構造体を初期化する
};

/*// 初期化処理を生成する
ClassManager.prototype.createInit = function() {
	var initStr = "";
	this.script += initStr + "\n";
};*/

ClassManager.prototype.run = function() {
	//eval("var global = new function(){};\n");	// グローバル変数を初期化する
	//eval("var classInitializer = new function(){};\n");	// クラス初期化用の構造体を初期化する
//	eval("global = new function(){};\n");	// グローバル変数を初期化する
//	eval("classInitializer = new function(){};\n");	// クラス初期化用の構造体を初期化する
	console.log("<<script>>");
	console.log(this.script);
	eval(this.script);
};

// クラス接続間マップに使用するマップチップの情報
ClassMapChipInfo = function(arrowType, arrowDict, leftPath, rightPath, upPath, downPath, allowTurn) {
	this.arrowType = arrowType; // 0:接続線, 1:集約, 2:汎化, 3:実行
	this.arrowDict = arrowDict; // 2:下, 4:左, 6:右, 8:上
	this.leftPath = leftPath; // 左側に線が伸びているか
	this.rightPath = rightPath; // 右側に線が伸びているか
	this.upPath = upPath; // 上側に線が伸びているか
	this.downPath = downPath; // 下側に線が伸びているか
	this.allowTurn = allowTurn;	// 左右から上下へ、上下から左右へ、それぞれ移動してよいか
	this.searchedLeftRightFlg = false;	// 探索で訪れたフラグ(左右方向)
	this.searchedUpDownFlg = false;	// 探索で訪れたフラグ(上下方向)
	this.eventId = 0;	// イベントID
};

// クラス接続間マップを作成する
var createClassMap = function(mapObj, mapName) {
	// クラス一覧
	this.classList[mapName] = [];

	// 各チップの接続情報を取得する
	chip = [];
	for (var x = 0; x < mapObj.width; x++) {
		chip[x] = [];
		for (var y = 0; y < mapObj.height; y++) {
			var i = x + mapObj.width * y;
			switch (mapObj.data[i]) {
				case 1536:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, true, false, false, true);
					break;
				case 1537:
					chip[x][y] = new ClassMapChipInfo(0, 0, false, true, false, true, true);
					break;
				case 1538:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, false, false, true, true);
					break;
				case 1539:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, true, false, true, true);
					break;
				case 1540:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, false, true, true, true);
					break;
				case 1541:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, true, true, true, true);
					break;
				case 1542:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, true, true, true, false);
					break;
				case 1543:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, true, true, true, false);
					break;
				case 1544:
					chip[x][y] = new ClassMapChipInfo(0, 0, false, false, true, true, true);
					break;
				case 1545:
					chip[x][y] = new ClassMapChipInfo(0, 0, false, true, true, false, true);
					break;
				case 1546:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, false, true, false, true);
					break;
				case 1547:
					chip[x][y] = new ClassMapChipInfo(0, 0, false, true, true, true, true);
					break;
				case 1548:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, true, true, false, true);
					break;
				case 1550:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, true, true, true, false);
					break;
				case 1551:
					chip[x][y] = new ClassMapChipInfo(0, 0, true, true, true, true, false);
					break;
				case 1553:
					chip[x][y] = new ClassMapChipInfo(1, 8, false, false, true, true, true);
					break;
				case 1556:
					chip[x][y] = new ClassMapChipInfo(2, 8, false, false, true, true, true);
					break;
				case 1560:
					chip[x][y] = new ClassMapChipInfo(1, 4, true, true, false, false, true);
					break;
				case 1562:
					chip[x][y] = new ClassMapChipInfo(1, 6, true, true, false, false, true);
					break;
				case 1563:
					chip[x][y] = new ClassMapChipInfo(2, 4, true, true, false, false, true);
					break;
				case 1565:
					chip[x][y] = new ClassMapChipInfo(2, 6, true, true, false, false, true);
					break;
				case 1569:
					chip[x][y] = new ClassMapChipInfo(1, 2, false, false, true, true, true);
					break;
				case 1572:
					chip[x][y] = new ClassMapChipInfo(2, 2, false, false, true, true, true);
					break;
				case 1577:
					chip[x][y] = new ClassMapChipInfo(3, 8, false, false, true, true, true);
					break;
				case 1584:
					chip[x][y] = new ClassMapChipInfo(3, 4, true, true, false, false, true);
					break;
				case 1586:
					chip[x][y] = new ClassMapChipInfo(3, 6, true, true, false, false, true);
					break;
				case 1593:
					chip[x][y] = new ClassMapChipInfo(3, 2, false, false, true, true, true);
					break;
				default:
					chip[x][y] = new ClassMapChipInfo(0, 0, false, false, false, false, false);
					break;
			}
			
		}
	}
	
	mapObj.events.forEach(event => {
		//**/console.log(event);
		// イベントのクラス定義オブジェクトを生成しておく
		var obj = splitPackageClass(mapName, normalizeClassName(event.name));
		if (!(obj[0] in this.classList)) this.classList[obj[0]] = [];
		this.classList[obj[0]][obj[1]] = new ClassDef();

		// 各イベントの座標をチップ情報に追加する
		var x = event.x;
		var y = event.y;
		chip[x][y].eventId = event.id;
	});

	var search = function(x, y, dict, baseX, baseY, baseDict, classList) {
		// 探索済みの場合は何もしない
		if (chip[x][y].searchedLeftRightFlg && (dict == 4 || dict == 6)) {
			return;
		}
		if (chip[x][y].searchedUpDownFlg && (dict == 2 || dict == 8)) {
			return;
		}

		// イベントがあった場合は接続完了
		if (chip[x][y].eventId > 0 && chip[baseX][baseY].eventId !== chip[x][y].eventId) {

			// 到着側の矢印情報取得
			var arrowType = 0;
			var arrowDict = 0;
			switch (dict) {
				case 2:
					arrowType = chip[x][y - 1].arrowType;
					arrowDict = chip[x][y - 1].arrowDict;
					break;
				case 4:
					arrowType = chip[x + 1][y].arrowType;
					arrowDict = chip[x + 1][y].arrowDict;
					break;
				case 6:
					arrowType = chip[x - 1][y].arrowType;
					arrowDict = chip[x - 1][y].arrowDict;
					break;
				case 8:
					arrowType = chip[x][y + 1].arrowType;
					arrowDict = chip[x][y + 1].arrowDict;
					break;
			}
			if (arrowType > 0 && arrowDict != dict) {
				// 直前のマスが矢印であっても、矢印がイベントの方を向いていなければ矢印と見なさない
				arrowType = 0;
			}

			// ベース側の矢印情報取得
			var baseArrowType = 0;
			switch (baseDict) {
				case 2:
					baseArrowType = chip[baseX][baseY + 1].arrowType;
					baseArrowDict = chip[baseX][baseY + 1].arrowDict;
					break;
				case 4:
					baseArrowType = chip[baseX - 1][baseY].arrowType;
					baseArrowDict = chip[baseX - 1][baseY].arrowDict;
					break;
				case 6:
					baseArrowType = chip[baseX + 1][baseY].arrowType;
					baseArrowDict = chip[baseX + 1][baseY].arrowDict;
					break;
				case 8:
					baseArrowType = chip[baseX][baseY - 1].arrowType;
					baseArrowDict = chip[baseX][baseY - 1].arrowDict;
					break;
			}
			if (baseArrowType > 0 && baseArrowDict != 10 - baseDict) {
				// 直前のマスが矢印であっても、矢印がイベントの方を向いていなければ矢印と見なさない
				baseArrowType = 0;
			}

			// 重複を防ぐため、ベース側が始点の場合のみ抽出する
			if (baseArrowType == 0 && arrowType != 0) {
				// イベント名を取得
				baseEventName = normalizeClassName(mapObj.events.filter(event => event.id === chip[baseX][baseY].eventId)[0].name);
				eventName = normalizeClassName(mapObj.events.filter(event => event.id === chip[x][y].eventId)[0].name);
				var baseObj = splitPackageClass(mapName, baseEventName);
				var obj = splitPackageClass(mapName, eventName);
				if (!(baseObj[0] in this.classList)) this.classList[baseObj[0]] = [];
				if (!(obj[0] in this.classList)) this.classList[obj[0]] = [];

				// 矢印の種類ごとに関係を登録
				switch (arrowType) {
					case 1:
						classList[obj[0]][obj[1]].prevAggregation.push([baseObj[0], baseObj[1]]);
						classList[baseObj[0]][baseObj[1]].nextAggregation.push([obj[0], obj[1]]);
						//console.log("集約:" + baseEventName + "=>" + eventName);
						break;
					case 2:
						classList[obj[0]][obj[1]].prevInheritance.push([baseObj[0], baseObj[1]]);
						classList[baseObj[0]][baseObj[1]].nextInheritance.push([obj[0], obj[1]]);
						//console.log("汎化:" + baseEventName + "=>" + eventName);
						break;
					case 3:
						classList[obj[0]][obj[1]].prevExecute.push([baseObj[0], baseObj[1]]);
						classList[baseObj[0]][baseObj[1]].nextExecute.push([obj[0], obj[1]]);
						//console.log("実行:" + baseEventName + "=>" + eventName);
						break;
				}
			}

		}

		// 向かってきた方向で道が繋がっていない場合は何もしない
		switch (dict) {
			case 2:
				if (!chip[x][y].upPath) {
					return;
				}
				break;
			case 4:
				if (!chip[x][y].rightPath) {
					return;
				}
				break;
			case 6:
				if (!chip[x][y].leftPath) {
					return;
				}
				break;
			case 8:
				if (!chip[x][y].downPath) {
					return;
				}
				break;
		}

		// 探索済みとする
		if (chip[x][y].allowTurn || dict == 4 || dict == 6) {
			chip[x][y].searchedLeftRightFlg = true;
		}
		if (chip[x][y].allowTurn || dict == 2 || dict == 8) {
			chip[x][y].searchedUpDownFlg = true;
		}

		//console.log("探索(" + x + ", " + y + ")");

		// 全方向に再び探索する
		if (chip[x][y].allowTurn || dict == 4 || dict == 6) {
			if (chip[x][y].leftPath) {
				search(x - 1, y, 4, baseX, baseY, baseDict, classList);
			}
			if (chip[x][y].rightPath) {
				search(x + 1, y, 6, baseX, baseY, baseDict, classList);
			}
		}
		if (chip[x][y].allowTurn || dict == 2 || dict == 8) {
			if (chip[x][y].downPath) {
				search(x, y + 1, 2, baseX, baseY, baseDict, classList);
			}
			if (chip[x][y].upPath) {
				search(x, y - 1, 8, baseX, baseY, baseDict, classList);
			}
		}
	};

	// 各イベントを起点に接続線情報を取得する
	mapObj.events.forEach(event => {
		for (var x = 0; x < mapObj.width; x++) {
			for (var y = 0; y < mapObj.height; y++) {
				chip[x][y].searchedLeftRightFlg = false;
				chip[x][y].searchedUpDownFlg = false;
			}
		}	
		var x = event.x;
		var y = event.y;
		if (x > 0) {
			if (chip[x - 1][y].eventId == 0) {
				search(x - 1, y, 4, x, y, 4, this.classList);
			}
		}
		if (y > 0) {
			if (chip[x][y - 1].eventId == 0) {
				search(x, y - 1, 8, x, y, 8, this.classList);
			}
		}
		if (x < mapObj.width - 1) {
			if (chip[x + 1][y].eventId == 0) {
				search(x + 1, y, 6, x, y, 6, this.classList);
			}
		}
		if (y < mapObj.height - 1) {
			if (chip[x][y + 1].eventId == 0) {
				search(x, y + 1, 2, x, y, 2, this.classList);
			}
		}
	});

	// TODO: ここまでで接続情報がそろったが、正しい接続かどうかはエラーチェックが必要

	/*
	this.classList[mapName] = [];
	this.classList[mapName]["キャラクター管理"] = new ClassDef();
	this.classList[mapName]["キャラクター管理"].prevAggregation.push([mapName, "キャラクター基底"]);
	this.classList[mapName]["キャラクター基底"] = new ClassDef();
	this.classList[mapName]["キャラクター基底"].nextAggregation.push([mapName, "キャラクター管理"]);
	this.classList[mapName]["キャラクター基底"].prevInheritance.push([mapName, "かぶるくん"]);
	this.classList[mapName]["かぶるくん"] = new ClassDef();
	this.classList[mapName]["かぶるくん"].nextInheritance.push([mapName, "キャラクター基底"]);
	*/
};

var init_func_name = "初期化";

var update_func_name = "更新";

var draw_func_name = "描画";	// TODO: この関数は、本プログラムで自動生成する(pictureを描画するだけ)

var release_func_name = "解放";	// TODO: この関数は、本プログラムで自動生成する(pictureを解放するだけ)

var global_prefix_name = "global.";

/*
ClassManager.prototype.run = function() {
	//registClasses($gameMap._mapId);

	//registClasses(1, []);

	//registClasses(10, []);	// サンプル
	//registClasses(12, []);	// TODO: 別マップに子クラスだけあると、その子クラスからのsuperで無限ループになってしまう
	//registClasses(11, []);
//	registClasses(14, []);
};*/

// 指定したマップIDのクラスをすべて登録する（別マップのクラスも再帰的にロードする）　第二引数は、ロード済みマップ名（空からスタート）
ClassManager.prototype.registClasses = function(mapId, loadedMapNameList)  {

	var loadMapInfo = loadMapClasses(mapId);

	// 事前にロードする必要があると判明したマップ名一覧を戻り値で取得しておく
	var requiredMapNameList = loadMapInfo[1];

	for (var i = 0; i < $dataMapInfos.length; i++) {
		if ($dataMapInfos[i] != null && requiredMapNameList.includes($dataMapInfos[i].name)) {

			if (loadedMapNameList.includes($dataMapInfos[i].name)) {
				// TODO: 既に登録済みのマップが存在した場合（エラーとする？しなくても問題ない？）
			} else {
				loadedMapNameList.push($dataMapInfos[i].name);
				this.registClasses(i, loadedMapNameList);
			}

		}
	}
		
	// ロードが必要なマップの分をすべてevalしてから、元のマップの分をevalする
	//eval(loadMapInfo[0]);
	this.script += loadMapInfo[0] + "\n";

	// そのマップ全体のクラスの初期化関数をここで呼んでおく
	var callInitStr = "";
	callInitStr += "classInitializer.initMap" + mapId + "();\n";
	//eval(callInitStr);
	this.script += callInitStr + "\n";



	/*
	var aaa = loadMapClasses(mapId);
	var bbb = loadMapClasses(11);
	eval(bbb[0]);
	eval(aaa[0]);

	console.log(" * aaa * ");
	console.log(aaa);
	console.log(" * bbb * ");
	console.log(bbb);

	// TODO: ロードする必要があると判明したマップ名一覧を戻り値で取得しておく
	requiredMapNameList = ["ベイ助サンプル", "わわわ", "画像のテスト用"];

	console.log("---------------------------------------------");
	var loadMapIdList = [];
	for (var i = 0; i < $dataMapInfos.length; i++) {
		if ($dataMapInfos[i] != null && requiredMapNameList.includes($dataMapInfos[i].name)) {
			// TODO: ここで、this.loadMapClasses(i) を再帰的に呼び出し、requiredMapNameListが空になるまで続ける（一度取得したマップ名は記憶しておき、重複があればエラーとする）
			console.log($dataMapInfos[i].name);
		}
	}
	console.log("---------------------------------------------");
*/

//	$dataMapInfos[mapId].name;

	/*
	// TODO: クラス名について検討が必要なところあり
	別マップにあるクラス名をどう表現するかを決めるべき
	今は global_クラス名 で一概に表現しているが、そうしてしまうと
	マップ1でもマップ2でもクラス名がAAAであった場合に、どちらもglobal_AAAになってしまう
	マップ名.クラス名とすればよいかとも思われるが、そもそもマップ名自体重複が許されているので、マップ名だけでは重複してしまう
	import文のようなものを用意すれば解決できそうだが、どんどんプログラム寄りになってしまうので、出来ればそうはしたくない
	別マップのクラスをextern宣言するにはどうするのがやりやすいか考えること

	マップ名を重複させられるのはやむを得ないとして、そんな使い方をしなければいいように思われる
	global_マップ名_クラス名 にするか、マップツリーをフォルダ構造に見立てて
	global_マップ名_マップ名_マップ名_クラス名 のようにするかして、マップ名の情報を名前に含める
	別マップのクラスを呼び出すときは、イベント名を「マップ名.クラス名」のようにする（さらに入れ子にして「マップ名.マップ名.クラス名」でもいいかもしれない）
	ただし、呼び出し時はマップ名を都度指定するのが面倒なので、「クラス名」だけで呼べるようにする（複数マップで同一クラス名のものは使用できない制約にする）
	*/

};

// クラス名の正規化（先頭に★が付いていたら削除する）
var normalizeClassName = function(className) {
	if (className.slice(0, 1) === "★") {
		className = className.slice(1);
	}
	return className;
};

// 「.」が含まれた文字列(eventName)をパッケージ名とクラス名に分けた配列にする 「.」が無い場合はmapNameをパッケージ名として採用する
var splitPackageClass = function(mapName, eventName) {
	var obj = [null, null];
	if (~eventName.indexOf('.')) {
		let buf = eventName.split('.');
		obj[1] = buf[1];
		obj[0] = buf[0];
	} else {
		obj[0] = mapName;
		obj[1] = eventName;
	}
	return obj;
};

/*// クラスの親子関係を走査して、親クラスの方が小さい番号になるようclassOrderListに各クラスの番号を付与していく
var calcClassOrder = function(classList, className, classOrderList, checkedClassNameList, order) {
	if (checkedClassNameList.includes(className)) {
		return;
	}
	checkedClassNameList.push(className);
	//classOrderList[className] = order;
	classOrderList.push({name: className, order: order});

	let superClassName = "";
	if (classList[className].nextInheritance.length >= 1) {
		superClassName = classList[className].nextInheritance[0][1];
		calcClassOrder(classList, superClassName, classOrderList, checkedClassNameList, order - 1);
	}

	let childClassName = "";
	for (let i = 0; i < classList[className].prevInheritance.length; i++) {
		childClassName = classList[className].prevInheritance[i][1];
		calcClassOrder(classList, childClassName, classOrderList, checkedClassNameList, order + 1);
	}

};*/

// クラスの親子関係を走査して、親クラスの方が小さい番号になるようclassOrderListに各クラスの番号を付与していく
var calcClassOrder = function(classList, packageName, className, classOrderList, checkedClassNameList, order) {
	if (checkedClassNameList.includes(packageName + "." + className)) {
		return;
	}
	checkedClassNameList.push(packageName + "." + className);
	//classOrderList[className] = order;
	classOrderList.push({packageName: packageName, className: className, order: order});

	let superClassName = "";
	if (classList[packageName][className].nextInheritance.length >= 1) {
		superPackageName = classList[packageName][className].nextInheritance[0][0];
		superClassName = classList[packageName][className].nextInheritance[0][1];
		calcClassOrder(classList, superPackageName, superClassName, classOrderList, checkedClassNameList, order - 1);
	}

	let childClassName = "";
	for (let i = 0; i < classList[packageName][className].prevInheritance.length; i++) {
		childPackageName = classList[packageName][className].prevInheritance[i][0];
		childClassName = classList[packageName][className].prevInheritance[i][1];
		calcClassOrder(classList, childPackageName, childClassName, classOrderList, checkedClassNameList, order + 1);
	}

};

// マップオブジェクトのロード
var loadMapObj = function(mapId){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "data/Map%1.json".format(mapId.padZero(3)), false);
	xhr.overrideMimeType("application/json");
	xhr.send();
	return JSON.parse(xhr.responseText);
};

// 指定したマップ番号のマップをロードして、クラスをロードする 戻り値は{ロード用ソースコード, ロードが必要な別マップ名一覧}の配列
var loadMapClasses = function(mapId) {
	// ロードする必要がある別マップの集合
	var requiredMapNameSet = new Set();

	// マップオブジェクトの代入
	var mapObj = loadMapObj(mapId);
	mapObj.events = mapObj.events.filter(event => !!event);	// null要素を削除しておく

	// マップ名/イベント名の対でリスト保持する
	//this.classList = [];

	this.classList = [];

	// イベント一覧の取得
	var map = $dataMapInfos[mapId];
	//console.log("マップ名:" + map.name);

	// TODO: この段階で、イベント名の関係をすべて取得しておく
	createClassMap(mapObj, map.name);

	// クラス名リスト
	var classNameList = [];

	// クラス名に対するアクセスレベルのリスト(0:private, 1:public)
	var accessLevelList = [];

	// 他マップのクラス一覧
	var externMapList = [];
	mapObj.events.forEach(event => {	// TODO: ここのループでは解析だけ行って、スクリプトは生成しない！！！　解析した結果のオブジェクトを使ってスクリプトを生成することにする（解析した結果は中間言語になる）そのために、まずは下記からスクリプト生成しているところを全部消して、オブジェクト生成の処理に書き換えていけばいい

		//console.log(" イベント名:" + event.name);

		// クラス名
		var className = event.name;
		var accessLevelValue;
		if (className.slice(0, 1) === "★") {
			accessLevelValue = 1;	// public
		} else {
			accessLevelValue = 0;	// private
		}

		var packageName;
		var obj = splitPackageClass(map.name, normalizeClassName(event.name));
		if (!(obj[0] in this.classList)) this.classList[obj[0]] = [];
		packageName = obj[0];
		className = obj[1];

		// 別マップのクラス
		if (packageName !== map.name) {
			requiredMapNameSet.add(packageName);
			//funcStrList.push("var " + className + " = " + global_prefix_name + className + ";\n");
			/*********************************/
			externMapList.push(packageName);
			/*********************************/
//			funcList.push(funcName);
		}

		// クラス定義オブジェクト
		var classObj = this.classList[packageName][className];
		classObj.name = className;
		classObj.package = packageName;
		classObj.accessLevel = accessLevelValue;

		// 関数リストを格納していく
		classObj.funcList = [];

		event.pages.forEach(page => {
//			var funcStr = "";

			// 関数の定義を追加
			var funcObj = new FuncDef();
			funcObj.name = null;	// 未定義の場合はnull
			funcObj.args = "";
			funcObj.script = "";

			page.list.forEach(command => {
				// 注釈(一行だけ取り出して関数名と引数名を取得する)
				// TODO: 複数行もそのうちサポートした方がいい
				if (command.code === 108) {
					// スペースを無視して、"関数名(引数1,引数2,…)"の文法と解釈して分解する
					var noteStr = command.parameters[0];
					noteStr = noteStr.replaceAll(" ", "");
					var noteArray = noteStr.match("^(.*)\\((.+(,.+)*)?\\)$");
					if (noteArray) {
						// かっこがある場合は引数を取得する
						funcObj.name = noteArray[1];
						if (noteArray[2]) {
							funcObj.args = noteArray[2];
						}
					} else {
						// かっこが無い場合はそのまま関数名と解釈して取得する
						funcObj.name = noteStr;
					}
				}
				
				if (command.code === 357) {
					// プラグインコマンドの取得
					if (command.parameters[0] === "ClassManager" && command.parameters[1] === "initialize") {
						var obj = command.parameters[3];
						funcObj.script += "this.angle = " + obj.angle + ";\n";
						funcObj.script += "this.blendMode = " + obj.blendMode + ";\n";
						funcObj.script += "this.cellX = " + obj.cellX + ";\n";
						funcObj.script += "this.cellY = " + obj.cellY + ";\n";
						funcObj.script += "this.color = " + obj.color + ";\n";
						funcObj.script += "this.divX = " + obj.divX + ";\n";
						funcObj.script += "this.divY = " + obj.divY + ";\n";
						funcObj.script += "this.filename = '" + obj.name + "';\n";
						funcObj.script += "this.opacity = " + obj.opacity + ";\n";
						funcObj.script += "this.origin = " + obj.origin + ";\n";
						funcObj.script += "this.pictureManager = " + obj.pictureManager + ";\n";
						funcObj.script += "this.scaleX = " + obj.scaleX + ";\n";
						funcObj.script += "this.scaleY = " + obj.scaleY + ";\n";
						funcObj.script += "this.x = " + obj.x + ";\n";
						funcObj.script += "this.y = " + obj.y + ";\n";
					}
				}

				// スクリプト
				if (command.code === 355 || command.code === 655) {
					funcObj.script += command.parameters[0] + "\n";
				}
			});

			// 関数をクラスに追加
			classObj.funcs.push(funcObj);
		});

	});

	// TODO: ここまででクラス定義クラスは全部そろっているはずなので、確認する　それをもとに実際のスクリプトを生成していく
	console.log(this.classList);
	//a();/**/

	// クラスを、親クラス順に並べ替える（親クラスから先に定義しないと、子クラスの定義でオーバーライドが出来ないため）
	let checkedClassNameList = [];
	let classOrderList = [];
	for (packageName in this.classList) {
		// パッケージごと
		console.log("***" + packageName);

		for (className in this.classList[packageName]) {
			// クラスごと
			console.log("///" + className);

			if (!checkedClassNameList.includes(packageName + "." + className)) {
				calcClassOrder(this.classList, packageName, className, classOrderList, checkedClassNameList, 0);
			}
		}
	}
	// calcClassOrderに各クラスのorder番号が付与されているので、その順にソートしなおしたものでthis.classList[packageName]を置き換える
	let newClassList = [];
	classOrderList.sort((a, b) => {
		return a.order < b.order ? -1 : 1;
	});
	classOrderList.forEach(obj => {
		// これでnewClassListには順番にthis.classList[obj.packageName][obj.className]を代入できていることに注意
		console.log(this.classList[obj.packageName][obj.className]);
		if (!(obj.packageName in newClassList)) {
			newClassList[obj.packageName] = [];
		}
		newClassList[obj.packageName][obj.className] = this.classList[obj.packageName][obj.className];
	});
	this.classList = newClassList;
	console.log(this.classList);

	//a();/**/

	// TODO: ★[4/25]更新・描画の処理の追加実装できたので、次は外部クラスの実装考えてみたい（どうあるべきかをまず考えて、↓特化処理に入れるべきかどうかで判断すること）
	// TODO: ★[4/26]外部クラスの実装 簡単な関数はできたはずだが、外部クラスのロードをしないといけないので、一旦外部クラスのロードをどうしたらいいか考える（その前にpublic/private実装する必要あるか？）　その後、外部クラスで色々試してみる（コンストラクタ・デストラクタがあったり継承があったりした場合どうか考える）
	// TODO: ★[4/27]public/privateの実装はできたはず 次は外部クラスのロードとかの外回りを考えてみる
	// TODO: ★[5/8]だいぶ出来てきた 残件はおそらく右記→「外部クラスに★を先頭に付けた場合」「外部クラスを継承した場合」「外部クラスの集約はどうあるべきか」これが出来たらもうリファクタリングはいいと思う
	// TODO: ★[5/9]外部クラスの継承は、「.」のものはうまくいくが、別マップの継承がうまくいかない　これはそもそも、親クラスを後のイベント番号にすると子クラスの継承で親クラスが見つからない、という不具合があり、それに関連する可能性があるので、まずはそれを修正してから考える　それが完了したら、あとは「外部クラスに★を先頭に付けた場合」を確認して、問題なければ完了
	// TODO: ★[5/10]外部クラスの継承は、「.」のものはうまくいくが、別マップの継承がうまくいかない件を修正する　それが完了したら、あとは「外部クラスに★を先頭に付けた場合」を確認して、問題なければ完了
	// TODO: ★[5/14]完了 あとはソースコード綺麗にするだけでいいと思う ただそれまでのミニゲームがうまく動いていないところがあるので、そこは従来コードと比較して確認すること
	// TODO: ★[5/15]雪だるままでは確認完了 次いちご狩り：草の「更新」を通ってなさそう　お花見：桜が進行しない
	// TODO: ★[5/22]羽根つきの、あと何秒でスタートが速すぎる たぶん継承してthis.t++が二重になってるのではと思うが、どこで二重になっているのかよくわからない ログを挿入して追ってみること
	// TODO: ★[5/24]星空滑空で、試しに外部クラスのprivateクラスをutil.XXXで書き換えられるようにしたはずだが、点数達成エフェクトが上書きされない 原因確認すること
	// TODO: ★[5/29]点数達成エフェクトの上書きはたぶんできたので、メモ帳に記録しているタスクを達成していくこと

	// 処理追加の特化処理（コンストラクタ・デストラクタ・初期化・更新・描画・解放関数を追加・修正する）うまくいけば、この後のJavaScript構文作成の処理は分岐なしでスクリプト生成するだけになるかもしれない
	for (packageName in this.classList) {
		// パッケージごと
		console.log("***" + packageName);

		// 外部クラスフラグ
		let externFlg = false;
		if (packageName !== map.name) {
			externFlg = true;
		}

		for (className in this.classList[packageName]) {
			// クラスごと
			console.log("///" + className);

			// 継承元クラス（無ければ空文字列）
			let superClassName = "";
			if (this.classList[packageName][className].nextInheritance.length >= 1) {
				superClassName = this.classList[packageName][className].nextInheritance[0][1];
				console.log(superClassName);
			}
			
			// 通常クラスの場合は特化処理として関数を追加する
			if (!externFlg) {
				// コンストラクタ・デストラクタ・更新・描画・解放関数が無い場合、それぞれ追加する
				["", "~", update_func_name, draw_func_name, release_func_name].forEach(addedFuncName => {
					if (this.classList[packageName][className].funcs.filter(func => func.name === addedFuncName).length == 0) {
						let funcObj = new FuncDef();
						funcObj.name = addedFuncName;
						funcObj.args = "";
						funcObj.script = "";
						this.classList[packageName][className].funcs.push(funcObj);
					}
				});

				// 初期化関数が無い場合は追加して、コンストラクタの内容をそのまま初期化関数に移動する（コンストラクタは空になる）
/*				if (this.classList[packageName][className].funcs.filter(func => func.name === init_func_name).length == 0) {
					let constructor = this.classList[packageName][className].funcs.filter(func => func.name === "")[0];
					let funcObj = new FuncDef();
					funcObj.name = init_func_name;
					funcObj.args = constructor.args;
					funcObj.script = constructor.script;
					constructor.script = "this." + init_func_name + "(" + funcObj.args + ")" + ";\n";
					this.classList[packageName][className].funcs.push(funcObj);
				}*/
			}
			
			this.classList[packageName][className].funcs.forEach(func => {
				// 関数ごと
				console.log(packageName + "/" + className + "/" + func.name);

				let header = "";
				let footer = "";

				if (externFlg) {
					// 外部クラスの場合

/*					if (func.name === "" || func.name === "~") {
						throw new Error("外部クラスにコンストラクタ・デストラクタは設定できません。");
					}*/

					// 親クラスがあるかどうかでsuperの意味が変わる
					// TODO: ↓これはコンストラクタやデストラクタでは使用できないので、コンストラクタやデストラクタで使用できるsuperも定義必要か
					if (superClassName !== "") {
						// 親クラスがある場合はthis.superで呼び出せるようにする
						header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
					} else {
						// 親クラスがない場合は関数のオーバーライドとして扱い、this.superでオーバーライド元を呼び出せるようにする
						header += "this.super = function() { return " + className + "_prototype_" + func.name  + ".apply(this, arguments); };\n";
					}

					
					/*************************************************************************/
					// TODO: ↓このifのかたまりは、「通常クラスの場合」のものをそのままコピペしてきただけなので、本当に良いのか吟味すること　たぶん本来はすべてのクラスが更新や描画を持った親クラスを継承して作られるべき
					let allUpdateFlg = false;
					if (func.name === "") {
						//footer += "this." + init_func_name + "(" + func.args + ")" + ";\n";
/*					}
					else if (func.name === init_func_name) {*/
						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							//header += "this.super = function() { return " + superClassName + ".prototype." + init_func_name + ".apply(this, arguments); };\n";
							header += "this.super = function() { return " + superClassName + ".prototype.constructor.apply(this, arguments); };\n";
						}

						header += "this.cleared = false;\n";	// 自身が消去されたフラグ
						header += "this.list = [];\n";	// 自身が集約するオブジェクト
						header += "this.t = 0;\n";	// 現在時刻をリセットする
						footer += "if (this.filename !== undefined && this.filename != null) {\n";
						footer += "this.picture = this.pictureManager.create(this.filename, this.origin, this.x, this.y, this.scaleX, this.scaleY, this.opacity, this.blendMode);\n";
						footer += "this.picture.setDivNum(this.divX, this.divY);\n";
						footer += "}\n";
					}
					else if (func.name === "~") {
						// デストラクタの場合

						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							header += "this.super = function() { return " + superClassName + ".prototype.destructor.apply(this, arguments); };\n";
						}
					}
					else if (func.name === update_func_name) {
												if (superClassName !== "") {
													header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
						}
						if (superClassName !== "" && func.script === "") {
							footer += "this.super();\n";	// TODO: これは応急処置に近い 本来であれば、すべてのクラスは更新や描画を持った親クラスを継承して作られるべき
						} else {
													// TODO: 本来はこれが正しいと思うのだが、ベイ助のゲームは誤った実装になっていないか？(継承関係のあるクラスそれぞれがt++してないか？)確認すること
													// TODO: 試しに常にthis.t++;するようにしてみた 考えてみたら、super呼ばない限りはthis.t++が重複することは無いのだ super呼ぶときがややこしそう super呼ぶときに限り親クラス側でthis.t++;しないように出来ないものか
													footer += "this.t++;\n";
						}
												allUpdateFlg = true;
											}
											else if (func.name === draw_func_name) {
						/***************************/ if (func.script === "") {
												// 親クラスがある場合はthis.superで呼び出せるようにする
												if (superClassName !== "") {
													header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
												}
						
												header += "if (this.picture !== undefined && this.picture != null) {\n";
												header += "this.picture._targetX = this.x;\n";
												header += "this.picture._targetY = this.y;\n";
												header += "this.picture._targetScaleX = this.scaleX;\n";
												header += "this.picture._targetScaleY = this.scaleY;\n";
												header += "this.picture._targetOpacity = this.opacity;\n";
												header += "this.picture._angle = this.angle;\n";
												header += "this.picture._blendMode = this.blendMode;\n";
												header += "this.picture.tint(this.color, 1);\n";
												header += "this.picture.widthId = this.cellX;\n";
												header += "this.picture.heightId = this.cellY;\n";
												header += "this.pictureManager.draw(this.picture);\n";	// TODO: pictureManagerの扱いはどうする？ 集約している元クラスが持って、集約される側は持たないものか？
												header += "}\n";
						
						/***************************/ }
												allUpdateFlg = true;
											}
											else if (func.name === release_func_name) {
						/***************************/ if (func.script === "") {
												// 親クラスがある場合はthis.superで呼び出せるようにする
												if (superClassName !== "") {
													header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
												}
						
												header += "if (this.picture !== undefined && this.picture != null) {\n";
												header += "this.pictureManager.delete(this.picture);\n";	// TODO: pictureManagerの扱いはどうする？ 集約している元クラスが持って、集約される側は持たないものか？
												header += "this.picture = null;\n";
												header += "}\n";
						
						/***************************/ }
												allUpdateFlg = true;
											}
											else {
												// 普通の関数の場合
						
												// 親クラスがある場合はthis.superで呼び出せるようにする
												if (superClassName !== "") {
													header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
												}
						
											}

											

					// 集約関係にあるオブジェクトをすべて更新する
					if (allUpdateFlg) {
						//**/if (func.name !== "" && func.name !== "~") {
												// TODO: クラス図で集約関係にあるもののみを、この関数の最後に全実行する（現状はlistにあるものをすべて呼んでいる）
												// listにあるオブジェクトのうち、集約関係にあるもののみを全実行する
												footer += "this.list.forEach(obj => {\n";
												footer += "if (obj." + func.name + " !== undefined) {\n";
												footer += "obj." + func.name + "(" + func.args + ");\n";
												footer += "}\n";
												footer += "});\n";
						//**/if (func.name === update_func_name) {
												// clearedが立っているものはthis.listから除外し、解放関数を呼ぶ
												footer += "this.list.forEach(obj => {\n";
												footer += "if (obj.cleared && obj." + release_func_name + " !== undefined) {\n";
												footer += "obj." + release_func_name + "();\n";
												footer += "}\n";
												footer += "});\n";
						
												// clearedが立っているオブジェクトを除外する
												footer += "this.list = this.list.filter(obj => {\n";
												footer += "return !obj.cleared;\n";
												footer += "});\n";
						//**/}}
											}
					// TODO: ↑このifのかたまりは、「通常クラスの場合」のものをそのままコピペしてきただけなので、本当に良いのか吟味すること　たぶん本来はすべてのクラスが更新や描画を持った親クラスを継承して作られるべき
					/*************************************************************************/

				} else {
					// 通常クラスの場合
					let allUpdateFlg = false;

					// コンストラクタの場合
					if (func.name === "") {
						//footer += "this." + init_func_name + "(" + func.args + ")" + ";\n";
/*					}
					else if (func.name === init_func_name) {*/
						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							//header += "this.super = function() { return " + superClassName + ".prototype." + init_func_name + ".apply(this, arguments); };\n";
							header += "this.super = function() { return " + superClassName + ".prototype.constructor.apply(this, arguments); };\n";
						}

						header += "this.cleared = false;\n";	// 自身が消去されたフラグ
						header += "this.list = [];\n";	// 自身が集約するオブジェクト
						header += "this.t = 0;\n";	// 現在時刻をリセットする
						footer += "if (this.filename !== undefined && this.filename != null) {\n";
						footer += "this.picture = this.pictureManager.create(this.filename, this.origin, this.x, this.y, this.scaleX, this.scaleY, this.opacity, this.blendMode);\n";
						footer += "this.picture.setDivNum(this.divX, this.divY);\n";
						footer += "}\n";
					}
					else if (func.name === "~") {
						// デストラクタの場合

						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							header += "this.super = function() { return " + superClassName + ".prototype.destructor.apply(this, arguments); };\n";
						}
					}
					else if (func.name === update_func_name) {
//***************************/ if (func.script === "") {
						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
/**/}
//**/						} else {
							// 親クラスが無い場合は現在時刻を増加する
if (superClassName !== "" && func.script === "") {
	footer += "this.super();\n";	// TODO: これは応急処置に近い 本来であれば、すべてのクラスは更新や描画を持った親クラスを継承して作られるべき
} else {
							// TODO: 本来はこれが正しいと思うのだが、ベイ助のゲームは誤った実装になっていないか？(継承関係のあるクラスそれぞれがt++してないか？)確認すること
							// TODO: 試しに常にthis.t++;するようにしてみた 考えてみたら、super呼ばない限りはthis.t++が重複することは無いのだ super呼ぶときがややこしそう super呼ぶときに限り親クラス側でthis.t++;しないように出来ないものか
							footer += "this.t++;\n";
}
//**/						}
//***************************/ }
						allUpdateFlg = true;
					}
					else if (func.name === draw_func_name) {
/***************************/ if (func.script === "") {
						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
						}

						header += "if (this.picture !== undefined && this.picture != null) {\n";
						header += "this.picture._targetX = this.x;\n";
						header += "this.picture._targetY = this.y;\n";
						header += "this.picture._targetScaleX = this.scaleX;\n";
						header += "this.picture._targetScaleY = this.scaleY;\n";
						header += "this.picture._targetOpacity = this.opacity;\n";
						header += "this.picture._angle = this.angle;\n";
						header += "this.picture._blendMode = this.blendMode;\n";
						header += "this.picture.tint(this.color, 1);\n";
						header += "this.picture.widthId = this.cellX;\n";
						header += "this.picture.heightId = this.cellY;\n";
						header += "this.pictureManager.draw(this.picture);\n";	// TODO: pictureManagerの扱いはどうする？ 集約している元クラスが持って、集約される側は持たないものか？
						header += "}\n";

/***************************/ }
						allUpdateFlg = true;
					}
					else if (func.name === release_func_name) {
/***************************/ if (func.script === "") {
						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
						}

						header += "if (this.picture !== undefined && this.picture != null) {\n";
						header += "this.pictureManager.delete(this.picture);\n";	// TODO: pictureManagerの扱いはどうする？ 集約している元クラスが持って、集約される側は持たないものか？
						header += "this.picture = null;\n";
						header += "}\n";

/***************************/ }
						allUpdateFlg = true;
					}
					else {
						// 普通の関数の場合

						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
						}

					}

					// 集約関係にあるオブジェクトをすべて更新する
					if (allUpdateFlg) {
//**/if (func.name !== "" && func.name !== "~") {
						// TODO: クラス図で集約関係にあるもののみを、この関数の最後に全実行する（現状はlistにあるものをすべて呼んでいる）
						// listにあるオブジェクトのうち、集約関係にあるもののみを全実行する
						footer += "this.list.forEach(obj => {\n";
						footer += "if (obj." + func.name + " !== undefined) {\n";
						footer += "obj." + func.name + "(" + func.args + ");\n";
						footer += "}\n";
						footer += "});\n";
//**/if (func.name === update_func_name) {
						// clearedが立っているものはthis.listから除外し、解放関数を呼ぶ
						footer += "this.list.forEach(obj => {\n";
						footer += "if (obj.cleared && obj." + release_func_name + " !== undefined) {\n";
						footer += "obj." + release_func_name + "();\n";
						footer += "}\n";
						footer += "});\n";

						// clearedが立っているオブジェクトを除外する
						footer += "this.list = this.list.filter(obj => {\n";
						footer += "return !obj.cleared;\n";
						footer += "});\n";
//**/}}
					}

				}

				// スクリプトの前後にヘッダ文字列とフッタ文字列を追加する
				func.script = header + func.script + footer;
			});

		}
	}

	// ここからJavaScriptの構文を作っていく

	// TODO: まずすべてのクラスに描画・更新の処理を追加する　またlistにある処理を全実行する処理も追加する　コンストラクタにも処理追加必要かも　追加が終わった後に、JavaScriptへ変換していく
	// TODO: 他マップのクラスはこの前にロードが必要になるが、まずはここでの生成はマップ単位に限定して、そのあとでどの順番にevalするかというのを決める
	
	// TODO: 種類ごとに生成するスクリプトを分ける
	// クラスがpublic/private
	// クラスが普通のクラス/外部クラス
	// [OK]クラスが継承元を持っている/持っていない
	// [OK]関数がコンストラクタ/デストラクタ/その他の関数
	// ↑上記全パターンを書き下してみて、どう条件分岐を実装すればいいか考えればよい

	// クラスのスクリプト
	var classFuncStr = "";

	// 外部クラスのスクリプト
	var externClassFuncStr = "";

	// TODO: classFuncStrを使わずに全部externClassFuncStrにしたら正常動作する？（そうすると全部initMapでロードすることになるので確かに筋は通る）それならexternClassFuncStrだけで済むよう以下見直すこと

	//this.classList.forEach((package) => {
	for (packageName in this.classList) {
		// パッケージごと
		console.log("***" + packageName);

		// 外部クラスフラグ
		let externFlg = false;
		if (packageName !== map.name) {
			externFlg = true;
		}

		// クラスのスクリプト
		var funcStr = "";

		//package.forEach((classObj) => {
		for (className in this.classList[packageName]) {
			// クラスごと
			console.log("///" + className);

			// 継承元クラス（無ければ空文字列）
			let superClassName = "";
			if (this.classList[packageName][className].nextInheritance.length >= 1) {
				superClassName = this.classList[packageName][className].nextInheritance[0][1];
				console.log(superClassName);
			}

			// privateの場合はvar宣言しておく
			if (this.classList[packageName][className].accessLevel == 0) {
				if (externFlg) {
					if (packageName !== "") {
						// パッケージ名が空の場合は外部システムで定義されたクラスと認識する 空でない場合は他マップに存在すると仮定してglobalのものと関連付ける
						//funcStr += "if (typeof global." + className + " === 'function') var " + className + " = global." + className + ";\n";
						funcStr += "var " + className + " = " + global_prefix_name + packageName + "." + className + ";\n";
					}
				} else {
					funcStr += "var " + className + ";\n";
				}
				/***********************************
				if (externFlg) {
					classFuncStr += className + " = util.ゲーム進行管理;\n";
				}
				/***********************************/
			}
	
			this.classList[packageName][className].funcs.forEach(func => {
				// 関数ごと
				console.log(packageName + "/" + className + "/" + func.name);

				// nullの関数は生成しない
				if (func.name === null) {
					return;
				}

				// public宣言の場合は"global." を付ける
				let classPrefix = "";
				if (this.classList[packageName][className].accessLevel == 1) {
					classPrefix = global_prefix_name;
				}

				// コンストラクタの場合
				if (func.name === "") {
					// コンストラクタの定義
					if (externFlg) {
						funcStr += "let " + className + "_prototype = Object.create(" + className + ".prototype);\n";
					}
					funcStr += classPrefix + className + " = function(" + func.args + ") {\n";
					
					//funcStr += "this." + init_func_name + "(" + func.args + ")" + ";\n";
					funcStr += func.script + "\n";
					funcStr += "};\n";

					if (externFlg) {
						funcStr += classPrefix + className + ".prototype = " + className + "_prototype;\n";
					}

					// 親クラスがある場合は継承する
					if (superClassName !== "") {
						funcStr += classPrefix + className + ".prototype = Object.create(" + superClassName + ".prototype);\n";
						funcStr += classPrefix + className + ".prototype.constructor = " + classPrefix + className + ";\n";
					}
				}
/*				else if (func.name === init_func_name) {

					// 外部クラスの場合はオーバーライド元を変数に控えておく
					if (externFlg) {
						funcStr += "let " + className + "_prototype_" + func.name + " = " + className + ".prototype." + func.name + ";\n"
					}

					// 初期化関数の定義
					funcStr += classPrefix + className + ".prototype." + func.name + " = function(" + func.args + ") {\n";

//					classFuncStr += "this.cleared = false;\n";	// 自身が消去されたフラグ
//					classFuncStr += "this.list = [];\n";	// 自身が集約するオブジェクト
//					classFuncStr += "this.t = 0;\n";	// 現在時刻をリセットする
					funcStr += func.script + "\n";
//					classFuncStr += "if (this.filename !== undefined && this.filename != null) {\n";
//					classFuncStr += "this.picture = this.pictureManager.create(this.filename, this.origin, this.x, this.y, this.scaleX, this.scaleY, this.opacity, this.blendMode);\n";
//					classFuncStr += "this.picture.setDivNum(this.divX, this.divY);\n";
					//classFuncStr += "}\n";
					funcStr += "};\n";
				}*/
				else if (func.name === "~") {
					// デストラクタの場合
					funcStr += classPrefix + className + ".prototype.destructor" + " = function(" + func.args + ") {\n";
					funcStr += func.script + "\n";
					funcStr += "};\n";
				}
				else {
					// 普通の関数の場合

					// 外部クラスの場合はオーバーライド元を変数に控えておく
					if (externFlg) {
						funcStr += "let " + className + "_prototype_" + func.name + " = " + className + ".prototype." + func.name + ";\n"
					}

					funcStr += classPrefix + className + ".prototype." + func.name + " = function(" + func.args + ") {\n";
					funcStr += func.script;
					funcStr += "};\n";
				}

				


			});

			if (this.classList[packageName][className].accessLevel == 0) {
				if (externFlg) {
					if (packageName !== "") {
						// 外部クラスのコンストラクタが更新されるときは、最後に参照元を更新しなおす
						funcStr += global_prefix_name + packageName + "." + className + " = " + className + ";\n";
					}
				}
			}
	
		//});
		}

		// クラスのスクリプトに、内部or外部で分岐して書き込む
		/*************************************************
		if (externFlg) {
			externClassFuncStr += funcStr;
		} else {
			classFuncStr += funcStr;
		}
		/*************************************************/
		externClassFuncStr += funcStr;
		/*************************************************/

	//});
	}

	// 自分自身のマップではすべてのクラスに参照できるよう、globalを除いたクラス名でvar宣言しておく
	// TODO: もうこれ要らないのでは？ 意味なくなってる
	/*for (packageName in this.classList) {
		for (className in this.classList[packageName]) {
			if (this.classList[packageName][className].accessLevel === 1) {
				// publicの場合
				classFuncStr += "var " + this.classList[packageName][className].name + " = " + global_prefix_name + this.classList[packageName][className].name + ";\n"
			}
		}
	}*/
	/*
	classNameList.forEach(obj => {
		if (accessLevelList[obj] === 1) {
			// publicの場合
			classFuncStr += "var " + obj + " = " + global_prefix_name + obj + ";\n"
		}
	});
	*/

	// 別マップにあるクラスの参照を初期化関数で行うように設定する
	// TODO: もうこれ要らないのでは？ 意味なくなってる
	/*externMapList.forEach(obj => {
		if (obj !== "") {
			classFuncStr += "var " + obj + ";\n";
		}
	});*/

	// クラス初期化関数の定義
	classFuncStr += "classInitializer.initMap" + mapId + " = function() {\n";
/*	externMapList.forEach(obj => {
		if (obj !== "") {
			classFuncStr += obj + " = " + global_prefix_name + obj + ";\n";
		}
	});*/

	// 外部クラスの関数定義
	classFuncStr += externClassFuncStr;

	// 全クラスをマップの要素として持たせておく
	for (className in this.classList[map.name]) {
		if (this.classList[map.name][className].accessLevel == 1) {
			classFuncStr += "global." + map.name + "." + this.classList[map.name][className].name + " = " + "global." + this.classList[map.name][className].name + ";\n";
		} else {
			classFuncStr += "global." + map.name + "." + this.classList[map.name][className].name + " = " + this.classList[map.name][className].name + ";\n";
		}
	}

	classFuncStr += "};\n";

	// 外側にスコープ用のfunctionを追加
	//classFuncStr = "(function() {\n" + classFuncStr + "}());\n";
	classFuncStr = "global." + map.name + " = new (function() {\n" + classFuncStr + "})();\n";

	// クラス初期化関数の呼び出し
	// TODO: ★これはここじゃなくて、外側でやるのかも？？？？
	//classFuncStr += "classInitializer.initMap" + mapId + "();\n";

	console.log(classFuncStr);
	//b();/**/

	return [classFuncStr, Array.from(requiredMapNameSet)];
};

//-------------------------------------------------------------------------------------------------------------------------

// TODO: 以下 別マップのクラスを持ってくる机上サンプル
/*
	マップ1には、class1A, class1B, class1Cの3クラスがあり、
	マップ2には、class2A, class2B, class2Cの3クラスがある
	マップ1, マップ2, … の各々のクラス定義は、「すべて」登録しておいて、それぞれはラムダ式のスコープに含めておく

	class1Cのみを公開クラスとしておいて、class2Cから呼び出すよう設定しておく
	これは、マップ2のラムダ式内で、varとしてマップ1のclass1Cを宣言し、それを使えるようにすることで実現する
	それぞれのクラス名は、先頭に例えば「global_」などを自動付与するなどして、実装者が使わないようなキーワードにわざとしておく（実はすべてグローバル宣言されている）
	実装者は通常「global_class1C」として呼び出すのではなく、もとのクラス名のとおり、「class1C」として呼び出すはずであるから、
	それのvarで再宣言してやることで実現する仕組みである

	あとは、別マップの読み込みが簡単に出来るかどうかが問題である
*/

// マップ1のクラス
(() => {

	global_class1A = function() {
		console.log("class1A");
	};
	global_class1B = function() {
		console.log("class1B");
	};
	global_class1C = function() {
		console.log("class1C");
	};

})();

// マップ2のクラス
(() => {

	// マップ1で
	var class1C = global_class1C;

	global_class2A = function() {
		console.log("class2A");
	};
	global_class2B = function() {
		console.log("class2B");
	};
	global_class2C = function() {
		console.log("class2C");
		var tmp = new class1C();
	};

})();

var a = new global_class2C();
//var b = new class1C();









