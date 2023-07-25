/*:ja
 * @target MZ
 * @plugindesc ピクチャ指向プログラミング管理プラグイン ver0.01
 * @author フェルミウム湾
 *
 * @help ピクチャ指向プログラミングによるツール開発を行うための機能をサポートします。
 * ピクチャ指向プログラミングは、ピクチャを主体としたイベント「クラス」を用いて
 * クラスのつなぎ合わせによってシステムを構築するものです。
 * このプラグインを使用するには、予めタイルセット「クラス図」を導入ください。
 * 
 * クラスの作成方法は、以下のブログを参考願います。
 * https://fermiumbay13.hatenablog.com/
 * 
 * 作成したクラスは、スクリプトコマンドにて、以下を入力することで使用できます。
 * 
 * let popManager = new PopManager(); // インスタンス生成
 * popManager.registClasses(10, []); // マップ10番ロード
 * popManager.run(); // プログラム実行
 * 
 * PopManagerのインスタンスは、registClasses関数でロードし、
 * run関数でロードしたプログラムをすべて実行します。
 * 上記は、マップ10番のクラスをロードし、それを実行する例です。
 * 
 * registClasses関数は、ロードしたマップが「クラス図」であることを前提として、
 * マップ全体をトレースし、図からJavaScriptのソースコードに変換します。
 * 変換されたソースコードは、PopManagerのインスタンスが
 * script変数にて文字列として保持します。
 * run関数は、script変数の内容をevalでそのまま実行するだけです。
 * 
 * なお、本プラグインではプラグインコマンドとして
 * ピクチャの初期化処理を使用可能です。
 * クラスのコンストラクタに挿入して使用ください。
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
 * @default global.mainLayer
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

PopManager = function() {
	// 生成したJavaScriptコード
	this.script = "";
	eval("global = new function(){};\n");	// グローバル変数を初期化する
	eval("classInitializer = new function(){};\n");	// クラス初期化用の構造体を初期化する
};

PopManager.prototype.run = function() {
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
						break;
					case 2:
						classList[obj[0]][obj[1]].prevInheritance.push([baseObj[0], baseObj[1]]);
						classList[baseObj[0]][baseObj[1]].nextInheritance.push([obj[0], obj[1]]);
						break;
					case 3:
						classList[obj[0]][obj[1]].prevExecute.push([baseObj[0], baseObj[1]]);
						classList[baseObj[0]][baseObj[1]].nextExecute.push([obj[0], obj[1]]);
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

};

var update_func_name = "更新";

var draw_func_name = "描画";	// TODO: この関数は、本プログラムで自動生成する(pictureを描画するだけ)

var release_func_name = "解放";	// TODO: この関数は、本プログラムで自動生成する(pictureを解放するだけ)

var global_prefix_name = "global.";

// 指定したマップIDのクラスをすべて登録する（別マップのクラスも再帰的にロードする）　第二引数は、ロード済みマップ名（空からスタート）
PopManager.prototype.registClasses = function(mapId, loadedMapNameList)  {

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
	this.script += loadMapInfo[0] + "\n";

	// そのマップ全体のクラスの初期化関数をここで呼んでおく
	var callInitStr = "";
	callInitStr += "classInitializer.initMap" + mapId + "();\n";
	this.script += callInitStr + "\n";
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

// クラスの親子関係を走査して、親クラスの方が小さい番号になるようclassOrderListに各クラスの番号を付与していく
var calcClassOrder = function(classList, packageName, className, classOrderList, checkedClassNameList, order) {
	if (checkedClassNameList.includes(packageName + "." + className)) {
		return;
	}
	checkedClassNameList.push(packageName + "." + className);
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

	this.classList = [];

	// イベント一覧の取得
	var map = $dataMapInfos[mapId];

	createClassMap(mapObj, map.name);

	// 他マップのクラス一覧
	var externMapList = [];
	mapObj.events.forEach(event => {
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
			externMapList.push(packageName);
		}

		// クラス定義オブジェクト
		var classObj = this.classList[packageName][className];
		classObj.name = className;
		classObj.package = packageName;
		classObj.accessLevel = accessLevelValue;

		// 関数リストを格納していく
		classObj.funcList = [];

		event.pages.forEach(page => {

			// 関数の定義を追加
			var funcObj = new FuncDef();
			funcObj.name = null;	// 未定義の場合はnull
			funcObj.args = "";
			funcObj.script = "";

			page.list.forEach(command => {
				// 注釈(一行だけ取り出して関数名と引数名を取得する)
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
					if (command.parameters[0] === "PopManager" && command.parameters[1] === "initialize") {
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

	// クラスを、親クラス順に並べ替える（親クラスから先に定義しないと、子クラスの定義でオーバーライドが出来ないため）
	let checkedClassNameList = [];
	let classOrderList = [];
	for (packageName in this.classList) {
		// パッケージごと
		for (className in this.classList[packageName]) {
			// クラスごと
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
		if (!(obj.packageName in newClassList)) {
			newClassList[obj.packageName] = [];
		}
		newClassList[obj.packageName][obj.className] = this.classList[obj.packageName][obj.className];
	});
	this.classList = newClassList;

	// 処理追加の特化処理（コンストラクタ・デストラクタ・初期化・更新・描画・解放関数を追加・修正する）うまくいけば、この後のJavaScript構文作成の処理は分岐なしでスクリプト生成するだけになるかもしれない
	for (packageName in this.classList) {
		// パッケージごと

		// 外部クラスフラグ
		let externFlg = false;
		if (packageName !== map.name) {
			externFlg = true;
		}

		for (className in this.classList[packageName]) {
			// クラスごと

			// 継承元クラス（無ければ空文字列）
			let superClassName = "";
			if (this.classList[packageName][className].nextInheritance.length >= 1) {
				superClassName = this.classList[packageName][className].nextInheritance[0][1];
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
			}
			
			this.classList[packageName][className].funcs.forEach(func => {
				// 関数ごと

				let header = "";
				let footer = "";

				if (externFlg) {
					// 外部クラスの場合

					// 親クラスがあるかどうかでsuperの意味が変わる
					// TODO: ↓これはコンストラクタやデストラクタでは使用できないので、コンストラクタやデストラクタで使用できるsuperも定義必要か
					if (superClassName !== "") {
						// 親クラスがある場合はthis.superで呼び出せるようにする
						header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
					} else {
						// 親クラスがない場合は関数のオーバーライドとして扱い、this.superでオーバーライド元を呼び出せるようにする
						header += "this.super = function() { return " + className + "_prototype_" + func.name  + ".apply(this, arguments); };\n";
					}

					
					let allUpdateFlg = false;
					if (func.name === "") {
						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							header += "this.super = function() { return " + superClassName + ".prototype.constructor.apply(this, arguments); };\n";
						}

						header += "this.cleared = false;\n";	// 自身が消去されたフラグ
						header += "this.list = [];\n";	// 自身が集約するオブジェクト
						header += "this.t = 0;\n";	// 現在時刻をリセットする
						header += "(function() {\n";
						footer += "}).apply(this);\n";
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

						// allUpdateFlgがある関数は、内部で return true; とすると後の更新処理を行わないようにできるため、if文つきの匿名関数で囲う
						header += "if (!(function() {\n";
						footer += "}).apply(this)) {\n";

						if (superClassName !== "" && func.script === "") {
							footer += "this.super();\n";	// TODO: これは応急処置に近い 本来であれば、すべてのクラスは更新や描画を持った親クラスを継承して作られるべき
						} else {
							footer += "this.t++;\n";
						}
						allUpdateFlg = true;
					}
					else if (func.name === draw_func_name) {
						if (func.script === "") {
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
						}

						// allUpdateFlgがある関数は、内部で return true; とすると後の更新処理を行わないようにできるため、if文つきの匿名関数で囲う
						header += "if (!(function() {\n";
						footer += "}).apply(this)) {\n";
						allUpdateFlg = true;
					}
					else if (func.name === release_func_name) {
						if (func.script === "") {
							// 親クラスがある場合はthis.superで呼び出せるようにする
							if (superClassName !== "") {
								header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
							}
						
							header += "if (this.picture !== undefined && this.picture != null) {\n";
							header += "this.pictureManager.delete(this.picture);\n";	// TODO: pictureManagerの扱いはどうする？ 集約している元クラスが持って、集約される側は持たないものか？
							header += "this.picture = null;\n";
							header += "}\n";			
						}

						// allUpdateFlgがある関数は、内部で return true; とすると後の更新処理を行わないようにできるため、if文つきの匿名関数で囲う
						header += "if (!(function() {\n";
						footer += "}).apply(this)) {\n";	
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
						// TODO: クラス図で集約関係にあるもののみを、この関数の最後に全実行する（現状はlistにあるものをすべて呼んでいる）
						// listにあるオブジェクトのうち、集約関係にあるもののみを全実行する
						footer += "this.list.forEach(obj => {\n";
						footer += "if (obj." + func.name + " !== undefined) {\n";
						footer += "obj." + func.name + "(" + func.args + ");\n";
						footer += "}\n";
						footer += "});\n";
				
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
						
						footer += "}\n";
					}

				} else {
					// 通常クラスの場合
					let allUpdateFlg = false;

					// コンストラクタの場合
					if (func.name === "") {
						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							header += "this.super = function() { return " + superClassName + ".prototype.constructor.apply(this, arguments); };\n";
						}

						header += "this.cleared = false;\n";	// 自身が消去されたフラグ
						header += "this.list = [];\n";	// 自身が集約するオブジェクト
						header += "this.t = 0;\n";	// 現在時刻をリセットする
						header += "(function() {\n";
						footer += "}).apply(this);\n";
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
						// 親クラスがある場合はthis.superで呼び出せるようにする
						if (superClassName !== "") {
							header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
						}

						// allUpdateFlgがある関数は、内部で return true; とすると後の更新処理を行わないようにできるため、if文つきの匿名関数で囲う
						header += "if (!(function() {\n";
						footer += "}).apply(this)) {\n";

						// 親クラスが無い場合は現在時刻を増加する
						if (superClassName !== "" && func.script === "") {
							footer += "this.super();\n";
						} else {
							footer += "this.t++;\n";
						}
						allUpdateFlg = true;
					}
					else if (func.name === draw_func_name) {
						if (func.script === "") {
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
						}

						// allUpdateFlgがある関数は、内部で return true; とすると後の更新処理を行わないようにできるため、if文つきの匿名関数で囲う
						header += "if (!(function() {\n";
						footer += "}).apply(this)) {\n";
						allUpdateFlg = true;
					}
					else if (func.name === release_func_name) {
						if (func.script === "") {
							// 親クラスがある場合はthis.superで呼び出せるようにする
							if (superClassName !== "") {
								header += "this.super = function() { return " + superClassName + ".prototype." + func.name + ".apply(this, arguments); };\n";
							}

							header += "if (this.picture !== undefined && this.picture != null) {\n";
							header += "this.pictureManager.delete(this.picture);\n";	// TODO: pictureManagerの扱いはどうする？ 集約している元クラスが持って、集約される側は持たないものか？
							header += "this.picture = null;\n";
							header += "}\n";
						}

						// allUpdateFlgがある関数は、内部で return true; とすると後の更新処理を行わないようにできるため、if文つきの匿名関数で囲う
						header += "if (!(function() {\n";
						footer += "}).apply(this)) {\n";
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
						// TODO: クラス図で集約関係にあるもののみを、この関数の最後に全実行する（現状はlistにあるものをすべて呼んでいる）
						// listにあるオブジェクトのうち、集約関係にあるもののみを全実行する
						footer += "this.list.forEach(obj => {\n";
						footer += "if (obj." + func.name + " !== undefined) {\n";
						footer += "obj." + func.name + "(" + func.args + ");\n";
						footer += "}\n";
						footer += "});\n";

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
						
						footer += "}\n";
					}
				}

				// スクリプトの前後にヘッダ文字列とフッタ文字列を追加する
				func.script = header + func.script + footer;
			});
		}
	}

	// ここからJavaScriptの構文を作っていく

	// クラスのスクリプト
	var classFuncStr = "";

	// 外部クラスのスクリプト
	var externClassFuncStr = "";

	for (packageName in this.classList) {
		// パッケージごと

		// 外部クラスフラグ
		let externFlg = false;
		if (packageName !== map.name) {
			externFlg = true;
		}

		// クラスのスクリプト
		var funcStr = "";

		for (className in this.classList[packageName]) {
			// クラスごと

			// 継承元クラス（無ければ空文字列）
			let superClassName = "";
			if (this.classList[packageName][className].nextInheritance.length >= 1) {
				superClassName = this.classList[packageName][className].nextInheritance[0][1];
			}

			// privateの場合はvar宣言しておく
			if (this.classList[packageName][className].accessLevel == 0) {
				if (externFlg) {
					if (packageName !== "") {
						// パッケージ名が空の場合は外部システムで定義されたクラスと認識する 空でない場合は他マップに存在すると仮定してglobalのものと関連付ける
						funcStr += "var " + className + " = " + global_prefix_name + packageName + "." + className + ";\n";
					}
				} else {
					funcStr += "var " + className + ";\n";
				}
			}
	
			this.classList[packageName][className].funcs.forEach(func => {
				// 関数ごと

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
	
		}

		externClassFuncStr += funcStr;

	}

	// クラス初期化関数の定義
	classFuncStr += "classInitializer.initMap" + mapId + " = function() {\n";

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
	classFuncStr = "global." + map.name + " = new (function() {\n" + classFuncStr + "})();\n";

	return [classFuncStr, Array.from(requiredMapNameSet)];
};
