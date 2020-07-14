import Taro, { Component } from "@tarojs/taro";
import { View, Canvas, Image } from "@tarojs/components";
import "./index.scss";
function throttle(fn, threshold = 1000 / 40, context = null) {
	let _lastExecTime = null;
	return function(...args) {
		let _nowTime = new Date().getTime();
		if (_nowTime - Number(_lastExecTime) > threshold || !_lastExecTime) {
			fn.apply(context, args);
			_lastExecTime = _nowTime;
		}
	};
}
export default class ImageCropper extends Component {
	static defaultProps = {
		imgSrc: "", //图片路径
		cut_ratio: 0.5, //裁剪框的 宽/高 比
		destWidth: null, //要导出的图片的宽度
		img_height: null, //图片的高度
		img_width: null, //图片的宽度
		img_left: null, //图片相对可使用窗口的左边距
		img_top: null, //图片相对可使用窗口的上边距
	};
	//触摸事件的相对位置
	_img_touch_relative = [
		{
			x: 0,
			y: 0,
		},
		{
			x: 0,
			y: 0,
		},
	];

	// 斜边长
	_hypotenuse_length = 0;
	constructor(props) {
		super(props);
		this.state = {
			imgSrc: props.imgSrc,
			cut_ratio: Number(props.cut_ratio), //裁剪框的 宽/高 比
			_img_height: 0, //图片的高度
			_img_width: 0, //图片的宽度
			_img_ratio: 1, //图片的 宽/高 比
			_img_left: 0, //图片相对可使用窗口的左边距
			_img_top: 0, //图片相对可使用窗口的上边距
			_window_height: 0, //可使用窗口的高度
			_window_width: 0, //可使用窗口宽度
			_canvas_width: 0, //canvas的宽度
			_canvas_height: 0, //canvas的高度
			_canvas_left: 0, //canvas相对可使用窗口的左边距
			_canvas_top: 0, //canvas相对可使用窗口的上边距
			_cut_width: 200, //裁剪框的宽度
			_cut_height: 200, //裁剪框的高度
			_cut_left: 0, //裁剪框相对可使用窗口的左边距
			_cut_top: 0, //裁剪框相对可使用窗口的上边距
			scale: Number(props.scale) || 1, //默认图片的放大倍数
			angle: Number(props.angle) || 0, //图片旋转角度
			quality: 1, //图片的质量
			max_scale: 2,
			min_scale: 0.5,
		};
		// const { platform } = Taro.getSystemInfoSync();
		// // 安卓节流
		// if (platform === "android") {
		this._img_touch_move = throttle(this._img_touch_move, 1000 / 40, this);
		// }
	}
	async componentWillMount() {
		this.initCanvas();
		await this.getDeviceInfo();
		await this.computedCutSize();
		await this.computedCutDistance();
		await this.initImageInfo();
		await this.computedImageSize();
		await this.computedImageDistance();
	}
	/**
	 *  获取canvas上下文
	 */
	initCanvas() {
		this.ctx = Taro.createCanvasContext("my-canvas", this.$scope);
	}
	/**
	 * 获取设备屏幕的宽高
	 */
	async getDeviceInfo() {
		const { windowHeight, windowWidth } = await Taro.getSystemInfoSync();
		return new Promise((resolve) => {
			this.setState(
				{
					_window_height: windowHeight,
					_window_width: windowWidth,
				},
				resolve
			);
		});
	}
	/**
	 * 初始化图片信息
	 */
	async initImageInfo() {
		const { imgSrc } = this.state;
		const { width, height, path } = await Taro.getImageInfo({
			src: imgSrc,
		});
		return new Promise((resolve) => {
			this.setState(
				{
					imgSrc: path,
					// _img_height: height,
					// _img_width: width,
					_img_ratio: width / height,
				},
				resolve
			);
		});
	}
	/**
	 *  计算裁剪框的宽高
	 */
	computedCutSize() {
		const { _window_width, _window_height, cut_ratio } = this.state;
		//设裁剪框的框度为可使用窗口宽度的2/3
		let initial_cut_width = Math.floor((_window_width * 2) / 3);
		//则裁剪框的高度 = 宽度/_cut_ratio
		let initial_cut_height = initial_cut_width / cut_ratio;

		// 如果计算后的高度大于等于屏幕高度，则让裁剪框的高度等于可使用窗口的1/2
		if (initial_cut_height >= _window_height) {
			initial_cut_height = Math.floor(_window_height / 2);
			initial_cut_width = initial_cut_height * cut_ratio;
		}
		return new Promise((resolve) => {
			this.setState(
				{
					_cut_height: initial_cut_height,
					_cut_width: initial_cut_width,
				},
				resolve
			);
		});
	}
	/**
	 *  计算裁剪框距离可使用窗口的距离
	 */
	computedCutDistance() {
		const {
			_window_height,
			_window_width,
			_cut_height,
			_cut_width,
		} = this.state;
		const _cut_top = (_window_height - _cut_height) / 2; //因为裁剪框居中，所以可直接对半分
		const _cut_left = (_window_width - _cut_width) / 2;
		return new Promise((resolve) => {
			this.setState(
				{
					_cut_top,
					_cut_left,
				},
				resolve
			);
		});
	}
	/**
	 * 计算图片的宽高信息
	 * 让图片的长边铺满裁剪框
	 */
	computedImageSize() {
		const { _img_ratio, _cut_height, _cut_width } = this.state;
		let _img_width, _img_height;
		//宽比较长
		if (_img_ratio >= 1) {
			_img_width = _cut_width;
			_img_height = _img_width / _img_ratio;
		} else {
			// 高比较长
			_img_height = _cut_height;
			_img_width = _img_height * _img_ratio;
		}
		return new Promise((resovle) => {
			this.setState(
				{
					_img_height: Number(this.props.img_height) || _img_height,
					_img_width: Number(this.props.img_width) || _img_width,
				},
				resovle
			);
		});
	}

	/**
	 * 计算图片相对可使用窗口的距离
	 */
	computedImageDistance() {
		const {
			_img_width,
			_img_height,
			_window_height,
			_window_width,
		} = this.state;
		let _img_left, _img_top;
		_img_left = (_window_width - _img_width) / 2;
		_img_top = (_window_height - _img_height) / 2;
		return new Promise((resolve) => {
			this.setState(
				{
					_img_left: Number(this.props.img_left) || _img_left,
					_img_top: Number(this.props.img_top) || _img_top,
				},
				resolve
			);
		});
	}

	/**
	 *  图片的点击，移动，移动结束事件
	 */
	_img_touch_start(e) {
		this._touch_end_flag = false; //开始触摸
		if (e.touches.length === 1) {
			// 是否单指触摸
			this._touch_pointer_one = true;
			// 单指触摸
			// 记录下开始时的触摸点的位置
			this._img_touch_relative[0] = {
				//减去图片相对视口的位置，得到手指相对图片的左上角的位置x,y
				x: e.touches[0].clientX - this.state._img_left,
				y: e.touches[0].clientY - this.state._img_top,
			};
		} else {
			this._touch_pointer_one = false;
			//双指放大
			let width = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
			let height = Math.abs(e.touches[0].clientY - e.touches[1].clientY);

			this._hypotenuse_length = Math.sqrt(
				Math.pow(width, 2) + Math.pow(height, 2)
			);

			//双指旋转
			this._img_touch_relative = [
				{
					x:
						e.touches[0].clientX -
						this.state._img_left -
						this.state._img_width / 2,
					y:
						e.touches[0].clientY -
						this.state._img_top -
						this.state._img_height / 2,
				},
				{
					x:
						e.touches[1].clientX -
						this.state._img_left -
						this.state._img_width / 2,
					y:
						e.touches[1].clientY -
						this.state._img_top -
						this.state._img_height / 2,
				},
			];
		}
		console.log("开始", this._img_touch_relative);
	}

	_img_touch_move(e) {
		//如果结束触摸，则不再移动
		if (this._touch_end_flag) {
			console.log("结束false");
			return;
		}

		if (e.touches.length === 1 && this._touch_pointer_one) {
			// 单指拖动
			let left = e.touches[0].clientX - this._img_touch_relative[0].x;
			let top = e.touches[0].clientY - this._img_touch_relative[0].y;
			setTimeout(() => {
				this.setState({
					_img_left: left,
					_img_top: top,
				});
			}, 0);
		} else if (e.touches.length >= 2 && !this._touch_pointer_one) {
			//双指放大
			let width = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
			let height = Math.abs(e.touches[0].clientY - e.touches[1].clientY);

			let new_hypotenuse_length = Math.sqrt(
				Math.pow(width, 2) + Math.pow(height, 2)
			);
			//放大的倍数，等于现在的倍数*（现在两点的距离/上次两点间的距离）
			let newScale =
				this.state.scale *
				(new_hypotenuse_length / this._hypotenuse_length);
			//如果缩放倍数超过max_scale或是min_scale，则不变化，
			newScale =
				newScale > this.state.max_scale ||
				newScale < this.state.min_scale
					? this.state.scale
					: newScale;
			this._hypotenuse_length = new_hypotenuse_length;

			// 双指旋转
			let _new_img_touch_relative = [
				{
					x:
						e.touches[0].clientX -
						this.state._img_left -
						this.state._img_width / 2,
					y:
						e.touches[0].clientY -
						this.state._img_top -
						this.state._img_height / 2,
				},
				{
					x:
						e.touches[1].clientX -
						this.state._img_left -
						this.state._img_width / 2,
					y:
						e.touches[1].clientY -
						this.state._img_top -
						this.state._img_height / 2,
				},
			];
			// console.log(e.touches[1], "e.touches[1");
			// 第一根手指的旋转角度
			let first_atan_old =
				(180 / Math.PI) *
				Math.atan2(
					this._img_touch_relative[0].y,
					this._img_touch_relative[0].x
				);
			let first_atan =
				(180 / Math.PI) *
				Math.atan2(
					_new_img_touch_relative[0].y,
					_new_img_touch_relative[0].x
				);

			let first_deg = first_atan - first_atan_old;
			// 第二根手指的旋转角度
			let second_atan_old =
				(180 / Math.PI) *
				Math.atan2(
					this._img_touch_relative[1].y,
					this._img_touch_relative[1].x
				);

			let second_atan =
				(180 / Math.PI) *
				Math.atan2(
					_new_img_touch_relative[1].y,
					_new_img_touch_relative[1].x
				);
			let second_deg = second_atan - second_atan_old;
			// 当前的旋转角度
			let current_deg = 0;
			if (Math.abs(first_deg) > Math.abs(second_deg)) {
				current_deg = first_deg;
			} else {
				current_deg = second_deg;
			}
			// console.log(this._img_touch_relative[1], "img_touch_relative");
			this._img_touch_relative = _new_img_touch_relative;
			setTimeout(() => {
				this.setState(
					(prevState) => ({
						scale: newScale,
						angle: prevState.angle + current_deg,
					}),
					() => {
						// console.log(this.state.angle, "angle");
					}
				);
			}, 0);
		}
	}

	_img_touch_end() {
		this._touch_end_flag = true;
	}
	/**
	 * 导出图片的本地地址
	 */
	_getImg() {
		const { _cut_height, _cut_width, cut_ratio, quality } = this.state;
		return new Promise((resolve, reject) => {
			this._draw(() => {
				Taro.canvasToTempFilePath(
					{
						width: _cut_width,
						height: _cut_height,
						destWidth: this.props.destWidth || _cut_width,
						destHeight: this.props.destWidth
							? this.props.destWidth / cut_ratio
							: _cut_height,
						canvasId: "my-canvas",
						fileType: "png",
						quality: quality,
						success(res) {
							console.log(res, "成功");
							resolve(res);
						},
						fail(err) {
							console.log(err, "err");
							reject(err);
						},
					},
					this.$scope //不这样写会报错
				);
			});
		});
	}
	/**
	 * 绘制图片
	 */
	_draw(callback) {
		const {
			_cut_height,
			_cut_width,
			_cut_left,
			_cut_top,
			angle,
			scale,
			_img_width,
			_img_height,
			_img_left,
			_img_top,
			imgSrc,
		} = this.state;

		this.setState(
			{
				_canvas_height: _cut_height,
				_canvas_width: _cut_width,
				_canvas_left: _cut_left,
				_canvas_top: _cut_top,
			},
			() => {
				// 用户移动旋转放大后的图像大小thu
				let img_width = _img_width * scale;
				let img_height = _img_height * scale;
				// 图片和裁剪框的相对距离
				let distX =
					_img_left - (_img_width * (scale - 1)) / 2 - _cut_left;
				let distY =
					_img_top - (_img_height * (scale - 1)) / 2 - _cut_top;
				console.log(this.ctx, "ctx前");

				// 根据图像的旋转角度，旋转画布的坐标轴,
				//为了旋转中心在图片的中心，需要先移动下画布的坐标轴
				this.ctx.translate(
					distX + img_width / 2,
					distY + img_height / 2
				);
				this.ctx.rotate((angle * Math.PI) / 180);
				this.ctx.translate(
					-distX - img_width / 2,
					-distY - img_height / 2
				);
				console.log(this.ctx, "ctx");
				//根据相对距离移动画布的原点
				this.ctx.translate(distX, distY);

				// 绘制图像

				this.ctx.drawImage(imgSrc, 0, 0, img_width, img_height);
				this.ctx.draw(false, () => {
					console.log("云心");

					callback && callback();
				});
			}
		);
	}

	render() {
		const {
			_cut_width,
			_cut_height,
			imgSrc,
			_img_height,
			_img_width,
			_img_left,
			_img_top,
			scale,
			angle,
			_canvas_height,
			_canvas_width,
			_canvas_left,
			_canvas_top,
		} = this.state;
		return (
			<View className="image-cropper-wrapper">
				<View className="bg_container">
					<View className="bg_top"></View>
					<View className="bg_middle">
						<View className="bg_middle_left"></View>
						<View
							className="cut_wrapper"
							style={{
								width: _cut_width + "px",
								height: _cut_height + "px",
							}}
						>
							<View className="border border-top-left"></View>
							<View className="border border-top-right"></View>
							<View className="border border-right-top"></View>
							<View className="border border-bottom-right"></View>
							<View className="border border-right-bottom"></View>
							<View className="border border-bottom-left"></View>
							<View className="border border-left-bottom"></View>
							<View className="border border-left-top"></View>
						</View>
						<View className="bg_middle_right"></View>
					</View>
					<View className="bg_bottom"></View>
				</View>
				<Image
					className="img"
					src={imgSrc}
					style={{
						width: _img_width * scale + "px",
						height: _img_height * scale + "px",
						top: _img_top - (_img_height * (scale - 1)) / 2 + "px",
						left: _img_left - (_img_width * (scale - 1)) / 2 + "px",
						// translate3d(${_img_left}px,${_img_top}px,0)
						transform: `rotate(${angle}deg) `,
					}}
					onTouchStart={this._img_touch_start}
					onTouchMove={this._img_touch_move}
					onTouchEnd={this._img_touch_end}
				/>
				<Canvas
					canvasId="my-canvas"
					className="my-canvas-class"
					disableScroll={false}
					style={{
						width: _canvas_width + "px",
						height: _canvas_height + "px",
						left: _canvas_left + "px",
						top: _canvas_top + "px",
					}}
				></Canvas>
			</View>
		);
	}
}
