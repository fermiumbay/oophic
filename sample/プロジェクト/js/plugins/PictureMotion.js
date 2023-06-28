//=============================================================================
// PictureMotion（ピクチャモーション）
// by フェルミウム湾
//=============================================================================

/*:
 * @plugindesc ピクチャモーションプラグイン
 * 任意のパターンでピクチャの移動を行います。
 * @author フェルミウム湾
 * 
 * @help ピクチャの移動を好きなパターンで行うプラグインです。
 * 通常のピクチャの移動は線形に移動しますが、
 * 本プラグイン導入によって様々なパターンで移動出来るようになります。
 * サンプルとしていくつかのパターンが予め搭載されていますが、
 * スクリプトを利用することによって、新規のパターンを自由に作成出来ます。
 * 
 * ピクチャの移動を行う前に、パターンをプラグインコマンドで指定します。
 * 例えば、x座標, y座標ともにスムーズに動かす場合は、
 * 次のようにイベントコマンドを設定します。
 * 
 * ◆プラグインコマンド：モーション_位置x smooth
 * ◆プラグインコマンド：モーション_位置y smooth
 * ピクチャの移動：～～～
 *
 * モーションパターンをプラグインで指定すると、その後のすべての
 * ピクチャの移動コマンドにおいて、指定した移動パターンが採用されます。
 * 初期化する（すべて線形に戻す）際には次のコマンドを指定します。
 * 
 * ◆プラグインコマンド：モーション_初期化
 * 
 * モーションパターンを指定可能なパラメータは、次の5つです。
 * 位置x, 位置y, 拡大率x, 拡大率y, 不透明度
 * 
 * 
 * ======================================================================
 * コマンド『モーション_初期化』
 * コマンド『Motion_Initialize』
 * --------------------------------------------------------
 * モーションを初期化し、すべて線形移動に戻します。
 * ======================================================================
 * コマンド『モーション_位置x』
 * コマンド『Motion_patternX』
 * --------------------------------------------------------
 * 座標xのモーションパターンを変更します。
 * --------------------------------------------------------
 * 引数1）変更するモーションパターンの名前
 * 引数2以降）モーションパターンで使用するパラメータの指定
 * ======================================================================
 * コマンド『モーション_位置y』
 * コマンド『Motion_patternY』
 * --------------------------------------------------------
 * 座標yのモーションパターンを変更します。
 * --------------------------------------------------------
 * 引数1）変更するモーションパターンの名前
 * 引数2以降）モーションパターンで使用するパラメータの指定
 * ======================================================================
 * コマンド『モーション_拡大率x』
 * コマンド『Motion_patternScaleX』
 * --------------------------------------------------------
 * 拡大率xのモーションパターンを変更します。
 * --------------------------------------------------------
 * 引数1）変更するモーションパターンの名前
 * 引数2以降）モーションパターンで使用するパラメータの指定
 * ======================================================================
 * コマンド『モーション_拡大率y』
 * コマンド『Motion_patternScaleY』
 * --------------------------------------------------------
 * 拡大率yのモーションパターンを変更します。
 * --------------------------------------------------------
 * 引数1）変更するモーションパターンの名前
 * 引数2以降）モーションパターンで使用するパラメータの指定
 * ======================================================================
 * コマンド『モーション_不透明度』
 * コマンド『Motion_patternOpacity』
 * --------------------------------------------------------
 * 不透明度のモーションパターンを変更します。
 * --------------------------------------------------------
 * 引数1）変更するモーションパターンの名前
 * 引数2以降）モーションパターンで使用するパラメータの指定
 * ======================================================================
 * 
 * -----------------------------------
 * ★ サンプルパターン ★
 * -----------------------------------
 * 「linear」線形
 * 
 * 通常の移動です。
 * -----------------------------------
 * 「smooth」スムーズな移動
 * 
 * sin関数を使ったスムーズな移動です。
 * 引数不要で、線形よりは滑らかな移動が行えます。
 * -----------------------------------
 * 「jump p1」放物線
 * 
 * 放物線移動をします。ジャンプを実現出来ます。
 * 引数p1にはジャンプ頂点の高さを相対的に指定します。
 * 例）
 * y座標 300 から y座標 300 へのジャンプ移動で、
 * 途中y座標 100 になるまでジャンプする場合、
 * jump -200 を指定します。
 * -----------------------------------
 * 「triangle p1」三角波
 * 
 * 三角波移動をします。ジャンプ移動が線形になったものです。
 * 引数p1にはジャンプ頂点の高さを相対的に指定します。
 * 例）
 * y座標 300 から y座標 300 へのジャンプ移動で、
 * 途中y座標 100 になるまでジャンプする場合、
 * triangle -200 を指定します。
 * -----------------------------------
 * 「bezier p1 p2」ベジエ曲線
 * 
 * ベジエ曲線移動をします。
 * ベジエ曲線には4つの制御点が必要ですが、それぞれ順番に
 * 移動前座標, 引数p1, 引数p2, 移動後座標 の値となります。
 * jumpやtriangleと異なり、相対的な値ではなく
 * 絶対座標を指定することに注意してください。
 * 例）
 * y座標 600 から y座標 600 へのベジエ曲線移動で、
 * 制御点座標値を 600, 0, 550, 660 にするには
 * bezier 0 550 を指定します。
 * -----------------------------------
 * 「wave p1 p2」振動
 * 
 * 振動します。引数p1は振幅a, 引数p2は周波数fとなり、
 * y = asin(2πft) （0≦t≦1）の振動を行います。
 * 周波数は整数値またはその半分の値を指定すると、
 * 端から端までの連続な振動になります。
 * 例）
 * 振幅200, 周波数1.5にするには
 * wave 200 1.5 を指定します。
 * -----------------------------------
 * 「damped p1 p2 p3 p4 p5」減衰振動
 * 
 * 減衰振動します。引数p1～p4をそれぞれ定数a, b, c, dとして
 * y = ae^(-bt)sin(ct + d) の振動を行います。
 * ピクチャ移動が完了する頃に減衰が止まるものと判断するために
 * 振動が引数p5以下まで減衰したら終了というように指定します。
 * 上式のtは減衰までの時間によって伸縮します。
 * aは振幅、bは減衰スピード、cは振動スピード、dは位相に相当します。
 * 例）
 * damped 200 -0.3 4 0 50 を指定すると、3周期で振動します。
 * -----------------------------------
 * 「spline p1 p2 p3 ...」スプライン補間
 * 
 * 与えられた座標を滑らかに補間しながら始点から終点まで移動します。
 * 要は滑らかに好きなようにピクチャを移動出来るということです。
 * このコマンドにおいては、ピクチャの移動前と移動後の値を使用しません。
 * 引数p1, p2, p3, ……に順に通過点を入れてください。
 * 例）
 * x座標を0～815の線形にし、y座標はスプライン補間で
 * spline 623 100 500 300 500 0 623 として指定すれば、
 * 移動前(0, 623)から順に
 * (815／6, 100), 
 * (815／6×2, 500), 
 * (815／6×3, 300), 
 * (815／6×4, 500), 
 * (815／6×5, 0), 
 * (815, 623) の点をそれぞれ通ります。
 * -----------------------------------
 * 
 * 
 * ======================================================================
 * 
 * すべてのモーションパターンはcurveFunctionsオブジェクトに格納されます。
 * モーションパターンを自作するには、curveFunctionsの持つ
 * 連想配列funcに、モーション名を添えて関数を代入してください。
 * 例えば、線形移動とまったく逆方向に動くパターンは
 * 下記のようにスクリプトとして作成します。
 * 
 * curveFunctions.func["reverse"] = function(){
 *     return function(y1, y2, t) {
 *         return this.linear(y2, y1, t);
 *     };
 * };
 * 
 * モーションのパラメータを指定する場合は、最も外側のfunctionに
 * 引数として与えてください。移動関数はその戻り値として与えます。
 * 移動関数の引数は(y1, y2, t)で決まっており、それぞれ
 * 移動前の値、移動後の値、移動時間の割合（0≦t≦1）となっています。
 * 線形移動の関数としてlinear(y1, y2, t)だけは予め登録されているので、
 * 自作の際にはよく使われることから、活用してください。
 * 上記のように登録を終えると、プラグインコマンドから実行可能です。
 * 
 * ======================================================================
 * 
 * 【利用規約】
 *  どうでもいいです。著作権を放棄するので勝手にぐちゃぐちゃにしてください。
 *  改変も再配布も、アダルト利用も構いません。連絡も不要です。
 * 
 * -------------------
 * 2017/2/27追記：説明書の誤字を訂正しました。
 */

(function() {

	//-----------------------------------------------------------------------------
	// 【曲線関数の取りまとめオブジェクト】CurveFunctions
	//-----------------------------------------------------------------------------

	// 曲線関数の取りまとめ
	CurveFunctions = function(){

		// 曲線関数たち
		this.func = new Array();

		// 線形
		this.linear = function(y1, y2, t) {
			return y1 + (y2 - y1) * t;
		};

		// 線形
		this.func["linear"] = function(){
			return this.linear;
		};

		// sinっぽいスムーズな形
		this.func["smooth"] = function(){
			return function(y1, y2, t) {
				return y1 + (t - 1 / (2 * Math.PI) * Math.sin(2 * Math.PI * t)) * (y2 - y1);
			};
		};

		// 放物線
		this.func["jump"] = function(h){
			return function(y1, y2, t){
				return this.linear(y1, y2, t) + h - 4 * h * (t - 1 / 2) * (t - 1 / 2);
			};
		};

		// 三角波
		this.func["triangle"] = function(h){
			return function(y1, y2, t) {
				return this.linear(y1, y2, t) + h * (1 - 2 * Math.abs(t - 1 / 2));
			};
		};

		// ベジエ曲線（制御点: y1, p1, p2, y2）
		this.func["bezier"] = function(p1, p2){
			return function(y1, y2, t){
				return (1 - t) * ((1 - t) * ((1 - t) * y1 + 3 * t * p1) + 3 * t * t * p2) + t * t * t * y2;
			};
		};

		// 振動 y＝asin(2πft)
		this.func["wave"] = function(a, f){
			return function(y1, y2, t){
				return this.linear(y1, y2, t) + a * Math.sin(2 * Math.PI * f * t);
			};
		};

		// 減衰振動 y＝ae^(-bt)sin(ct＋d) 振動がdelta以下になったら終了
		this.func["damped"] = function(a, b, c, d, delta){
			var tmax;
			if(a == 0 || (c == 0 && d == 0)){
				tmax = 1;
			}
			else if(b == 0){
				tmax = 1;
			}
			else if(c == 0){
				tmax = 1 / b * Math.log(Math.abs(a * sin(d)) / delta);
			}
			else{
				var nmax = Math.ceil(1 / Math.PI * (c / b * Math.log(Math.abs(a) / delta) + d));
				tmax = (nmax * Math.PI - d) / c;
			};
			return function(y1, y2, t){
				return this.linear(y1, y2, t) + a * Math.exp(-b * t * tmax) * Math.sin(c * t * tmax + d);
			};
		};

		// スプライン補間（始点・終点を含む補間点を可変長引数で与える y1, y2は使わない）
		this.func["spline"] = function(){
			var a = new Array(n);
			var b = new Array(n);
			var c = new Array(n);
			var d = new Array(n);
			var n = arguments.length - 1;
			var h = 1 / n;
			var v = new Array(n - 1);
			var u = new Array(n + 1);
			var y = arguments;

			// 三重対角行列を解く
			(function() {
				var a = new Array(n - 1);
				var b = new Array(n - 1);
				var c = new Array(n - 1);
				for(var i = 0; i < n - 1; i++){
					if(i > 0) c[i] = -h;
					a[i] = 4 * h;
					if(i < n - 2) b[i] = -h;
					v[i] = 6 * (y[i + 2] - 2 * y[i + 1] + y[i]) / h;
				}
				var p = new Array(n - 1);
				var q = new Array(n - 1);
				p[0] = b[0] / a[0];
				q[0] = v[0] / a[0];
				for(var i = 1; i < n - 1; i++){
					if(i < n - 2) p[i] = b[i] / (a[i] - c[i] * p[i - 1]);
					q[i] = (v[i] + c[i] * q[i - 1]) / (a[i] - c[i] * p[i - 1]);
				}
				u[0] = 0;
				u[n] = 0;
				u[n - 1] = q[n - 2];
				for(var i = n - 2; i >= 1; i--){
					u[i] = p[i - 1] * u[i + 1] + q[i - 1];
				}
			})();

			// 各係数の計算
			for(var i = 0; i < n; i++){
				a[i] = (u[i + 1] - u[i]) / (6 * h);
				b[i] = u[i] / 2;
				c[i] = (y[i + 1] - y[i]) / h - 1 / 6 * h * (2 * u[i] + u[i + 1]);
				d[i] = y[i];
			}
			return function(y1, y2, t){
				var id = Math.floor(t * n);
				if(id >= n) id = n - 1;
				var t0 = id / n;
				return (t - t0) * ((t - t0) * ((t - t0) * a[id] + b[id]) + c[id]) + d[id];
			};
		};

		// パターンの初期化（全部線形）
		this.initialize = function(){
			this.patternX = this.func["linear"].apply(this, null);
			this.patternY = this.func["linear"].apply(this, null);
			this.patternScaleX = this.func["linear"].apply(this, null);
			this.patternScaleY = this.func["linear"].apply(this, null);
			this.patternOpacity = this.func["linear"].apply(this, null);
		};

		// パラメータを設定してパターンを生成
		this.getPattern = function(name, args){

			// 全部数値に変換する
			args = args.map(
				function (e) {
					return Number(e);
				}
			);

			return this.func[name].apply(curveFunctions, args);
		};

		this.initialize();
	};
	curveFunctions = new CurveFunctions();

	//-----------------------------------------------------------------------------
	// Game_Pictureの書き換え（ピクチャの移動を任意のパターンに変更）
	//-----------------------------------------------------------------------------

	// ピクチャの初期化の書き換え
	var _Game_Picture_prototype_initBasic = Game_Picture.prototype.initBasic;
	Game_Picture.prototype.initBasic = function() {
		_Game_Picture_prototype_initBasic.call(this);
		this._patternX = curveFunctions.patternX;
		this._patternY = curveFunctions.patternY;
		this._patternScaleX = curveFunctions.patternScaleX;
		this._patternScaleY = curveFunctions.patternScaleY;
		this._patternOpacity = curveFunctions.patternOpacity;
	};

	// ピクチャの移動の書き換え
	var _Game_Picture_prototype_move = Game_Picture.prototype.move;
	Game_Picture.prototype.move = function(origin, x, y, scaleX, scaleY, opacity, blendMode, duration) {
		_Game_Picture_prototype_move.call(this, origin, x, y, scaleX, scaleY, opacity, blendMode, duration);
		this._prev_x = this._x;
		this._prev_y = this._y;
		this._prev_scaleX = this._scaleX;
		this._prev_scaleY = this._scaleY;
		this._prev_opacity = this._opacity;
		this._prev_duration = this._duration;
		this._patternX = curveFunctions.patternX;
		this._patternY = curveFunctions.patternY;
		this._patternScaleX = curveFunctions.patternScaleX;
		this._patternScaleY = curveFunctions.patternScaleY;
		this._patternOpacity = curveFunctions.patternOpacity;
	};

	// ピクチャの移動処理の書き換え
	Game_Picture.prototype.updateMove = function() {
		if (this._duration > 0) {
			var t = 1 - (this._duration - 1) / this._prev_duration;
			this._x = this._patternX.call(curveFunctions, this._prev_x, this._targetX, t);
			this._y = this._patternY.call(curveFunctions, this._prev_y, this._targetY, t);
			this._scaleX  = this._patternScaleX.call(curveFunctions, this._prev_scaleX, this._targetScaleX, t);
			this._scaleY  = this._patternScaleY.call(curveFunctions, this._prev_scaleY, this._targetScaleY, t);
			this._opacity = this._patternOpacity.call(curveFunctions, this._prev_opacity, this._targetOpacity, t);
			this._duration--;
		}
		if (this._duration == 0) {
			this._x = this._targetX;
			this._y = this._targetY;
			this._scaleX  = this._targetScaleX;
			this._scaleY  = this._targetScaleY;
			this._opacity = this._targetOpacity;
		}
	};

	//-----------------------------------------------------------------------------
	// プラグインコマンド
	//-----------------------------------------------------------------------------

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args){
		_Game_Interpreter_pluginCommand.call(this, command, args);

		switch(command){
			case "モーション_初期化":
			case "Motion_Initialize":
				curveFunctions.initialize();
				break;

			case "モーション_位置x":
			case "Motion_patternX":
				curveFunctions.patternX = curveFunctions.getPattern(args[0], args.slice(1));
				break;

			case "モーション_位置y":
			case "Motion_patternY":
				curveFunctions.patternY = curveFunctions.getPattern(args[0], args.slice(1));
				break;

			case "モーション_拡大率x":
			case "Motion_patternScaleX":
				curveFunctions.patternScaleX = curveFunctions.getPattern(args[0], args.slice(1));
				break;

			case "モーション_拡大率y":
			case "Motion_patternScaleY":
				curveFunctions.patternScaleY = curveFunctions.getPattern(args[0], args.slice(1));
				break;

			case "モーション_不透明度":
			case "Motion_patternOpacity":
				curveFunctions.patternOpacity = curveFunctions.getPattern(args[0], args.slice(1));
				break;

		}
	};
})();
