import Taro, { Component } from "@tarojs/taro";
import { View, Canvas } from "@tarojs/components";
import "./index.scss";
export default class ImageCropper extends Component {
	render() {
		return (
			<View className="image-cropper-wrapper">
				<Canvas canvasId="canvas" disableScroll={false}></Canvas>
			</View>
		);
	}
}
