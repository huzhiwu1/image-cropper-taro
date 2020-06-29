import Taro, { Component } from '@tarojs/taro';
import { View, Canvas } from '@tarojs/components';
import './index.scss';
export default class ImageCropper extends Component {
	static defaultProps = {
		imgSrc: '', //图片路径
	};
	constructor(props) {
		super(props);
		this.state = {
			imgSrc: props.imgSrc,
			_img_height: 0, //图片的高度
			_img_width: 0, //图片的宽度
			_img_ratio: 1, //图片的 高/宽 比
			_window_height: 0, //可使用窗口的高度
			_window_width: 0, //可使用窗口宽度
			_canvas_width: 0, //canvas的宽度
			_canvas_height: 0, //canvas的高度
			_cut_width: 200, //裁剪框的宽度
			_cut_height: 200, //裁剪框的高度
		};
	}
	/**
	 *  获取canvas上下文
	 */
	initCanvas() {
		this.ctx = Taro.createCanvasContext('canvas', this);
	}
	/**
	 * 获取设备屏幕的宽高
	 */
	async getDeviceInfo() {
		const { windowHeight, windowWidth } = await Taro.getSystemInfoSync();
		this.setState({
			_window_height: windowHeight,
			_window_width: windowWidth,
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

		this.setState({
			imgSrc,
			_img_height: height,
			_img_width: width,
			_img_ratio: height / width,
		});
	}
	render() {
		const { _cut_width, _cut_height } = this.state;
		return (
			<View className='image-cropper-wrapper'>
				<View className='bg_container'>
					<View className='bg_top'></View>
					<View className='bg_middle'>
						<View className='bg_middle_left'></View>
						<View
							className='cut_wrapper'
							style={{ width: _cut_width + 'px', height: _cut_height + 'px' }}
						>
							<View className='border border-top-left'></View>
							<View className='border border-top-right'></View>
							<View className='border border-right-top'></View>
							<View className='border border-bottom-right'></View>
							<View className='border border-right-bottom'></View>
							<View className='border border-bottom-left'></View>
							<View className='border border-left-bottom'></View>
							<View className='border border-left-top'></View>
						</View>
						<View className='bg_middle_right'></View>
					</View>
					<View className='bg_bottom'></View>
				</View>

				<Canvas canvasId='canvas' disableScroll={false}></Canvas>
			</View>
		);
	}
}
