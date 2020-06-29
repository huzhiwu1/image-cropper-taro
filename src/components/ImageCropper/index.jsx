import Taro, { Component } from "@tarojs/taro";
import { View, Canvas } from "@tarojs/components";
import "./index.scss";
export default class ImageCropper extends Component {
	static defaultProps = {
		imgSrc: "", //图片路径
	};
	constructor(props) {
		super(props);
		this.state = {
			imgSrc: props.imgSrc,
			_img_height: 0,
			_img_width: 0,
		};
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
		});
	}
	render() {
		return (
			<View className="image-cropper-wrapper">
				<Canvas canvasId="canvas" disableScroll={false}></Canvas>
			</View>
		);
	}
}
