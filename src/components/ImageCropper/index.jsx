import Taro, { Component } from "@tarojs/taro";
import { View, Canvas } from "@tarojs/components";
import "./index.scss";
export default class ImageCropper extends Component {
	static defaultProps = {
		imgSrc: "", //图片路径
		cut_ratio: 0.5, //裁剪框的 宽/高 比
	};
	constructor(props) {
		super(props);
		this.state = {
			imgSrc: props.imgSrc,
			cut_ratio: props.cut_ratio, //裁剪框的 宽/高 比
			_img_height: 0, //图片的高度
			_img_width: 0, //图片的宽度
			_img_ratio: 1, //图片的 宽/高 比
			_img_left: 0, //图片相对可使用窗口的左边距
			_img_top: 0, //图片相对可使用窗口的上边距
			_window_height: 0, //可使用窗口的高度
			_window_width: 0, //可使用窗口宽度
			_canvas_width: 0, //canvas的宽度
			_canvas_height: 0, //canvas的高度
			_cut_width: 200, //裁剪框的宽度
			_cut_height: 200, //裁剪框的高度
			_cut_left: 0, //裁剪框相对可使用窗口的左边距
			_cut_top: 0, //裁剪框相对可使用窗口的上边距
		};
	}
	async componentWillMount() {
		this.initCanvas();
		await this.getDeviceInfo();
		await this.initImageInfo();
		await this.computedCutSize();
		await this.computedCutDistance();
		await this.computedImageSize();
		await this.computedImageDistance();
	}
	/**
	 *  获取canvas上下文
	 */
	initCanvas() {
		this.ctx = Taro.createCanvasContext("canvas", this);
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
					imgSrc,
					_img_height: height,
					_img_width: width,
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
					_img_height,
					_img_width,
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
					_img_left,
					_img_top,
				},
				resolve
			);
		});
	}

	/**
	 *  图片的点击，移动，移动结束事件
	 */
	_img_touch_start(e) {
		console.log(e, "e");
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
			_window_height,
			_window_width,
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
						width: _img_width + "px",
						height: _img_height + "px",
						top: _img_top + "px",
						left: _img_left + "px",
					}}
					onTouchStart={this._img_touch_start}
					onTouchMove={this._img_touch_move}
					onTouchEnd={this._img_touch_end}
				/>
				<Canvas canvasId="canvas" disableScroll={false}></Canvas>
			</View>
		);
	}
}
