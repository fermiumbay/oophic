/*:ja
 * @target MZ
 * @plugindesc クラス管理をするマネージャー
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
};

ClassManager = function() {
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
ClassManager.prototype.createClassMap = function(mapName) {
	// クラス一覧
	this.classList[mapName] = [];

	// 各チップの接続情報を取得する
	chip = [];
	for (var x = 0; x < $dataMap.width; x++) {
		chip[x] = [];
		for (var y = 0; y < $dataMap.height; y++) {
			var i = x + $dataMap.width * y;
			switch ($dataMap.data[i]) {
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
	
	$gameMap._events.forEach(event => {
		// イベントのクラス定義オブジェクトを生成しておく
		this.classList[mapName][event.event().name] = new ClassDef();

		// 各イベントの座標をチップ情報に追加する
		var x = event.event().x;
		var y = event.event().y;
		chip[x][y].eventId = event.event().id;
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
				baseEventName = $gameMap._events[chip[baseX][baseY].eventId].event().name;
				eventName = $gameMap._events[chip[x][y].eventId].event().name;

				// 矢印の種類ごとに関係を登録
				switch (arrowType) {
					case 1:
						classList[mapName][eventName].prevAggregation.push([mapName, baseEventName]);
						classList[mapName][baseEventName].nextAggregation.push([mapName, eventName]);
						//console.log("集約:" + baseEventName + "=>" + eventName);
						break;
					case 2:
						classList[mapName][eventName].prevInheritance.push([mapName, baseEventName]);
						classList[mapName][baseEventName].nextInheritance.push([mapName, eventName]);
						//console.log("汎化:" + baseEventName + "=>" + eventName);
						break;
					case 3:
						classList[mapName][eventName].prevExecute.push([mapName, baseEventName]);
						classList[mapName][baseEventName].nextExecute.push([mapName, eventName]);
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
	$gameMap._events.forEach(event => {
		for (var x = 0; x < $dataMap.width; x++) {
			for (var y = 0; y < $dataMap.height; y++) {
				chip[x][y].searchedLeftRightFlg = false;
				chip[x][y].searchedUpDownFlg = false;
			}
		}	
		var x = event.event().x;
		var y = event.event().y;
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
		if (x < $dataMap.width - 1) {
			if (chip[x + 1][y].eventId == 0) {
				search(x + 1, y, 6, x, y, 6, this.classList);
			}
		}
		if (y < $dataMap.height - 1) {
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

// 一般関数のソースコード文字列を取得する
var getFuncStr = function(className, funcName, args, commandStr, superClassName, allUpdateFlg) {
	var ret = "";
	ret += className + ".prototype." + funcName + " = function(" + args + ") {\n";
				
	// 親クラスがある場合はthis.superで呼び出せるようにする
	if (superClassName !== "") {
		ret += className + ".prototype.super = function() { " + superClassName + ".prototype." + funcName + ".apply(this, arguments); };\n";
	}

	ret += commandStr + "\n";
	
	// 集約関係にあるオブジェクトをすべて更新する
	if (allUpdateFlg) {
		// TODO: クラス図で集約関係にあるもののみを、この関数の最後に全実行する（現状はlistにあるものをすべて呼んでいる）
		// listにあるオブジェクトのうち、集約関係にあるもののみを全実行する
		ret += "this.list.forEach(obj => {\n"
		ret += "if (obj." + funcName + " !== undefined) {\n"
		ret += "obj." + funcName + "(" + args + ");\n"
		ret += "}\n"
		ret += "});\n";
	
		// clearedが立っているものはthis.listから除外し、解放関数を呼ぶ
		ret += "this.list.forEach(obj => {\n";
		ret += "if (obj.cleared && obj." + release_func_name + " !== undefined) {\n";
		ret += "obj." + release_func_name + "();\n";
		ret += "}\n";
		ret += "});\n";
		
		// clearedが立っているオブジェクトを除外する
		ret += "this.list = this.list.filter(obj => {\n";
		ret += "return !obj.cleared;\n";
		ret += "});\n";
	}

	ret += "};\n";
	return ret;
}

ClassManager.prototype.run = function() {

	// マップ名/イベント名の対でリスト保持する
	//this.classList = [];

	this.classList = [];

	// イベント一覧の取得
	var mapId = $gameMap._mapId;	// TODO: 現在マップIDのものを採用する（別マップの場合はロード処理が必要になる）
	var map = $dataMapInfos[mapId];
	console.log("マップ名:" + map.name);

	// TODO: この段階で、イベント名の関係をすべて取得しておく
	this.createClassMap(map.name);
	
	$gameMap._events.forEach(event => {

		console.log(" イベント名:" + event.event().name);

		// クラス名
		var className = event.event().name;

		// 「メイン」は処理しない
		if (className === "メイン") {
			return;
		}

		// 親クラス名
		var superClassName = "";
		if (this.classList[map.name][className].nextInheritance.length >= 1) {
			superClassName = this.classList[map.name][className].nextInheritance[0][1];
		}

		// 登録した関数リスト
		var funcList = [];

		var funcStr = "";
		event.event().pages.forEach(page => {

			// コマンド一覧
			var commandStr = "";
			var funcName = "";
			var args = "";
			//var pluginFuncName = "";
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
						funcName = noteArray[1];
						if (noteArray[2]) {
							args = noteArray[2];
						}
					} else {
						// かっこが無い場合はそのまま関数名と解釈して取得する
						funcName = noteStr;
					}
				}
				
				if (command.code === 357) {
					// プラグインコマンドの取得
					if (command.parameters[0] === "ClassManager" && command.parameters[1] === "initialize") {
						var obj = command.parameters[3];
						commandStr += "this.angle = " + obj.angle + ";\n";
						commandStr += "this.blendMode = " + obj.blendMode + ";\n";
						commandStr += "this.cellX = " + obj.cellX + ";\n";
						commandStr += "this.cellY = " + obj.cellY + ";\n";
						commandStr += "this.color = " + obj.color + ";\n";
						commandStr += "this.divX = " + obj.divX + ";\n";
						commandStr += "this.divY = " + obj.divY + ";\n";
						commandStr += "this.filename = '" + obj.name + "';\n";
						commandStr += "this.opacity = " + obj.opacity + ";\n";
						commandStr += "this.origin = " + obj.origin + ";\n";
						commandStr += "this.pictureManager = " + obj.pictureManager + ";\n";
						commandStr += "this.scaleX = " + obj.scaleX + ";\n";
						commandStr += "this.scaleY = " + obj.scaleY + ";\n";
						commandStr += "this.x = " + obj.x + ";\n";
						commandStr += "this.y = " + obj.y + ";\n";
					}
				}

				// スクリプト
				if (command.code === 355 || command.code === 655) {
					commandStr += command.parameters[0] + "\n";
				}
			});
			
			if (funcName === "" || funcName === init_func_name) {
				// コンストラクタ
				funcStr += className + " = function(" + args + ") {\n";

				// TODO: 他クラスとの継承・集約関係について、ここの解析前に明らかにしておき（マップでかいたクラス図を解析しておく）その情報をここのコンストラクタに持たせる
				funcStr += "this." + init_func_name + "(" + args + ")" + "\n";
				funcStr += "};\n";

				// 親クラスがある場合は継承させる
				if (superClassName !== "") {
					funcStr += className + ".prototype = Object.create(" + superClassName + ".prototype);\n";
					funcStr += className + ".prototype.constructor = " + className + ";\n";
				}

				// 初期化関数
				funcStr += className + ".prototype." + init_func_name + " = function(" + args + ") {\n";

				// 親クラスがある場合はthis.superで呼び出せるようにする
				if (superClassName !== "") {
					funcStr += className + ".prototype.super = function() { " + superClassName + ".prototype." + init_func_name + ".apply(this, arguments); };\n";
				}

				funcStr += "this.cleared = false;\n";	// 自身が消去されたフラグ
				funcStr += "this.list = [];\n";	// 自身が集約するオブジェクト
				funcStr += "this.t = 0;\n";	// 現在時刻をリセットする
				funcStr += commandStr + "\n";
				funcStr += "if (this.filename !== undefined && this.filename != null) {\n";
				funcStr += "this.picture = this.pictureManager.create(this.filename, this.origin, this.x, this.y, this.scaleX, this.scaleY, this.opacity, this.blendMode);\n";
				funcStr += "this.picture.setDivNum(this.divX, this.divY);\n";
				funcStr += "}\n";
				funcStr += "};\n";
				
			} else if (funcName === "~") {
				// デストラクタ
				funcStr += className + ".prototype.destructor" + " = function(" + args + ") {\n";
				
				// 親クラスがある場合はthis.superで呼び出せるようにする
				if (superClassName !== "") {
					funcStr += className + ".prototype.super = function() { " + superClassName + ".prototype." + funcName + ".apply(this, arguments); };\n";
				}

				funcStr += commandStr + "\n";
				funcStr += "};\n";
			} else {
				// 更新関数の場合は現在時刻を増加する
				if (funcName === update_func_name) {
					commandStr += "this.t++;\n"
				}

				// その他
				funcStr += getFuncStr(className, funcName, args, commandStr, superClassName, funcName === update_func_name);
			}
			console.log(funcStr);
			eval(funcStr);

			funcList.push(funcName);
		});

		// 描画関数を自動生成する
		if (!funcList.includes(draw_func_name)) {
			commandStr = "";
			commandStr += "if (this.picture !== undefined && this.picture != null) {\n";
			commandStr += "this.picture._targetX = this.x;\n";
			commandStr += "this.picture._targetY = this.y;\n";
			commandStr += "this.picture._targetScaleX = this.scaleX;\n";
			commandStr += "this.picture._targetScaleY = this.scaleY;\n";
			commandStr += "this.picture._targetOpacity = this.opacity;\n";
			commandStr += "this.picture._angle = this.angle;\n";
			commandStr += "this.picture._blendMode = this.blendMode;\n";
			commandStr += "this.picture.tint(this.color, 1);\n";
			commandStr += "this.picture.widthId = this.cellX\n";
			commandStr += "this.picture.heightId = this.cellY\n";
			commandStr += "this.pictureManager.draw(this.picture);\n";	// TODO: pictureManagerの扱いはどうする？ 集約している元クラスが持って、集約される側は持たないものか？
			commandStr += "}\n";
			funcStr = getFuncStr(className, draw_func_name, "", commandStr, superClassName, true);
			console.log(funcStr);
			eval(funcStr);
			funcList.push(draw_func_name);
		}

		// 解放関数を自動生成する
		if (!funcList.includes(release_func_name)) {
			commandStr = "";
			commandStr += "if (this.picture !== undefined && this.picture != null) {\n";
			commandStr += "this.pictureManager.delete(this.picture);\n";	// TODO: pictureManagerの扱いはどうする？ 集約している元クラスが持って、集約される側は持たないものか？
			commandStr += "this.picture = null;\n";
			commandStr += "}\n";
			funcStr = getFuncStr(className, release_func_name, "", commandStr, superClassName, true);
			console.log(funcStr);
			eval(funcStr);
			funcList.push(release_func_name);
		}

	});

};

