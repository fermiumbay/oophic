/*:ja
 * @target MZ
 * @plugindesc ピクチャ管理を行うPictureManagerクラスを提供します。
 * @author フェルミウム湾
 *
 * @help PictureManager.js
 * 
 * @param every_cycle_refresh_flg
 * @text ピクチャ毎周期初期化フラグ
 * @type boolean
 * @desc ピクチャマネージャの管理対象としているピクチャを毎周期初期化します。
 * @default false
 */

(() => {
	// プラグイン名
	const pluginName = "PictureManager";

	// 特殊文字\S[n]追加フラグ
	var every_cycle_refresh_flg = PluginManager.parameters(pluginName)["every_cycle_refresh_flg"] === "true";
	
	// スクリーンオブジェクトの初期化関数をオーバーライド
	var Game_Screen_prototype_initialize = Game_Screen.prototype.initialize;
	Game_Screen.prototype.initialize = function() {
		// PictureManagerの管理対象とするピクチャ番号リスト
		Game_Screen_prototype_initialize.call(this);
		this.managedPictureIdList = [];
		this.pictureManagerList = [];
	};

	// TODO: ↓これを設定すれば、refreshPictureManagersしなくても常にリフレッシュしてくれる 必要なら入れればいいが、特に不要か
	// スクリーンオブジェクト更新のタイミングでPictureManager管理下のピクチャの参照を削除する
	var Scene_Map_prototype_updateMain = Scene_Map.prototype.updateMain;
	Scene_Map.prototype.updateMain = function() {
		// ピクチャに関連するスプライトを、分割数に応じて分割しておく
		for (var pictureId = 1; pictureId <= $gameScreen._pictures.length; pictureId++) {
			var picture = $gameScreen._pictures[pictureId];
			if (picture != null) {
				var sprite = SceneManager._scene._spriteset.children[2].children[pictureId - 1];
				if (sprite != null) {
					var bitmap = sprite.bitmap;
					if (bitmap != null && bitmap.isReady()) {
						sprite.setFrame(
							bitmap.width * picture.widthId / picture.divWidthNum,
							bitmap.height * picture.heightId / picture.divHeightNum,
							bitmap.width / picture.divWidthNum,
							bitmap.height / picture.divHeightNum
							);
					}
				}
			}
		}

		if (every_cycle_refresh_flg) {
			$gameScreen.refreshPictureManagers();
		}
		Scene_Map_prototype_updateMain.call(this);
	};

	Game_Screen.prototype.refreshPictureManagers = function() {
		this.managedPictureIdList.forEach(id => {
			this._pictures[id] = null;
		});
		this.pictureManagerList.forEach(pictureManager => {
			pictureManager.nowPictureId = pictureManager.minPictureId;
		});
	};

	Game_Screen.prototype.createPictureManager = function(minPictureId, maxPictureId) {
		// TODO: min～maxの範囲が、既に登録されているmanagedPictureIdListと被る場合はエラーとして登録しないこと

		var pictureManager = new PictureManager(minPictureId, maxPictureId);
		this.pictureManagerList.push(pictureManager);

		// TODO: for文をもっと効率的な書き方にかえる
		for (var i = minPictureId; i <= maxPictureId; i++) {
			this.managedPictureIdList.push(i);
		}
		this.pictureManagerList.push(pictureManager);

		return pictureManager;
	};

	Game_Screen.prototype.deletePictureManager = function(pictureManager) {
		for (var i = 0; i < this.pictureManagerList.length; i++) {
			if (pictureManager == this.pictureManagerList[i]) {
				this.managedPictureIdList = this.managedPictureIdList.filter(pictureId => pictureId < pictureManager.minPictureId || pictureId > pictureManager.maxPictureId);
				for (var j = pictureManager.minPictureId; j <= pictureManager.maxPictureId; j++) {
					this._pictures[j] = null;
				}
				this.pictureManagerList[i] = null;
				this.pictureManagerList.splice(i, 1);
				break;
			}
		}
	};

	var Game_Picture_prototype_initialize = Game_Picture.prototype.initialize;
	Game_Picture.prototype.initialize = function() {
		Game_Picture_prototype_initialize.call(this);

		// 横縦の分割数
		this.divWidthNum = 1;
		this.divHeightNum = 1;

		// 現在描画中の分割番号
		this.widthId = 0;
		this.heightId = 0;
	};
	
	Game_Picture.prototype.setDivNum = function(widthNum, heightNum) {
		this.divWidthNum = widthNum;
		this.divHeightNum = heightNum;
	};

	// コンストラクタ
	PictureManager = function(minPictureId, maxPictureId) {
		this.minPictureId = minPictureId;
		this.maxPictureId = maxPictureId;

		// 次回描画のピクチャ番号
		this.nowPictureId = minPictureId;

		// 管理中のピクチャオブジェクトリスト
		this.managedPictureList = [];
	};

	// ピクチャオブジェクト生成
	PictureManager.prototype.create = function(name, origin, x, y, scaleX, scaleY, opacity, blendMode, divWidthNum = 1, divHeightNum = 1) {
		if (this.managedPictureList.length >= this.maxPictureId - this.minPictureId + 1) {
			// 管理対象のピクチャ番号が上限にきているため生成失敗した
			console.log("PictureManager.create() ピクチャ番号が範囲を超過したため画像生成に失敗しました。");
			return null;
		}

    	// 新しい画像をロードして保持しておく
    	var picture = new Game_Picture();
    	picture.show(name, origin, x, y, scaleX, scaleY, opacity, blendMode);
		picture.setDivNum(divWidthNum, divHeightNum);

		// 管理対象のピクチャ番号数を加算する
		this.managedPictureList.push(picture);

		// 生成したピクチャオブジェクトを返却する
		return picture;
	};

	// ピクチャオブジェクト描画
	PictureManager.prototype.draw = function(picture) {
		if (this.nowPictureId > this.maxPictureId) {
			console.log("PictureManager.draw() 描画ピクチャ数が上限を超えたため描画に失敗しました。");
			return false;
		} else {
			$gameScreen._pictures[this.nowPictureId] = picture;
			this.nowPictureId++;
		}
		return true;
	};

	// ピクチャオブジェクト解放(本関数の実行後、もとのpictureもnullにする)
	PictureManager.prototype.delete = function(picture) {
		for (var i = 0; i < this.managedPictureList.length; i++) {
			if (picture == this.managedPictureList[i]) {
				this.managedPictureList[i] = null;
				this.managedPictureList.splice(i, 1);
				break;
			}
		}
	};

	PictureManager.getForwardPictures = function(pictures) {
		var ret = Array.from(pictures);
		ret.sort(function(a, b) {
			return a._targetY - b._targetY;
		})
		return ret;
	};
})();

